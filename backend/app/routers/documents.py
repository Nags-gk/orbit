"""
Document router — Multimodal AI transaction extraction.
"""
from __future__ import annotations
from datetime import date
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks

from ..database import async_session
from ..models import Transaction, TransactionType, TransactionCategory, User, Document
from ..services.security import get_current_user
from ..services.document_analyzer import analyze_financial_document

router = APIRouter(prefix="/api/documents", tags=["documents"])

# Supported formats for the AI Agent
SUPPORTED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "text/csv",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", # xslx
}

# The Gemini extraction logic is no longer a background task, it returns to the frontend directly.


@router.get("/status")
async def document_status():
    """Returns capabilities of the intelligent Document Agent."""
    return {
        "pdfSupport": True,
        "supportedFormats": ["pdf", "jpg", "png", "webp", "csv", "xlsx"],
        "message": "AI Document processing active and ready.",
    }


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a financial document for intelligent multimodal transaction extraction via Gemini.
    
    Accepts PDFs, Images, and Spreadsheets. Returns extracted transactions for user confirmation.
    """
    mime_type = file.content_type
    
    if not mime_type or mime_type not in SUPPORTED_MIME_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type '{mime_type}'. Please upload PDF, images (JPG/PNG), or CSV/Excel."
        )

    # Read file directly into RAM for the AI prompt
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:  # Expanded to 20MB for high-res images/scans
        raise HTTPException(status_code=400, detail="File too large (max 20MB allowed)")

    # Run Gemini synchronously so the frontend can display the results to the user
    try:
        transactions = analyze_financial_document(file_bytes=contents, mime_type=mime_type)
        
        return {
            "filename": file.filename,
            "pageCount": 1,
            "textLength": len(contents),
            "transactions": transactions,
            "transactionCount": len(transactions),
            "message": f"Successfully extracted {len(transactions)} transactions via AI Agent.",
        }
    except Exception as e:
        error_msg = str(e)
        if "GEMINI_API_KEY" in error_msg:
            raise HTTPException(status_code=500, detail="Gemini API Key missing. Please set GEMINI_API_KEY in the backend .env file.")
        raise HTTPException(status_code=500, detail=f"AI Agent failed to parse document: {error_msg}")


@router.post("/confirm")
async def confirm_transactions(
    transactions: list[dict],
    current_user: User = Depends(get_current_user)
):
    """
    Legacy catch: Save confirmed extracted transactions to the database.
    """
    saved = []
    async with async_session() as db:
        for tx_data in transactions:
            try:
                # Map category string to enum
                cat_str = tx_data.get("category", "Shopping")
                try:
                    category = TransactionCategory(cat_str)
                except ValueError:
                    category = TransactionCategory.Shopping

                type_str = tx_data.get("type", "expense")
                tx_type = TransactionType.income if type_str == "income" else TransactionType.expense

                tx = Transaction(
                    user_id=current_user.id,
                    description=tx_data.get("description", "Imported transaction"),
                    amount=float(tx_data.get("amount", 0)),
                    category=category,
                    type=tx_type,
                    date=date.fromisoformat(tx_data["date"]) if "date" in tx_data else date.today(),
                )
                db.add(tx)
                saved.append(tx_data)
            except Exception:
                continue  # Skip invalid transactions

        await db.commit()

    return {
        "saved": len(saved),
        "transactions": saved,
        "message": f"Successfully saved {len(saved)} transactions",
    }


@router.post("/compare")
async def compare_documents(
    files: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload 2-5 financial documents for comparative spending analysis.
    
    Extracts transactions from each document and compares spending patterns,
    identifies trends, anomalies, and generates insights.
    """
    from ..services.document_comparator import compare_document_extractions, generate_narrative_summary
    
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Please upload at least 2 documents to compare.")
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 documents can be compared at once.")
    
    doc_extractions = []
    
    for file in files:
        mime_type = file.content_type
        if not mime_type or mime_type not in SUPPORTED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type '{mime_type}' for file '{file.filename}'. Please upload PDF, images (JPG/PNG), or CSV/Excel."
            )
        
        contents = await file.read()
        if len(contents) > 20 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File '{file.filename}' too large (max 20MB allowed)")
        
        try:
            transactions = analyze_financial_document(file_bytes=contents, mime_type=mime_type)
            doc_extractions.append({
                "filename": file.filename or f"Document {len(doc_extractions) + 1}",
                "transactions": transactions,
                "transactionCount": len(transactions),
            })
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to extract transactions from '{file.filename}': {str(e)}"
            )
    
    # Run the comparison engine
    comparison = compare_document_extractions(doc_extractions)
    
    # Try to generate a narrative summary via Gemini
    narrative = generate_narrative_summary(comparison)
    if narrative:
        comparison["narrative"] = narrative
    
    return comparison

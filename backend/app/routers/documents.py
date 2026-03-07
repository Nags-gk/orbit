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

async def process_document_task(contents: bytes, filename: str, mime_type: str, user_id: str):
    """Background task to extract text, index for RAG, and auto-save transactions via Gemini."""
    try:
        # We don't need local text extraction anymore, Gemini reads the file directly!
        
        # 1. Ask Gemini to extract pristine structured dictionary transactions
        transactions = analyze_financial_document(file_bytes=contents, mime_type=mime_type)
        print(f"Gemini Analyzer extracted {len(transactions)} from {filename}")

        if not transactions:
            return
            
        # 2. Extract transactions and auto-save securely to Database
        async with async_session() as db:
            for tx_data in transactions:
                try:
                    cat_str = tx_data.get("category", "Shopping")
                    try:
                        category = TransactionCategory(cat_str)
                    except ValueError:
                        category = TransactionCategory.Shopping

                    type_str = tx_data.get("type", "expense").lower()
                    tx_type = TransactionType.income if type_str == "income" else TransactionType.expense

                    tx = Transaction(
                        user_id=user_id,
                        description=tx_data.get("description", "AI Extracted Transaction")[:100],
                        amount=float(tx_data.get("amount", 0)),
                        category=category,
                        type=tx_type,
                        date=date.fromisoformat(tx_data["date"]) if "date" in tx_data else date.today(),
                    )
                    db.add(tx)
                except Exception as e:
                    print(f"Skipping bad transaction data: {e}")
                    continue
            await db.commit()
            print(f"Background task: Successfully saved {len(transactions)} transactions from {filename}")
                
    except Exception as e:
        print(f"Background Document Processing failed for {filename}: {e}")


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
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a financial document for intelligent multimodal transaction extraction via Gemini.
    
    Accepts PDFs, Images, and Spreadsheets. Returns immediately while the AI reads the document.
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

    # Dispatch to background task to query Gemini and save
    background_tasks.add_task(process_document_task, contents, file.filename, mime_type, current_user.id)

    return {
        "filename": file.filename,
        "pageCount": 0,
        "textLength": len(contents),
        "transactions": [],
        "transactionCount": -1,
        "message": f"Document '{file.filename}' sent to AI Agent for intelligent background processing.",
    }


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

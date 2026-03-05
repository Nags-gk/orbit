"""
Document router — PDF upload and transaction extraction.
"""
from __future__ import annotations
import json
from datetime import date
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks

from ..database import async_session
from ..models import Transaction, TransactionType, TransactionCategory, User, Document
from ..services.security import get_current_user
from ..services.pdf_parser import extract_text_from_pdf, parse_transactions_from_text, PDF_SUPPORT

router = APIRouter(prefix="/api/documents", tags=["documents"])

async def process_document_task(contents: bytes, filename: str, user_id: str):
    """Background task to extract text, index for RAG, and auto-save transactions."""
    try:
        text = extract_text_from_pdf(contents)
        if not text.strip():
            return

        # 1. Save extracted text to RAG Storage
        async with async_session() as db:
            doc = Document(user_id=user_id, filename=filename, content=text)
            db.add(doc)
            await db.commit()
            
        # 2. Extract transactions and auto-save
        transactions = parse_transactions_from_text(text)
        if transactions:
            async with async_session() as db:
                for tx_data in transactions:
                    try:
                        cat_str = tx_data.get("category", "Shopping")
                        try:
                            category = TransactionCategory(cat_str)
                        except ValueError:
                            category = TransactionCategory.Shopping

                        type_str = tx_data.get("type", "expense")
                        tx_type = TransactionType.income if type_str == "income" else TransactionType.expense

                        tx = Transaction(
                            user_id=user_id,
                            description=tx_data.get("description", "Imported transaction"),
                            amount=float(tx_data.get("amount", 0)),
                            category=category,
                            type=tx_type,
                            date=date.fromisoformat(tx_data["date"]) if "date" in tx_data else date.today(),
                        )
                        db.add(tx)
                    except Exception:
                        continue
                await db.commit()
                print(f"Background task: Auto-saved {len(transactions)} transactions from {filename}")
                
    except Exception as e:
        print(f"Background document processing failed: {e}")


@router.get("/status")
async def document_status():
    """Check if PDF processing is available."""
    return {
        "pdfSupport": PDF_SUPPORT,
        "supportedFormats": ["pdf"] if PDF_SUPPORT else [],
        "message": "PDF processing ready" if PDF_SUPPORT else "Install pdfplumber for PDF support",
    }


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a PDF document for transaction extraction.
    
    Returns immediately while processing happens in the background.
    """
    if not PDF_SUPPORT:
        raise HTTPException(
            status_code=503,
            detail="PDF processing not available. Install pdfplumber: pip install pdfplumber"
        )

    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Read file
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    # Dispatch to background task
    background_tasks.add_task(process_document_task, contents, file.filename, current_user.id)

    return {
        "filename": file.filename,
        "pageCount": 0,
        "textLength": 0,
        "transactions": [],
        "transactionCount": -1,
        "message": f"Document '{file.filename}' is being processed in the background.",
    }


@router.post("/confirm")
async def confirm_transactions(
    transactions: list[dict],
    current_user: User = Depends(get_current_user)
):
    """
    Save confirmed extracted transactions to the database.
    
    Expects a list of transaction objects from the upload response.
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

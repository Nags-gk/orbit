"""
LLM-powered Document Analyzer Service

Uses Gemini 2.5 Flash to natively parse documents (PDFs, Images, Spreadsheets)
and extract structured transaction data.
"""
import os
import json
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List, Optional

# Structured Output Schema for Gemini
class TransactionExtraction(BaseModel):
    date: str = Field(description="Transaction date in YYYY-MM-DD format. E.g. 2023-10-24")
    description: str = Field(description="Cleaned, human-readable merchant name or description. Max 100 chars.")
    amount: float = Field(description="The absolute transaction amount as a positive float.")
    type: str = Field(description="Must be exactly 'income' or 'expense'")
    category: str = Field(description="Must be exactly one of: Food, Transport, Utilities, Entertainment, Shopping, Subscription, or Income")

class ExtractionResult(BaseModel):
    transactions: List[TransactionExtraction]

def analyze_financial_document(file_bytes: bytes, mime_type: str) -> list[dict]:
    """
    Sends the raw file bytes to Gemini 2.5 Flash and instructs it to
    extract a structured JSON list of transactions.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set. Cannot use AI Document Analyzer.")
        
    client = genai.Client(api_key=api_key)
    
    # Standardize mime types for the SDK if needed
    if mime_type == "text/csv":
        mime_type = "text/plain" # Gemini prefers plain text for CSVs natively
        
    prompt = (
        "You are an expert financial analysis agent. I am providing you with a financial document "
        "(such as a bank statement, credit card bill, screenshot of transactions, or CSV export). "
        "Your task is to comprehensively analyze this document and extract EVERY single transaction you can find.\n\n"
        "Follow these strict rules:\n"
        "1. Extract the Date, Description, Amount, Type (income/expense), and assign a logical Category.\n"
        "2. Make sure the amount is always a positive float. (e.g. if the document says -$5.00, the amount is 5.00 and type is 'expense').\n"
        "3. Ignore running balances, totals, headers, or irrelevant text. ONLY extract pure transactions.\n"
        "4. Output exactly matching the requested JSON Schema constraint."
    )
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type,
                ),
                prompt,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ExtractionResult,
                temperature=0.1, # Keep hallucination low for data extraction
            )
        )
        
        # Parse the structured JSON response
        result_text = response.text
        if not result_text:
            return []
            
        parsed_data = json.loads(result_text)
        return parsed_data.get("transactions", [])
        
    except Exception as e:
        print(f"Gemini Extraction Error: {e}")
        raise RuntimeError(f"Failed to analyze document with AI: {str(e)}")

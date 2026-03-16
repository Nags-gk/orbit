"""
LLM-powered Document Analyzer Service

Uses Gemini 2.5 Flash to natively parse documents (PDFs, Images, Spreadsheets)
and extract structured transaction data.
"""
import os
import json
import base64
import io
import pdfplumber
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List, Optional
from .local_llm import settings

# Structured Output Schema for Gemini and Local LLM
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
    
    # ── Local Privacy Mode Pipeline ──
    if settings.use_local_llm:
        return _local_analyze_financial_document(file_bytes, mime_type, prompt)
        
    # ── Gemini Pipeline ──
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set. Cannot use AI Document Analyzer.")
            
    client = genai.Client(api_key=api_key)

    # Standardize mime types for the SDK if needed
    if mime_type == "text/csv":
        mime_type = "text/plain" # Gemini prefers plain text for CSVs natively
    
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
        import traceback
        traceback.print_exc()
        raise RuntimeError(f"Failed to analyze document with AI: {str(e)}")


def _local_analyze_financial_document(file_bytes: bytes, mime_type: str, prompt: str) -> list[dict]:
    """Execute the document analysis pipeline using a fully local LLM."""
    try:
        from openai import OpenAI
    except ImportError:
        raise RuntimeError("OpenAI python package required for Local LLM processing.")
        
    # Step 1: Extract text locally since arbitrary local LLMs don't typically support binary blobs easily
    extracted_text = ""
    if "pdf" in mime_type.lower():
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
        except Exception as e:
            raise RuntimeError(f"Failed to read local PDF securely: {e}")
    else:
        # Assume plain text or CSV
        extracted_text = file_bytes.decode('utf-8', errors='ignore')

    if not extracted_text.strip():
        raise ValueError("Could not extract any readable text from the document.")

    # Step 2: Feed text to Local LLM requesting JSON
    schema_json = ExtractionResult.model_json_schema()
    
    local_prompt = f"{prompt}\n\nHere is the exact required JSON Schema you MUST return. Do not return markdown, just raw JSON:\n{json.dumps(schema_json)}\n\nDOCUMENT CONTENT:\n{extracted_text}"

    client = OpenAI(
        base_url=settings.local_model_url,
        api_key="local"
    )

    try:
        response = client.chat.completions.create(
            model=settings.local_model_name,
            messages=[{"role": "user", "content": local_prompt}],
            temperature=0.1,
            # Response formatting depends on model capability, often forcing JSON is best:
            response_format={"type": "json_object"}
        )
        
        result_content = response.choices[0].message.content
        if not result_content:
            return []
            
        data = json.loads(result_content)
        # Handle cases where the model wraps it or names it differently
        if "transactions" in data:
            return data["transactions"]
        return data if isinstance(data, list) else []

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise RuntimeError(f"Local AI Document Parse Error: {e}")

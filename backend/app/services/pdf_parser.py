"""
PDF text extraction and transaction parsing.

Uses pdfplumber for text extraction from digital PDFs,
then applies regex heuristics to parse transactions.
"""
from __future__ import annotations
import re
import json
from datetime import date, datetime
from io import BytesIO
from typing import Optional

try:
    import pdfplumber
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False


# ── Category Classification ──────────────────────────────

CATEGORY_KEYWORDS = {
    "Food": [
        "restaurant", "cafe", "coffee", "pizza", "burger", "sushi", "taco",
        "starbucks", "mcdonald", "chipotle", "subway", "doordash", "grubhub",
        "uber eats", "grocery", "whole foods", "trader joe", "panera",
        "lunch", "dinner", "breakfast", "bakery", "deli",
    ],
    "Transport": [
        "uber", "lyft", "gas", "fuel", "parking", "toll", "transit",
        "metro", "bus", "taxi", "car wash", "auto", "vehicle",
    ],
    "Utilities": [
        "electric", "water", "gas bill", "internet", "phone", "mobile",
        "verizon", "at&t", "comcast", "utility", "power",
    ],
    "Entertainment": [
        "netflix", "spotify", "hulu", "disney", "movie", "theater",
        "concert", "game", "steam", "playstation", "xbox", "book",
        "museum", "ticket", "amc",
    ],
    "Shopping": [
        "amazon", "target", "walmart", "costco", "ikea", "home depot",
        "best buy", "clothing", "shoes", "electronics", "store",
        "purchase", "order",
    ],
    "Subscription": [
        "subscription", "monthly", "annual", "membership", "premium",
        "plan", "recurring",
    ],
}


def classify_transaction(description: str) -> str:
    """Classify a transaction description into a category."""
    lower = description.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in lower:
                return category
    return "Shopping"  # Default category


# ── Text Extraction ──────────────────────────────────────

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    if not PDF_SUPPORT:
        raise RuntimeError("pdfplumber is not installed. Run: pip install pdfplumber")

    text_parts = []
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

    return "\n\n".join(text_parts)


# ── Transaction Parsing ──────────────────────────────────

# Common date patterns in bank statements
DATE_PATTERNS = [
    r"(\d{1,2}/\d{1,2}/\d{2,4})",      # MM/DD/YYYY or MM/DD/YY
    r"(\d{4}-\d{2}-\d{2})",              # YYYY-MM-DD
    r"(\d{1,2}-\d{1,2}-\d{2,4})",        # MM-DD-YYYY
    r"(\w{3}\s+\d{1,2},?\s*\d{4})",      # Mon DD, YYYY
]

# Amount patterns
AMOUNT_PATTERNS = [
    r"\$\s*([\d,]+\.\d{2})",             # $1,234.56
    r"([\d,]+\.\d{2})\s*(?:DR|CR)?",     # 1234.56 DR/CR
]


def parse_date(date_str: str) -> Optional[str]:
    """Try to parse a date string into YYYY-MM-DD format."""
    formats = [
        "%m/%d/%Y", "%m/%d/%y",
        "%Y-%m-%d",
        "%m-%d-%Y", "%m-%d-%y",
        "%b %d, %Y", "%b %d %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).date().isoformat()
        except ValueError:
            continue
    return None


def parse_transactions_from_text(text: str) -> list[dict]:
    """
    Parse transaction data from extracted PDF text.
    
    Uses line-by-line analysis to find patterns like:
    DATE  DESCRIPTION  AMOUNT
    """
    transactions = []
    lines = text.split("\n")

    for line in lines:
        line = line.strip()
        if not line or len(line) < 10:
            continue

        # Try to find a date
        found_date = None
        for pattern in DATE_PATTERNS:
            match = re.search(pattern, line)
            if match:
                parsed = parse_date(match.group(1))
                if parsed:
                    found_date = parsed
                    break

        if not found_date:
            continue

        # Try to find an amount
        found_amount = None
        for pattern in AMOUNT_PATTERNS:
            match = re.search(pattern, line)
            if match:
                amount_str = match.group(1).replace(",", "")
                try:
                    found_amount = float(amount_str)
                except ValueError:
                    continue
                break

        if not found_amount or found_amount <= 0:
            continue

        # Extract description (text between date and amount, or remaining text)
        description = line
        # Remove the date portion
        for pattern in DATE_PATTERNS:
            description = re.sub(pattern, "", description)
        # Remove the amount portion
        for pattern in AMOUNT_PATTERNS:
            description = re.sub(r"\$?" + pattern, "", description)
        # Clean up
        description = re.sub(r"\s+", " ", description).strip()
        description = description.strip("- |/")

        if not description or len(description) < 3:
            description = "Transaction"

        # Determine type
        is_income = any(kw in line.lower() for kw in [
            "deposit", "credit", "payment received", "salary", "payroll",
            "refund", "cashback", "interest earned",
        ])

        transactions.append({
            "date": found_date,
            "description": description[:100],  # Cap length
            "amount": round(found_amount, 2),
            "category": "Income" if is_income else classify_transaction(description),
            "type": "income" if is_income else "expense",
        })

    return transactions

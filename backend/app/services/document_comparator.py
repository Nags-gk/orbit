"""
Multi-Document Comparative Analysis Engine

Compares spending across multiple uploaded financial documents,
identifying trends, anomalies, and patterns across time periods.
"""
from __future__ import annotations
import os
import json
from collections import defaultdict
from typing import Optional


def compare_document_extractions(doc_extractions: list[dict]) -> dict:
    """
    Compare extracted transactions across multiple documents.
    
    Args:
        doc_extractions: List of dicts with:
            - filename: str
            - transactions: list of {date, description, amount, type, category}
    
    Returns:
        Structured comparison with trends, anomalies, and insights.
    """
    if not doc_extractions or len(doc_extractions) < 2:
        return {"error": "Need at least 2 documents to compare."}
    
    periods = []
    all_categories = set()
    
    for doc in doc_extractions:
        txns = doc.get("transactions", [])
        
        # Calculate per-category totals
        cat_totals = defaultdict(float)
        total_income = 0.0
        total_expenses = 0.0
        merchant_counts = defaultdict(int)
        
        for tx in txns:
            cat = tx.get("category", "Uncategorized")
            amount = float(tx.get("amount", 0))
            tx_type = tx.get("type", "expense")
            
            all_categories.add(cat)
            
            if tx_type == "income":
                total_income += amount
            else:
                total_expenses += amount
                cat_totals[cat] += amount
            
            # Track merchants
            desc = tx.get("description", "").lower().strip()
            if desc:
                merchant_counts[desc] += 1
        
        periods.append({
            "filename": doc.get("filename", "Unknown"),
            "transactionCount": len(txns),
            "totalIncome": round(total_income, 2),
            "totalExpenses": round(total_expenses, 2),
            "netFlow": round(total_income - total_expenses, 2),
            "categoryBreakdown": {cat: round(val, 2) for cat, val in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)},
            "topMerchants": dict(sorted(merchant_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
        })
    
    # ── Trend Analysis ──
    category_trends = []
    for cat in all_categories:
        values = [p["categoryBreakdown"].get(cat, 0) for p in periods]
        if len(values) >= 2 and any(v > 0 for v in values):
            first_val = values[0] if values[0] > 0 else 0.01  # avoid div-by-zero
            last_val = values[-1]
            change_pct = ((last_val - first_val) / first_val) * 100
            
            trend = "stable"
            if change_pct > 15:
                trend = "increasing"
            elif change_pct < -15:
                trend = "decreasing"
            elif values[0] == 0 and values[-1] > 0:
                trend = "new"
            elif values[0] > 0 and values[-1] == 0:
                trend = "stopped"
            
            category_trends.append({
                "category": cat,
                "values": values,
                "changePercent": round(change_pct, 1),
                "trend": trend,
            })
    
    category_trends.sort(key=lambda x: abs(x["changePercent"]), reverse=True)
    
    # ── Anomaly Detection ──
    anomalies = []
    total_expenses_list = [p["totalExpenses"] for p in periods]
    if len(total_expenses_list) >= 2:
        avg_expenses = sum(total_expenses_list) / len(total_expenses_list)
        for i, p in enumerate(periods):
            if avg_expenses > 0 and abs(p["totalExpenses"] - avg_expenses) / avg_expenses > 0.30:
                direction = "higher" if p["totalExpenses"] > avg_expenses else "lower"
                anomalies.append({
                    "type": "spending_spike" if direction == "higher" else "spending_drop",
                    "period": p["filename"],
                    "amount": p["totalExpenses"],
                    "average": round(avg_expenses, 2),
                    "description": f"Spending in {p['filename']} was {abs(p['totalExpenses'] - avg_expenses):,.2f} {direction} than average",
                })
    
    # Check for new/missing categories
    if len(periods) >= 2:
        first_cats = set(periods[0]["categoryBreakdown"].keys())
        last_cats = set(periods[-1]["categoryBreakdown"].keys())
        
        new_cats = last_cats - first_cats
        for cat in new_cats:
            anomalies.append({
                "type": "new_category",
                "category": cat,
                "amount": periods[-1]["categoryBreakdown"].get(cat, 0),
                "description": f"New spending category '{cat}' appeared in {periods[-1]['filename']}",
            })
        
        missing_cats = first_cats - last_cats
        for cat in missing_cats:
            anomalies.append({
                "type": "missing_category",
                "category": cat,
                "amount": periods[0]["categoryBreakdown"].get(cat, 0),
                "description": f"Category '{cat}' from {periods[0]['filename']} is missing in {periods[-1]['filename']}",
            })
    
    # ── Generate Insights ──
    insights = []
    
    # Overall spending trend
    if len(total_expenses_list) >= 2:
        overall_change = total_expenses_list[-1] - total_expenses_list[0]
        if overall_change > 0:
            insights.append({
                "icon": "📈",
                "title": "Spending Increased",
                "description": f"Your spending went up by ${abs(overall_change):,.2f} from {periods[0]['filename']} to {periods[-1]['filename']}.",
            })
        elif overall_change < 0:
            insights.append({
                "icon": "📉",
                "title": "Spending Decreased",
                "description": f"Great job! Your spending dropped by ${abs(overall_change):,.2f}.",
            })
    
    # Biggest category changes
    for trend in category_trends[:3]:
        if abs(trend["changePercent"]) > 20:
            direction_emoji = "🔺" if trend["changePercent"] > 0 else "🔽"
            insights.append({
                "icon": direction_emoji,
                "title": f"{trend['category']} {trend['trend'].title()}",
                "description": f"{trend['category']} spending changed by {trend['changePercent']:+.1f}%.",
            })
    
    # ── Summary ──
    comparison = {
        "documentCount": len(doc_extractions),
        "periods": periods,
        "categoryTrends": category_trends,
        "anomalies": anomalies,
        "insights": insights,
        "summary": {
            "totalDocuments": len(doc_extractions),
            "totalTransactions": sum(p["transactionCount"] for p in periods),
            "avgMonthlyExpenses": round(sum(total_expenses_list) / len(total_expenses_list), 2) if total_expenses_list else 0,
            "categories": sorted(list(all_categories)),
        },
    }
    
    return comparison


def generate_narrative_summary(comparison: dict) -> Optional[str]:
    """
    Use Gemini to generate a natural language narrative from comparison data.
    Returns None if API key not available.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    
    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=api_key)
        
        prompt = (
            "You are a financial analyst. Analyze this spending comparison data and write a clear, "
            "actionable 3-4 paragraph summary highlighting key trends, concerns, and recommendations.\n\n"
            f"Data: {json.dumps(comparison, indent=2)}\n\n"
            "Focus on: biggest changes, spending health, and actionable advice."
        )
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt],
            config=types.GenerateContentConfig(temperature=0.3),
        )
        
        return response.text if response.text else None
    except Exception as e:
        print(f"Gemini narrative generation failed: {e}")
        return None

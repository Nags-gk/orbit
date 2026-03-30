import asyncio
import json
import sys
import os

from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import select

# Setup path for backend
sys.path.append(os.path.abspath("./backend"))
from app.database import async_session
from app.models import Transaction, Account, User
from app.services.local_llm import settings
from google import genai
from google.genai import types

async def main():
    async with async_session() as db:
        # Get gptchat0428@gmail.com user
        user = (await db.execute(select(User).where(User.email == "gptchat0428@gmail.com"))).scalars().first()
        if not user:
            print("User not found.")
            return

        # Get their accounts
        accounts = (await db.execute(select(Account).where(Account.user_id == user.id))).scalars().all()
        acc_dict = {a.id: {"name": a.name, "type": a.subtype} for a in accounts}
        if not acc_dict:
            print("No accounts to assign.")
            return

        # Get their transactions
        txs = (await db.execute(select(Transaction).where(Transaction.user_id == user.id))).scalars().all()
        
        # Prepare prompt
        prompt = "You are an AI financial categorizer. Associate each transaction with the correct bank account based on its description.\n\nAccounts:\n"
        for aid, details in acc_dict.items():
            prompt += f"- ID: '{aid}' | {details['name']} ({details['type']})\n"
        
        prompt += "\nTransactions to classify:\n"
        for tx in txs:
            prompt += f"- TX_ID: '{tx.id}' | Desc: '{tx.description}' | Amount: {tx.amount} | Type: {tx.type.value}\n"
            
        prompt += "\nRespond ONLY with a JSON dictionary mapping tx_id to the most likely account ID. \nFormat: {\"tx_id\": \"account_id\"}. \nLogic notes: 'interest charged', 'purchases', or anything shopping related go to the Credit Card. Salary, 'payment to card', rent, or direct deposits goes to Checking."

        client = genai.Client(api_key=settings.gemini_api_key)
        
        print("Asking Gemini to classify transactions into accounts...")
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        result = json.loads(response.text)
        updates = 0
        for tx in txs:
            if tx.id in result and result[tx.id] in acc_dict:
                tx.account_id = result[tx.id]
                updates += 1
                
        await db.commit()
        print(f"Successfully auto-assigned {updates} transactions via AI!")

if __name__ == "__main__":
    asyncio.run(main())

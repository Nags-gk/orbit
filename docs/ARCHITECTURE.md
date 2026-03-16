# 📘 Orbit Architecture & API Design

This document details the architectural decisions and system design for the Orbit AI personal finance tracking system.

## 🏢 High-Level Architecture

Orbit follows a decoupled client-server architecture.

1.  **Frontend Client**: React 18 SPA (Single Page Application) built with Vite. It functions as a PWA, storing app state logically in local storage using Zustand. 
2.  **Backend API**: A Python FastAPI server providing REST endpoints. It manages the SQLite database asynchronously with SQLAlchemy 2.0.
3.  **AI Engine**: The FastAPI server interacts with the Google Gemini API to process documents and power the conversational agent.

---

## 💻 Frontend (React / Vite)

The frontend is highly modularized under `src/`:

*   `/components`: Reusable UI elements (`/ui` for primitives via shadcn/ui logic, and domain-specific folders like `/transactions`, `/dashboard`, `/chat`).
*   `/hooks`: Custom React hooks, including `.useChat` and `.useNotifications`.
*   `/lib`: Core utilities (API fetch wrappers, theme parsing, formatting functions).
*   `/store`: Zustand state management for local persistence.

### State Management
We use **Zustand** for global state. Instead of refetching data constantly, the app aggressively caches data.
*   **authStore**: Stores JWT tokens safely.
*   **useStore**: Stores User Preferences (Dark/Light mode, Custom HSL UI tokens), and caches transactions/subscriptions offline so the PWA can run instantly.

---

## ⚙️ Backend (FastAPI / Python)

Located in `/backend/app`, the server strictly follows domain-driven structure:

*   `/routers`: FastAPI route declarations (`transactions.py`, `auth.py`, `chat.py`, `documents.py`).
*   `/services`: Business logic (e.g., `ai_doc.py` containing the Gemini integration code).
*   `/models.py`: SQLAlchemy database models.
*   `/schemas.py`: Pydantic models for strict data validation (Input/Output schemas).

### 🤖 AI Pipeline

1.  **Document Parsing** (`POST /api/documents/parse`)
    *   The frontend posts a raw file (PDF/Image/CSV) as a binary payload.
    *   FastAPI routes it to the `ai_doc` service.
    *   The service wraps the file in a multimodal prompt and sends it to the Gemini API with instructions to return a structured JSON array of matching Pydantic Transaction objects.
2.  **Conversational Agent** (`POST /api/chat`)
    *   Requests contain User prompt + context (last 50 transactions, active accounts).
    *   Gemini API returns conversational text. It also has access to function calling capabilities (e.g., executing a command to "Add Transaction").

---

## 🗄️ Database Schema

Orbit uses a self-hosted `SQLite` database. Operations are strictly `async` to prevent blocking the Event Loop.

### Core Entities

*   **Users**: (Authentication, name, hashed passwords)
*   **Accounts**: (Checking, Savings, Credit Cards)
*   **Transactions**: (Linked to accounts, Date, Amount, Description, Category, Type: Income/Expense)
*   **Subscriptions**: (Recurring bills detected via AI).

---

## 🔒 Security Posture

*   **JWT Tokens**: Authentication is required for all `/api/*` routes. Tokens expire and are signed symmetrically.
*   **Asset Protection**: The DB (`orbit.db`) and uploaded attachments (`/backend/uploads/`) are explicitly excluded from GitHub standard tracking to prevent sensitive data leaks. 
*   **Pydantic Enforcement**: All incoming API requests are strongly typed. Values like 'Category' must match an Enum or string constraint to prevent injection.

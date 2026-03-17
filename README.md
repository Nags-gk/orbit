<h1 align="center">
  🪐 Orbit
</h1>

<p align="center">
  <b>The next-generation, AI-native personal finance operating system.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Language-TypeScript-007ACC?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/AI-Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google" alt="Gemini">
  <img src="https://img.shields.io/badge/AI-Local_LLMs_(Ollama)-FF6F00?style=for-the-badge&logo=meta" alt="Local LLMs">
</p>

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Recent Updates](#-recent-updates)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [AI Configuration](#-ai-configuration)
- [Usage Guide](#-usage-guide)
  - [Mobile Installation](#-installing-on-mobile-iphone--android)
- [Documentation](#-documentation)

---

## 🚀 Overview

**Orbit** is a full-stack, multimodal, AI-powered financial management dashboard. It was engineered from the ground up to prioritize intelligence, speed, data privacy, and beautiful aesthetics. 

Unlike traditional budgeting apps that rely on tedious manual entry, Orbit utilizes advanced Large Language Models (LLMs) and local Semantic RAG (Retrieval-Augmented Generation) to:
- Autonomously parse your bank statements.
- Intelligently categorize your spending.
- Forecast future expenses predictively.
- Interact with you via a conversational Voice AI assistant.

> **Privacy First:** Orbit supports 100% offline local AI mode via Ollama, ensuring your sensitive financial data **never leaves your machine**.

---

## ✨ Key Features

### 🤖 True AI Intelligence
*   **Flexible AI Backends (3 Options)**:
    * ☁️ **Google Gemini 2.5 Flash** — Cloud-based, intelligent responses with full function calling.
    * ☁️ **Anthropic Claude** — Premium cloud AI with streaming and agentic tool use.
    * 🔒 **Local LLMs (Ollama/LM Studio)** — 100% offline privacy mode. Your financial data never leaves your machine.
*   **Smart Demo Mode**: Even without any API key, Orbit provides a fully functional keyword-based assistant that can query transactions, manage accounts, detect anomalies, and more.
*   **Multimodal Document Analyzer**: Drag-and-drop your PDFs, JPEGs, PNGs, CSVs, or Excel sheets. The AI agent instantly parses and structures your raw transactions with zero human intervention.
*   **Conversational AI Assistant**: An embedded chatbot capable of answering complex financial queries (e.g., *"How much did I spend on Food last week?"*) or actioning commands (e.g., *"Add $45 for lunch today"*).
*   **Voice Interactions**: Orbit's assistant features embedded web-native text-to-speech, allowing it to speak its responses back to you.
*   **Spending Forecasts**: View mathematical projections mapping out your predictive 30-day spending trajectory based on your historical patterns.
*   **Smart Auto-Categorization**: AI-powered transaction categorization that learns from your spending patterns. Ask *"What category is Uber?"* and get intelligent suggestions.

### 💰 Account & Transaction Management
*   **Multi-Account Support**: Add and manage unlimited financial accounts — multiple credit cards, checking accounts, savings accounts, investment/brokerage accounts, and loans.
*   **Account-Linked Transactions**: When adding a transaction, select which account it belongs to. The account balance is automatically adjusted:
    * *Expenses* decrease checking/savings balances and increase credit card debt.
    * *Income* increases checking/savings balances and decreases credit card debt.
*   **Inline Balance Editing**: Click any account balance on the dashboard to directly edit it — no need to talk to the AI for simple updates.
*   **Add Accounts via UI**: Use the **"+ Add Account"** button on the dashboard to create new accounts with type, subtype, and initial balance.

### 📊 Real-Time Financial Engineering
*   **Live Dashboard**: Immediate, clear visualizations of Net Balances, Net Worth over time, and Monthly Spending.
*   **Budget & Goal Tracking**: Granular progress bars triggering visual alerts when you approach or exceed limits.
*   **Subscription Management**: Centralized tracking for recurring bills, auto-detected from your transaction history.
*   **Anomaly Detection**: AI flags unusual spending patterns and suspicious transactions.

### 🎨 Beautiful, Modern UX
*   **Dynamic Theme Engine**: Swap instantly between sleek presets like *Midnight Prism*, *Clean Light*, and *Cream Elegance*.
*   **Custom Environments**: Inject custom HSL colors on the fly, saving directly to your local persistent state.
*   **Premium Glassmorphism**: Enjoy smooth gradients, responsive components, and stunning Recharts visualizations.

### 📱 Progressive Web App (PWA)
*   **Installable**: Install Orbit as a standalone app on your desktop (macOS/Windows) or mobile device (iOS/Android) directly from your browser.
*   **Offline Capabilities**: Intelligent Service Worker caching allows Orbit to load incredibly fast and serve key assets even gracefully offline.

---

## 🆕 Recent Updates

| Date | Change | Description |
| :--- | :--- | :--- |
| **Mar 16, 2026** | 🐛 **Python 3.9 Fix** | Fixed a critical backend crash caused by Python 3.10+ syntax (`list[dict] \| None`) in `local_llm.py`. Added `from __future__ import annotations` for backward compatibility. |
| **Mar 16, 2026** | 🔧 **Gemini Key Fix** | Fixed Gemini API key resolution — the backend was reading from `os.getenv()` instead of the centralized `config.py` settings, causing it to always fall back to demo mode. |
| **Mar 16, 2026** | ✨ **Add Account UI** | New **"+ Add Account"** modal on the dashboard. Users can manually create credit cards, checking, savings, investment, and loan accounts without using the AI chat. |
| **Mar 16, 2026** | ✨ **Account-Linked Transactions** | Transactions can now be linked to a specific account. The selected account's balance is automatically adjusted (debit/credit logic) when a transaction is created. |
| **Mar 16, 2026** | ✨ **Inline Balance Editing** | Click any account balance on the homepage to directly edit it in-place. |
| **Mar 16, 2026** | ✨ **Transaction Modals** | Premium segmented control for Expense/Income toggle. Edit and Delete modals with improved UX. |
| **Mar 15, 2026** | 🔒 **Local LLM Support** | Full offline AI mode using Ollama or LM Studio with OpenAI-compatible SDK. |
| **Mar 15, 2026** | 📝 **Build & Launch Scripts** | Added `build.sh` and `launch.sh` for one-command setup and launch. |
| **Mar 15, 2026** | 📱 **Mobile PWA** | Frontend now binds to network host for mobile access. Full PWA install instructions. |

---

## 🛠️ Technology Stack

| Architecture | Technologies |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, TypeScript |
| **Styling** | Tailwind CSS v3, CSS Modules, Lucide React (Icons) |
| **State Management** | Zustand (Persistent Local Storage) |
| **Data Visualization** | Recharts |
| **Backend Server** | Python 3.9+, FastAPI, Uvicorn |
| **Database & ORM** | SQLite (Async `aiosqlite`), SQLAlchemy 2.0 |
| **AI Processing** | Google Gemini 2.5 Flash (`google-genai`), Anthropic Claude (`anthropic`), OR Local LLMs via Ollama (`openai` SDK) |
| **Authentication** | JWT (JSON Web Tokens) via `python-jose` |
| **PWA** | Vite PWA Plugin, Service Workers |

---

## ⚙️ Getting Started

Getting Orbit running on your local machine takes less than 5 minutes.

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v18+ recommended)
- **Python** (v3.9+ recommended)
- **AI Engine** *(choose one)*:
  - ☁️ A **Google Gemini API Key** ([get one free](https://aistudio.google.com/apikey)), OR
  - ☁️ An **Anthropic API Key**, OR
  - 🔒 **Ollama** installed locally ([ollama.com](https://ollama.com)) for fully offline mode

### Installation (Using Helper Scripts)

#### 1. Clone & Configure
```bash
git clone https://github.com/Nags-gk/orbit.git
cd orbit

# Set up your environment variables
cp backend/.env.example backend/.env
```

#### 2. Configure AI *(edit `backend/.env`)*

Choose **one** of these configurations:

<details>
<summary><b>Option A: Google Gemini (Recommended — Free Tier Available)</b></summary>

```env
GEMINI_API_KEY=your_gemini_api_key_here
USE_LOCAL_LLM=False
```
</details>

<details>
<summary><b>Option B: Anthropic Claude</b></summary>

```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
USE_LOCAL_LLM=False
```
</details>

<details>
<summary><b>Option C: Local LLM (Ollama — 100% Offline Privacy Mode)</b></summary>

```env
USE_LOCAL_LLM=True
LOCAL_MODEL_URL=http://localhost:11434/v1
LOCAL_MODEL_NAME=llama3.1
```

> Make sure Ollama is running (`ollama serve`) and you've pulled a model (`ollama pull llama3.1`).
</details>

<details>
<summary><b>Option D: No AI Key (Demo Mode)</b></summary>

No configuration needed! Orbit will run in **demo mode** with a keyword-based assistant that can still query transactions, manage accounts, show spending summaries, detect anomalies, and more. Perfect for testing the UI.
</details>

#### 3. Build the Application
We've provided a helper script to automatically create virtual environments, install Python/NPM dependencies, and build the frontend:
```bash
chmod +x build.sh launch.sh
./build.sh
```

#### 4. Launch
To instantly boot both the FastAPI backend and React frontend concurrently:
```bash
./launch.sh
```
> 🌐 The frontend will launch at **`http://localhost:4173`**.  
> 🔌 The backend API runs at **`http://localhost:8000`**.  
> Press `Ctrl+C` to gracefully stop both servers.

---

## 🎒 Usage Guide

1. **Create an Account**: Navigate to `http://localhost:4173` and register a secure profile.
2. **Add Your Financial Accounts**: Click the **"+ Add Account"** button on the dashboard to add your credit cards, checking accounts, savings, investments, etc.
3. **Log Transactions**: Click **"Add Transaction"** → select Expense or Income → choose the linked account → the account balance updates automatically!
4. **Import Data**: Drag a bank statement (PDF, CSV, image) into the **Document Analyzer** zone on the Dashboard to instantly populate transactions.
5. **Customize Appearance**: Navigate to the **Profile** page → **Appearance** to tweak colors or enable Dark/Light mode.
6. **Chat with AI**: Open the **Orbit AI Assistant** (bottom-right corner) to ask questions like:
   - *"Show my spending summary"*
   - *"What's my net worth?"*
   - *"Add my Chase credit card with $500"*
   - *"What category is Uber?"*
   - *"Any unusual spending?"*

### 📱 Installing on Mobile (iPhone / Android)

Since Orbit is built as a Progressive Web App (PWA), you can install it directly to your phone without an app store:

1. Ensure your Mac and mobile device are on the **same Wi-Fi network**.
2. Run `./launch.sh` on your Mac.
3. Find your Mac's local IP (`ifconfig | grep "inet "` — look for something like `192.168.x.x`).
4. On your phone, open **Safari** (iOS) or **Chrome** (Android).
5. Navigate to `http://<your-mac-ip>:4173`.
6. **iOS:** Tap the Share icon (⬆) → **"Add to Home Screen"**.
7. **Android:** Tap the three-dot menu → **"Install App"** / **"Add to Home Screen"**.

Orbit will now appear as a native, full-screen standalone app on your device!

---

## 🗂️ Project Structure

```
orbit/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── config.py           # Environment & settings
│   │   ├── database.py         # SQLite async engine
│   │   ├── models.py           # SQLAlchemy ORM models
│   │   ├── routers/            # API route handlers
│   │   │   ├── accounts.py     # Account CRUD
│   │   │   ├── transactions.py # Transaction CRUD + auto-balance
│   │   │   ├── chat.py         # WebSocket AI chat
│   │   │   └── ...
│   │   └── services/           # Business logic
│   │       ├── gemini_llm.py   # Google Gemini integration
│   │       ├── local_llm.py    # Ollama/LM Studio integration
│   │       ├── demo.py         # Keyword-based demo mode
│   │       ├── tools.py        # AI function calling tools
│   │       └── ...
│   ├── .env                    # Your local config (git-ignored)
│   ├── .env.example            # Template config
│   └── requirements.txt
├── src/                        # React TypeScript frontend
│   ├── components/
│   │   ├── dashboard/          # AccountShowcase, AddAccountModal, etc.
│   │   ├── transactions/       # AddTransactionModal, EditTransactionModal
│   │   ├── ai/                 # ChatPanel, InsightCard, PredictionChart
│   │   └── ui/                 # Shared UI primitives (Dialog, Select, etc.)
│   ├── hooks/                  # Custom React hooks (useAccounts, etc.)
│   └── pages/                  # Dashboard, Transactions, Intelligence, etc.
├── build.sh                    # One-command build script
├── launch.sh                   # One-command launch script
└── docs/
    ├── ARCHITECTURE.md         # Technical architecture deep-dive
    └── UI_DESIGN.md            # Design system documentation
```

---

## 🔐 Security & Privacy

- **Database files (`.db`) are git-ignored** — your financial data is never committed to version control.
- **JWT authentication** secures all API endpoints.
- **Local LLM mode** ensures zero data leaves your machine when using Ollama.
- **No telemetry** — Orbit does not phone home or track usage.
- **Environment variables** store all secrets (API keys) outside of code.

---

## 📚 Documentation

For deeper dives into how Orbit is built and designed:

*   📘 [**Architecture & API Design**](./docs/ARCHITECTURE.md) - Frontend ↔ Backend communication, AI integrations, and database schema.
*   🎨 [**UI & UX Design System**](./docs/UI_DESIGN.md) - Glassmorphism approach, dynamic theme engine, component library, and Tailwind configuration.

---

<p align="center">
  <i>Built for the future of personal finance. 🪐</i>
</p>

<h1 align="center">
  <img src="https://img.icons8.com/nolan/256/1A6DFF/C822FF/planet.png" alt="Orbit Logo" width="80" height="80">
  <br>
  Orbit - Intelligent Financial Tracker
</h1>

<p align="center">
  <b>The next-generation, AI-native personal finance operating system.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Language-TypeScript-007ACC?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square&logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/AI-Gemini_2.5_Pro-4285F4?style=flat-square&logo=google" alt="Gemini">
  <img src="https://img.shields.io/badge/AI-Claude_3.5_Sonnet-CC8B65?style=flat-square&logo=anthropic" alt="Anthropic">
</p>

---

## 🚀 Overview

**Orbit** is a full-stack, multimodal, AI-powered financial management dashboard engineered for intelligence, speed, and beautiful aesthetics. 

Unlike traditional budgeting apps that rely on tedious manual entry, Orbit utilizes advanced Large Language Models (LLMs) and local Semantic RAG (Retrieval-Augmented Generation) to autonomously parse your bank statements, categorize your spending, forecast future expenses, and interact with you via a conversational Voice AI assistant.

---

## 🔥 Key Features

### 🤖 True AI Intelligence
- **Multimodal Document Analyzer**: Powered by Google's **Gemini 2.5 Pro**, simply drag-and-drop your PDFs, JPEGs, PNGs, CSVs, or Excel sheets. The AI instantly reads, parses, and structures your raw transactions with zero human intervention.
- **Conversational AI Assistant**: An embedded chatbot capable of answering complex financial queries (e.g., *"How much did I spend on Food last week?"*) or conversational commands (e.g., *"Add $45 for lunch today"*).
- **Embedded Web-Native Text-to-Speech**: Orbit's assistant can literally speak its responses back to you.
- **Spending Forecasts**: Mathematical projections mapping out your predictive 30-day spending trajectory based on historical patterns.

### 📊 Real-Time Financial Engineering
- **Live Dashboard**: Immediate visualizations of Net Balances and Monthly Spending.
- **Budget Tracking**: Granular progress bars triggering visual alerts when you approach or exceed limits.
- **Subscription Management**: Centralized tracking for recurring bills and automated services.

### 🎨 Beautiful, Modern UX
- **Dynamic Theme Engine**: Swap instantly between sleek presets like *Midnight Prism*, *Clean Light*, and *Cream Elegance*.
- **Advanced Appearance Customization**: Native color pickers to inject custom HSL tailwind colors on the fly, saving directly to your local persistent state.
- **Glassmorphism Design**: Smooth gradients, responsive components, and beautiful Recharts visualizations.

### 🛡️ Secure & Multi-Tenant
- **JWT Authentication**: Full user isolation utilizing stateless JSON Web Tokens and `bcrypt` password hashing.
- **Private RAG Store**: A custom-built, zero-dependency TF-IDF engine that semantic searches your private documents securely within your local database without exposing data arbitrarily.

---

## 🛠️ Technology Stack

| Domain | Technology / Framework |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, TypeScript |
| **Styling** | Tailwind CSS v3, CSS Modules, Lucide React (Icons) |
| **State Management** | Zustand (Persistent Local Storage) |
| **Data Visualization** | Recharts |
| **Backend Server** | Python 3.9+, FastAPI, Uvicorn |
| **Database & ORM** | SQLite (Async `aiosqlite`), SQLAlchemy 2.0 |
| **AI Agents** | Google `google-genai` (Gemini), Anthropic Server SDK |

---

## ⚙️ Local Installation & Setup

Getting Orbit running on your local machine takes less than 5 minutes.

### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.9+ recommended)
- **API Keys**: You will need a **Google Gemini API Key** and an **Anthropic API Key**.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/orbit.git
cd orbit
```

### 2. Backend Setup (FastAPI)
Navigate to the backend directory, create a virtual environment, and install dependencies.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

**Configure Environment Variables:**
Create a `.env` file in the `/backend` directory:
```bash
cp .env.example .env
```
Open the new `.env` file and securely paste your API keys:
```env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
GEMINI_API_KEY=AIzaSyA-your-api-key-here
```

**Start the Backend Server:**
```bash
# Assuming your venv is activated
uvicorn app.main:app --reload --port 8000
```
*The backend API will boot up securely attached to `http://localhost:8000`.*

### 3. Frontend Setup (React/Vite)
Open a new terminal tab, navigate *back* to the root `orbit` project folder, and install NPM packages.

```bash
cd ..  # If you are still in the backend folder
npm install
```

**Start the Frontend App:**
```bash
npm run dev
```

*The beautiful frontend UI will launch at `http://localhost:5173`. Open this URL in your browser!*

---

## 🚀 Getting Started (First Boot)

1. Navigate to **`http://localhost:5173`**.
2. Click **Create Account** and register a secure profile (e.g. `nags@example.com` / `password`).
3. Head to the **Dashboard** and drag a bank statement into the Document Analyzer zone!
4. Navigate to the **Profile** page -> **Appearance** to tweak your colors or enable Dark/Light mode!
5. Open the **Orbit AI Assistant** in the bottom right corner and click the microphone icon to have it speak to you!

---

## 🤝 Contributing

We welcome pull requests! If you're looking to modify the CSS dynamic tokens, check `src/lib/themes.ts`. If you're adjusting AI agent prompts or RAG logic, the action happens inside `/backend/app/services/`.

## 📄 License
This application is provided as open-source software under the MIT License.

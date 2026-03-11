<h1 align="center">
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
  <img src="https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=flat-square&logo=pwa" alt="PWA">
</p>

---

## 🚀 Overview

**Orbit** is a full-stack, multimodal, AI-powered financial management dashboard engineered for intelligence, speed, and beautiful aesthetics. 

Unlike traditional budgeting apps that rely on tedious manual entry, Orbit utilizes advanced Large Language Models (LLMs) and local Semantic RAG (Retrieval-Augmented Generation) to autonomously parse your bank statements, categorize your spending, forecast future expenses, and interact with you via a conversational Voice AI assistant.

---

## 🔥 Key Features

### 🤖 True AI Intelligence
- **Multimodal Document Analyzer**: Powered by Google's **Gemini**, simply drag-and-drop your PDFs, JPEGs, PNGs, CSVs, or Excel sheets. The AI instantly reads, parses, and structures your raw transactions with zero human intervention.
- **Conversational AI Assistant**: An embedded chatbot capable of answering complex financial queries (e.g., *"How much did I spend on Food last week?"*) or conversational commands (e.g., *"Add $45 for lunch today"*).
- **Embedded Web-Native Text-to-Speech**: Orbit's assistant can literally speak its responses back to you.
- **Spending Forecasts**: Mathematical projections mapping out your predictive 30-day spending trajectory based on historical patterns.

### 📊 Real-Time Financial Engineering
- **Live Dashboard**: Immediate visualizations of Net Balances, Net Worth over time, and Monthly Spending.
- **Budget & Goal Tracking**: Granular progress bars triggering visual alerts when you approach or exceed limits, alongside dedicated Savings Goals tracking.
- **Subscription & Bill Management**: Centralized tracking for recurring bills, auto-detected from your transaction history.
- **Data Export**: Seamlessly generate detailed PDF reports or export your transactions and account data to CSV format.

### 🎨 Beautiful, Modern UX
- **Dynamic Theme Engine**: Swap instantly between sleek presets like *Midnight Prism*, *Clean Light*, and *Cream Elegance*.
- **Advanced Appearance Customization**: Native color pickers to inject custom HSL tailwind colors on the fly, saving directly to your local persistent state.
- **Profile Customization**: Upload a personal avatar and manage your profile details directly within the app.
- **Glassmorphism Design**: Smooth gradients, responsive components, and beautiful Recharts visualizations.

### 📱 Progressive Web App (PWA)
- **Installable**: Orbit can be installed as a standalone app on your desktop (macOS/Windows) or mobile device (iOS/Android) directly from your browser.
- **Offline Capabilities**: Intelligent caching allows Orbit to load incredibly fast and serve key assets even without an internet connection.

### 🛡️ Secure & Multi-Tenant
- **JWT Authentication**: Full user isolation utilizing stateless JSON Web Tokens and `bcrypt` password hashing.
- **Local SQLite DB**: Lightning-fast, self-hosted database keeping your financial data secure.

---

## 🛠️ Technology Stack

| Domain | Technology / Framework |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, TypeScript |
| **Styling** | Tailwind CSS v3, CSS Modules, Lucide React (Icons) |
| **State Management** | Zustand (Persistent Local Storage) |
| **Data Visualization** | Recharts |
| **Export/Reports** | jspdf, jspdf-autotable |
| **Backend Server** | Python 3.9+, FastAPI, Uvicorn |
| **Database & ORM** | SQLite (Async `aiosqlite`), SQLAlchemy 2.0 |
| **AI Agents** | Google `google-genai` (Gemini) |

---

## ⚙️ Local Installation & Setup

Getting Orbit running on your local machine takes less than 5 minutes.

### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.9+ recommended)
- **API Keys**: You will need a **Google Gemini API Key**.

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
Open the `.env` file and securely paste your API keys:
```env
# Required for AI Features
GEMINI_API_KEY=your_gemini_api_key_here
```

**Start the Backend Server:**
```bash
# Assuming your venv is activated
uvicorn app.main:app --reload --port 8000
```
*The backend API will boot up securely attached to `http://localhost:8000`.*
*(Profile pictures uploaded in the app will be saved to `backend/uploads/profiles`)*

### 3. Frontend Setup (React/Vite)
Open a new terminal tab, navigate *back* to the root `orbit` project folder, and install NPM packages.

```bash
cd ..  # If you are still in the backend folder
npm install
```

**Start the Frontend App (Development Mode):**
To run the app with hot module replacement:
```bash
npm run dev
```
*The beautiful frontend UI will launch at `http://localhost:5173`. Open this URL in your browser!*

**Start the Frontend App (Production Mode / PWA Test):**
If you want to test the Progressive Web App (PWA) installation and offline service workers, you need to build the app and run the preview server:
```bash
npm run build
npm run preview
```
*The app will launch at `http://localhost:4173` (by default). Look for the install icon (⊕) in your browser's address bar to install Orbit as a native app.*

---

## 🚀 Getting Started (First Boot)

1. Navigate to **`http://localhost:5173`** (or your preview port).
2. Click **Create Account** and register a secure profile.
3. Head to the **Dashboard** and drag a bank statement into the Document Analyzer zone to instantly populate your data!
4. Navigate to the **Profile** page -> **Appearance** to tweak your colors or enable Dark/Light mode, and upload an avatar.
5. Open the **Orbit AI Assistant** in the bottom right corner and click the microphone icon to have it speak to you!
6. Click the install icon in your browser's address bar to install Orbit to your device.

---

## 🤝 Contributing

We welcome pull requests! Let's build the future of agentic personal finance together.

## 📄 License
This application is provided as open-source software under the MIT License.

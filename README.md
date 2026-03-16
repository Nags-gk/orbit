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
  <img src="https://img.shields.io/badge/AI-Gemini_2.5_Pro-4285F4?style=for-the-badge&logo=google" alt="Gemini">
</p>

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage Guide](#-usage-guide)
- [Documentation](#-documentation)

---

## 🚀 Overview

**Orbit** is a full-stack, multimodal, AI-powered financial management dashboard. It was engineered from the ground up to prioritize intelligence, speed, and beautiful aesthetics. 

Unlike traditional budgeting apps that rely on tedious manual entry, Orbit utilizes advanced Large Language Models (LLMs) and local Semantic RAG (Retrieval-Augmented Generation) to:
- Autonomously parse your bank statements.
- Intelligently categorize your spending.
- Forecast future expenses predictively.
- Interact with you via a conversational Voice AI assistant.

---

## ✨ Key Features

### 🤖 True AI Intelligence
*   **Multimodal Document Analyzer**: Powered by Google's Gemini, simply drag-and-drop your PDFs, JPEGs, PNGs, CSVs, or Excel sheets. The AI instantly reads, parses, and structures your raw transactions with zero human intervention.
*   **Conversational AI Assistant**: An embedded chatbot capable of answering complex financial queries (e.g., *"How much did I spend on Food last week?"*) or actioning commands (e.g., *"Add $45 for lunch today"*).
*   **Voice Interactions**: Orbit's assistant features embedded web-native text-to-speech, allowing it to speak its responses back to you.
*   **Spending Forecasts**: View mathematical projections mapping out your predictive 30-day spending trajectory based on your historical patterns.

### 📊 Real-Time Financial Engineering
*   **Live Dashboard**: Immediate, clear visualizations of Net Balances, Net Worth over time, and Monthly Spending.
*   **Budget & Goal Tracking**: Granular progress bars triggering visual alerts when you approach or exceed limits.
*   **Subscription Management**: Centralized tracking for recurring bills, auto-detected from your transaction history.

### 🎨 Beautiful, Modern UX
*   **Dynamic Theme Engine**: Swap instantly between sleek presets like *Midnight Prism*, *Clean Light*, and *Cream Elegance*.
*   **Custom Environments**: Inject custom HSL colors on the fly, saving directly to your local persistent state.
*   **Premium Glassmorphism**: Enjoy smooth gradients, responsive components, and stunning Recharts visualizations.

### 📱 Progressive Web App (PWA)
*   **Installable**: Install Orbit as a standalone app on your desktop (macOS/Windows) or mobile device (iOS/Android) directly from your browser.
*   **Offline Capabilities**: Intelligent Service Worker caching allows Orbit to load incredibly fast and serve key assets even gracefully offline.

---

## 🛠️ Technology Stack

| Architecture | Technologies |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, TypeScript |
| **Styling** | Tailwind CSS v3, CSS Modules, Lucide React (Icons) |
| **State Management**| Zustand (Persistent Local Storage) |
| **Data Visualization**| Recharts |
| **Backend Server** | Python 3.9+, FastAPI, Uvicorn |
| **Database & ORM** | SQLite (Async `aiosqlite`), SQLAlchemy 2.0 |
| **AI Processing** | Google `google-genai` (Gemini SDK) |

---

## ⚙️ Getting Started

Getting Orbit running on your local machine takes less than 5 minutes.

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v18+ recommended)
- **Python** (v3.9+ recommended)
- **API Keys**: A **Google Gemini API Key** is required for the AI features.

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/orbit.git
cd orbit
```

#### 2. Start the Backend (FastAPI)
Open a terminal and set up the Python environment:
```bash
cd backend
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

**Configure the Environment:**
Create a `.env` file in the `/backend` directory and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Boot the Server:**
```bash
uvicorn app.main:app --reload --port 8000
```
> The backend API is now running securely at `http://localhost:8000`.

#### 3. Start the Frontend (React)
Open a **new** terminal tab, navigate back to the root `orbit` folder, and install the NPM packages:

```bash
cd orbit
npm install
```

**Launch the App:**
```bash
npm run dev
```
> The beautiful frontend UI will launch at `http://localhost:5173`. Open this URL in your browser!

---

## 🎒 Usage Guide

1. **Create an Account**: Navigate to `http://localhost:5173` and register a secure profile.
2. **Import Data**: Head to the **Dashboard** and drag a bank statement into the Document Analyzer zone to instantly populate your data!
3. **Customize**: Navigate to the **Profile** page -> **Appearance** to tweak your colors or enable Dark/Light mode.
4. **Chat**: Open the **Orbit AI Assistant** in the bottom right corner and click the microphone icon to have it speak to you!
5. **Install**: Click the install icon (⊕) in your browser's address bar to install Orbit natively to your device via PWA.

---

## 📚 Documentation

For deeper dives into how Orbit is built and designed, check out our extended documentation:

*   📘 [**Architecture & API Design**](./docs/ARCHITECTURE.md) - Learn about how the frontend communicates with the FastAPI backend, the AI integrations, and the database schema.
*   🎨 [**UI & UX Design System**](./docs/UI_DESIGN.md) - Details on the Glassmorphism approach, the dynamic theme engine, component structuring, and Tailwind configuration.

---

<p align="center">
  <i>Built for the future of personal finance.</i>
</p>

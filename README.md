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
*   **Local Privacy Mode (100% Offline)**: Ditch the cloud. Orbit seamlessly integrates with local models (via Ollama/LM Studio), meaning your sensitive financial PDFs and transaction data *never* leave your machine.
*   **Multimodal Document Analyzer**: Powered by AI, simply drag-and-drop your PDFs, JPEGs, PNGs, CSVs, or Excel sheets. The agent instantly parses and structures your raw transactions with zero human intervention.
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
| **AI Processing** | Google `google-genai` (Gemini) OR Local LLMs (Ollama + `openai` SDK) |

---

## ⚙️ Getting Started

Getting Orbit running on your local machine takes less than 5 minutes.

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v18+ recommended)
- **Python** (v3.9+ recommended)
- **AI Engine**: Either a **Google Gemini API Key** OR a local engine like **Ollama** installed.

### Installation (Using Helper Scripts)

#### 1. Clone & Configure
```bash
git clone https://github.com/your-username/orbit.git
cd orbit

# Set up your environment variables
cp backend/.env.example backend/.env
```
*Open `backend/.env` and either add a Gemini key OR toggle `USE_LOCAL_LLM=True` if you are using Ollama.*

#### 2. Build the Application
We've provided a helper script to automatically create virtual environments, install Python/NPM dependencies, and build the frontend:
```bash
./build.sh
```

#### 3. Launch
To instantly boot both the FastAPI backend and React frontend concurrently:
```bash
./launch.sh
```
> The beautiful frontend UI will launch in preview mode. Open the provided `http://localhost:4173` URL in your browser!
> When you're done testing, press `Ctrl+C` in that terminal to gracefully kill both servers.

---

## 🎒 Usage Guide

1. **Create an Account**: Navigate to `http://localhost:4173` and register a secure profile.
2. **Import Data**: Head to the **Dashboard** and drag a bank statement into the Document Analyzer zone to instantly populate your data!
3. **Customize**: Navigate to the **Profile** page -> **Appearance** to tweak your colors or enable Dark/Light mode.
4. **Chat**: Open the **Orbit AI Assistant** in the bottom right corner and click the microphone icon to have it speak to you!

### 📱 Installing on Mobile (iPhone / Android)

Since Orbit is built as a Progressive Web App (PWA) and runs natively on your Wi-Fi `<host>`, you can directly install it to your phone without the App Store:

1. Ensure your MacBook and Mobile device are connected to the **same Wi-Fi network**.
2. Run `./launch.sh` on your Mac (Ensure line 33 dictates `npm run preview -- --host &`). 
3. Open Safari (iOS) or Chrome (Android) on your mobile device.
4. Navigate to your Mac's Local IP address appended by the frontend port (e.g. `http://10.0.0.X:4173`).
5. **iOS:** Tap the "Share" icon (square with UP arrow) -> Scroll down to **Add to Home Screen**.
6. **Android:** Tap the three dots (Menu) -> Tap **Add to Home screen** / **Install app**.

Orbit will now appear as a native, full-screen standalone app alongside your other applications!

---

## 📚 Documentation

For deeper dives into how Orbit is built and designed, check out our extended documentation:

*   📘 [**Architecture & API Design**](./docs/ARCHITECTURE.md) - Learn about how the frontend communicates with the FastAPI backend, the AI integrations, and the database schema.
*   🎨 [**UI & UX Design System**](./docs/UI_DESIGN.md) - Details on the Glassmorphism approach, the dynamic theme engine, component structuring, and Tailwind configuration.

---

<p align="center">
  <i>Built for the future of personal finance.</i>
</p>

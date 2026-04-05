<div align="center">
  <h1>🪐 Orbit</h1>
  <p><b>The next-generation, AI-native personal finance operating system.</b></p>

  <img src="https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Language-TypeScript-007ACC?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/AI-Gemini%20%7C%20Claude%20%7C%20Ollama-4285F4?style=for-the-badge&logo=openai" alt="AI">
</div>

---

### What is Orbit? 
Unlike traditional budgeting apps that rely on tedious manual entry, **Orbit** utilizes advanced Large Language Models (LLMs) and local Semantic Retrieval to give you a fully personalized financial copilot. 

Simply drop your bank statements into the app and let the AI autonomously categorize your spending, mathematically forecast your trajectory, and instantly answer complex financial questions over live voice chat. 

> 🔒 **Privacy First:** Orbit supports 100% offline local AI mode natively. Connect it to Ollama or LM Studio, ensuring your sensitive financial data *never* leaves your machine.

---

### Explore Orbit

<details>
<summary><b>✨ Core Features</b> (Click to expand)</summary>

*   **🤖 Conversational AI Intelligence**: Chat with your data. Orbit natively understands semantic queries like *"How much did I spend on food last week?"* or *"Set up my Chase card with $500"*.
*   **📄 Multimodal Document Analyzer**: Drag-and-drop PDFs, JPEGs, or CSVs. The AI extracts transactions and categorizes them with zero human intervention.
*   **📈 Real-Time Engine**: Built-in linear forecasting algorithms, budget tracking, anomaly detection, and subscription optimization.
*   **🔌 Flexible Backends**: Hotswap between Google Gemini, Anthropic Claude, or **100% Offline Local LLMs (Ollama)**.
*   **🎨 Premium Glassmorphism UI**: A gorgeous, dynamic theme engine with fully responsive Recharts visualizations.

</details>

<details>
<summary><b>⚙️ Quick Install & Setup</b></summary>

#### Prerequisites
- **Node.js** (v18+) and **Python** (v3.9+)
- **AI Engine**: A Gemini API Key, an Anthropic API Key, or a Local Ollama instance. (*Note: Orbit functions cleanly in Demo Mode without API keys too*).

#### 1. Clone & Configure
```bash
git clone https://github.com/Nags-gk/orbit.git
cd orbit
cp backend/.env.example backend/.env
```

#### 2. Configure AI Mode 
Edit `backend/.env` according to your preference:
- **Cloud AI**: Set `GEMINI_API_KEY=your_key` and `USE_LOCAL_LLM=False`
- **Local AI**: Set `USE_LOCAL_LLM=True` and configure your local Ollama port (`LOCAL_MODEL_URL=http://localhost:11434/v1`).

#### 3. Build & Launch
Orbit provides unified scripts for dependency building and launching.
```bash
chmod +x build.sh launch.sh
./build.sh
./launch.sh
```
*Frontend runs at `http://localhost:4173`, Backend runs at `http://localhost:8000`.*
</details>

<details>
<summary><b>🎒 Usage Guide & Mobile Install</b></summary>

1. **Dashboard Access**: Navigate to `http://localhost:4173` locally. No registration wall; you drop strictly into your private environment.
2. **Add Financial Accounts**: Tap **"+ Add Account"** to bootstrap Checking, Credit Cards, or Investments.
3. **Log Transactions**: Drop massive bank statements into the AI analyzer, or add statements manually. Account balances synchronize autonomously (e.g., Credit debt decreases when you pay a bill).
4. **Chat & Voice**: Click the Assistant bubble (bottom-right) to write complex semantic queries or tap the microphone to talk. 
5. **Mobile Installation (PWA)**: Navigate to your Mac's internal Wi-Fi IP address (`http://192.168.x.x:4173`) from your iPhone or Android and hit **"Add to Home Screen"**. Orbit will immediately install natively as a Progressive Web App!

</details>

<details>
<summary><b>🛠 Technology Stack & Architecture</b></summary>

- **Frontend Interface**: React 18, Vite, TypeScript, Zustand (Persistent Storage), Recharts, Tailwind CSS v3.
- **Backend Infrastructure**: Python 3.9+, FastAPI, Uvicorn, SQLite (Async `aiosqlite`), SQLAlchemy 2.0.
- **Security Constraints**: 100% local database, zero telemetry, full offline airgap capability with Local LLMs.

For engineering deep-dives, view the [**ARCHITECTURE.md**](./docs/ARCHITECTURE.md) and [**UI_DESIGN.md**](./docs/UI_DESIGN.md) documentation pages.

</details>

---
<p align="center"><i>Built for the future of personal finance. 🪐</i></p>

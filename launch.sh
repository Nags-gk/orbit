#!/bin/bash
# launch.sh - Launches both backend and frontend servers for local testing

echo "🚀 Launching Orbit Local Servers..."

# Function to cleanly kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

export PATH="$HOME/.local/node/bin:$PATH"

# 1. Start Backend in the background
echo "🟢 Starting FastAPI Backend (Port 8000)..."
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
cd ..

# Wait a brief moment to let backend initialize
sleep 2

# 2. Start Frontend in the background
echo "🟢 Starting Frontend PWA Server (Port 4173)..."
echo "🌐 You can access the application at: http://localhost:4173\n"
npm run preview &

# Keep script running and wait for user to gracefully terminate
echo "✨ Orbit is currently running! Press Ctrl+C to stop both servers."
wait

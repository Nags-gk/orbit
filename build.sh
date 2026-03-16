#!/bin/bash
# build.sh - Sets up and builds both backend and frontend for Orbit

echo "🚀 Starting Orbit Build Process..."

# 1. Backend Setup
echo ""
echo "📦 [1/2] Setting up Backend environment..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt
cd ..

# 2. Frontend Setup
echo ""
echo "🎨 [2/2] Setting up Frontend environment..."
# Explicitly ensuring local node path is available if installed locally
export PATH="$HOME/.local/node/bin:$PATH"

echo "Installing Node modules..."
npm install

echo "Building production frontend bundle..."
npm run build

echo ""
echo "✅ Build complete! You can now start the application using ./launch.sh"

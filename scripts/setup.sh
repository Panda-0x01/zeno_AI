#!/bin/bash
# JARVIS Setup Script for Unix-like systems (macOS, Linux)

set -e

echo "🚀 JARVIS Setup Script"
echo "====================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.10+ from https://python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Python $PYTHON_VERSION found"

# Check Ollama
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama not found. Please install from https://ollama.ai/download"
    echo "   After installation, run: ollama pull llama2"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Ollama found"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Setup Python backend
echo "Setting up Python backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    
    # Generate random token
    TOKEN=$(openssl rand -hex 32)
    if [ "$(uname)" == "Darwin" ]; then
        sed -i '' "s/WS_SECRET_TOKEN=/WS_SECRET_TOKEN=$TOKEN/" .env
    else
        sed -i "s/WS_SECRET_TOKEN=/WS_SECRET_TOKEN=$TOKEN/" .env
    fi
    
    echo "✅ Generated secure WebSocket token"
fi

cd ..

# Create frontend .env if it doesn't exist
if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Make sure Ollama is running:"
echo "   ollama serve"
echo ""
echo "2. Pull a model (if you haven't already):"
echo "   ollama pull llama2"
echo ""
echo "3. Start JARVIS in development mode:"
echo "   npm run dev"
echo ""
echo "4. Or build for production:"
echo "   npm run build"
echo ""
echo "For more information, see README.md"
echo ""

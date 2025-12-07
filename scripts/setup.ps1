# JARVIS Setup Script for Windows (PowerShell)

Write-Host "🚀 JARVIS Setup Script" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✅ $pythonVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.10+ from https://python.org/" -ForegroundColor Red
    exit 1
}

# Check Ollama
try {
    $ollamaVersion = ollama --version
    Write-Host "✅ Ollama found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Ollama not found. Please install from https://ollama.ai/download" -ForegroundColor Yellow
    Write-Host "   After installation, run: ollama pull llama2" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Write-Host ""

# Install root dependencies
Write-Host "Installing root dependencies..."
npm install

# Install frontend dependencies
Write-Host "Installing frontend dependencies..."
Set-Location frontend
npm install
Set-Location ..

# Setup Python backend
Write-Host "Setting up Python backend..."
Set-Location backend

# Create virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv venv
}

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install Python dependencies
Write-Host "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..."
    Copy-Item .env.example .env
    
    # Generate random token
    $token = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    (Get-Content .env) -replace 'WS_SECRET_TOKEN=', "WS_SECRET_TOKEN=$token" | Set-Content .env
    
    Write-Host "✅ Generated secure WebSocket token" -ForegroundColor Green
}

Set-Location ..

# Create frontend .env if it doesn't exist
if (-not (Test-Path "frontend\.env")) {
    Write-Host "Creating frontend .env file..."
    Copy-Item frontend\.env.example frontend\.env
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure Ollama is running:"
Write-Host "   ollama serve"
Write-Host ""
Write-Host "2. Pull a model (if you haven't already):"
Write-Host "   ollama pull llama2"
Write-Host ""
Write-Host "3. Start JARVIS in development mode:"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "4. Or build for production:"
Write-Host "   npm run build"
Write-Host ""
Write-Host "For more information, see README.md"
Write-Host ""

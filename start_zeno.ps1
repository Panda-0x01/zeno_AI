# Zeno AI - PowerShell Startup Script
param(
    [switch]$SkipBrowser,
    [switch]$Verbose
)

$Host.UI.RawUI.WindowTitle = "Zeno AI - Startup Manager"

function Write-Status {
    param($Message, $Type = "Info")
    $timestamp = Get-Date -Format "HH:mm:ss"
    switch ($Type) {
        "Success" { Write-Host "[$timestamp] ✅ $Message" -ForegroundColor Green }
        "Error"   { Write-Host "[$timestamp] ❌ $Message" -ForegroundColor Red }
        "Warning" { Write-Host "[$timestamp] ⚠️  $Message" -ForegroundColor Yellow }
        "Info"    { Write-Host "[$timestamp] 🔄 $Message" -ForegroundColor Cyan }
    }
}

function Test-Port {
    param($Port, $Timeout = 5)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $asyncResult = $tcpClient.BeginConnect("127.0.0.1", $Port, $null, $null)
        $wait = $asyncResult.AsyncWaitHandle.WaitOne($Timeout * 1000, $false)
        if ($wait) {
            $tcpClient.EndConnect($asyncResult)
            $tcpClient.Close()
            return $true
        } else {
            $tcpClient.Close()
            return $false
        }
    } catch {
        return $false
    }
}

function Stop-ZenoProcesses {
    Write-Status "Cleaning up existing processes..."
    Get-Process -Name "python", "ollama", "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

function Start-OllamaService {
    Write-Status "Starting Ollama service..."
    
    # Check if Ollama is installed
    if (-not (Get-Command "ollama" -ErrorAction SilentlyContinue)) {
        Write-Status "Ollama not found! Please install from https://ollama.ai/download" -Type "Error"
        return $false
    }
    
    # Start Ollama service
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 5
    
    # Check if Ollama is running
    if (Test-Port -Port 11434) {
        Write-Status "Ollama service started successfully" -Type "Success"
        
        # Check for optimized model
        $models = & ollama list 2>$null
        if ($models -notmatch "llama3.2:1b") {
            Write-Status "Installing optimized model for low-end PCs..."
            & ollama pull llama3.2:1b
        }
        return $true
    } else {
        Write-Status "Failed to start Ollama service" -Type "Error"
        return $false
    }
}

function Start-Backend {
    Write-Status "Starting Python backend..."
    
    # Check if Python is available
    if (-not (Get-Command "python" -ErrorAction SilentlyContinue)) {
        Write-Status "Python not found! Please install Python 3.10+" -Type "Error"
        return $false
    }
    
    # Start backend
    Set-Location "backend"
    Start-Process -FilePath "python" -ArgumentList "main.py" -WindowStyle Hidden
    Set-Location ".."
    
    # Wait for backend to start
    Write-Status "Waiting for backend to initialize..."
    $maxAttempts = 20
    $attempt = 0
    
    do {
        Start-Sleep -Seconds 1
        $attempt++
        if (Test-Port -Port 8765) {
            Write-Status "Backend started successfully" -Type "Success"
            return $true
        }
    } while ($attempt -lt $maxAttempts)
    
    Write-Status "Backend failed to start within timeout" -Type "Error"
    return $false
}

function Start-Frontend {
    Write-Status "Starting frontend..."
    
    # Check if npm is available
    if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
        Write-Status "npm not found! Please install Node.js" -Type "Error"
        return $false
    }
    
    Set-Location "frontend"
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
    Set-Location ".."
    
    # Wait for frontend to start
    Start-Sleep -Seconds 5
    
    if (Test-Port -Port 5173) {
        Write-Status "Frontend started successfully" -Type "Success"
        return $true
    } else {
        Write-Status "Frontend may still be starting..." -Type "Warning"
        return $true
    }
}

# Main execution
Write-Host @"
========================================
    Zeno AI - Automatic Startup
========================================
"@ -ForegroundColor Magenta

try {
    # Step 1: Clean up
    Stop-ZenoProcesses
    
    # Step 2: Start Ollama
    if (-not (Start-OllamaService)) {
        throw "Failed to start Ollama service"
    }
    
    # Step 3: Start Backend
    if (-not (Start-Backend)) {
        throw "Failed to start backend"
    }
    
    # Step 4: Start Frontend
    if (-not (Start-Frontend)) {
        throw "Failed to start frontend"
    }
    
    Write-Host @"

✅ Zeno AI is now running!

📱 Frontend: http://localhost:5173
🔧 Backend:  http://127.0.0.1:8765
🤖 Ollama:   http://localhost:11434

"@ -ForegroundColor Green
    
    if (-not $SkipBrowser) {
        Write-Status "Opening Zeno in your browser..."
        Start-Process "http://localhost:5173"
    }
    
    Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
    
    # Keep script running
    while ($true) {
        Start-Sleep -Seconds 10
        
        # Health check
        if (-not (Test-Port -Port 8765)) {
            Write-Status "Backend appears to be down!" -Type "Warning"
        }
        if (-not (Test-Port -Port 11434)) {
            Write-Status "Ollama appears to be down!" -Type "Warning"
        }
    }
    
} catch {
    Write-Status $_.Exception.Message -Type "Error"
    Write-Host "Press any key to exit..." -ForegroundColor Red
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
} finally {
    # Cleanup on exit
    Write-Status "Shutting down services..."
    Stop-ZenoProcesses
}
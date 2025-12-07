"""
Quick test to verify backend can start manually
Run this with: backend\venv\Scripts\python.exe test_backend_manual.py
"""
import sys
print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")

try:
    import fastapi
    print(f"✓ FastAPI installed: {fastapi.__version__}")
except ImportError as e:
    print(f"✗ FastAPI not installed: {e}")
    sys.exit(1)

try:
    import uvicorn
    print(f"✓ Uvicorn installed")
except ImportError as e:
    print(f"✗ Uvicorn not installed: {e}")
    sys.exit(1)

try:
    import httpx
    print(f"✓ HTTPX installed")
except ImportError as e:
    print(f"✗ HTTPX not installed: {e}")
    sys.exit(1)

print("\n✓ All dependencies OK!")
print("\nNow testing backend startup...")

# Try to import the backend
sys.path.insert(0, 'backend')
try:
    from main import app
    print("✓ Backend imports successfully!")
    print("\nTo start the backend manually, run:")
    print("  backend\\venv\\Scripts\\python.exe backend\\main.py")
except Exception as e:
    print(f"✗ Backend import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

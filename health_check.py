#!/usr/bin/env python3
"""
Zeno AI Health Check Service
Monitors all components and restarts them if needed
"""
import asyncio
import aiohttp
import subprocess
import time
import json
import sys
from pathlib import Path

class ZenoHealthMonitor:
    def __init__(self):
        self.services = {
            'ollama': {'port': 11434, 'url': 'http://localhost:11434/api/tags', 'process': None},
            'backend': {'port': 8765, 'url': 'http://127.0.0.1:8765/health', 'process': None},
            'frontend': {'port': 5173, 'url': 'http://localhost:5173', 'process': None}
        }
        self.check_interval = 30  # seconds
        
    async def check_service(self, name, config):
        """Check if a service is healthy"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
                async with session.get(config['url']) as response:
                    if response.status == 200:
                        return True
        except Exception as e:
            print(f"❌ {name} health check failed: {e}")
            return False
        return False
    
    def start_ollama(self):
        """Start Ollama service"""
        try:
            print("🚀 Starting Ollama...")
            process = subprocess.Popen(['ollama', 'serve'], 
                                     stdout=subprocess.DEVNULL, 
                                     stderr=subprocess.DEVNULL)
            self.services['ollama']['process'] = process
            time.sleep(5)  # Wait for startup
            return True
        except Exception as e:
            print(f"❌ Failed to start Ollama: {e}")
            return False
    
    def start_backend(self):
        """Start Python backend"""
        try:
            print("🐍 Starting backend...")
            backend_path = Path(__file__).parent / 'backend'
            process = subprocess.Popen([sys.executable, 'main.py'], 
                                     cwd=backend_path,
                                     stdout=subprocess.DEVNULL, 
                                     stderr=subprocess.DEVNULL)
            self.services['backend']['process'] = process
            time.sleep(8)  # Wait for startup
            return True
        except Exception as e:
            print(f"❌ Failed to start backend: {e}")
            return False
    
    def start_frontend(self):
        """Start frontend development server"""
        try:
            print("🌐 Starting frontend...")
            frontend_path = Path(__file__).parent / 'frontend'
            process = subprocess.Popen(['npm', 'run', 'dev'], 
                                     cwd=frontend_path,
                                     stdout=subprocess.DEVNULL, 
                                     stderr=subprocess.DEVNULL)
            self.services['frontend']['process'] = process
            time.sleep(10)  # Wait for startup
            return True
        except Exception as e:
            print(f"❌ Failed to start frontend: {e}")
            return False
    
    def stop_service(self, name):
        """Stop a service"""
        config = self.services[name]
        if config['process']:
            try:
                config['process'].terminate()
                config['process'].wait(timeout=10)
            except subprocess.TimeoutExpired:
                config['process'].kill()
            config['process'] = None
    
    async def restart_service(self, name):
        """Restart a service"""
        print(f"🔄 Restarting {name}...")
        self.stop_service(name)
        time.sleep(2)
        
        if name == 'ollama':
            return self.start_ollama()
        elif name == 'backend':
            return self.start_backend()
        elif name == 'frontend':
            return self.start_frontend()
        return False
    
    async def monitor_loop(self):
        """Main monitoring loop"""
        print("🔍 Starting health monitoring...")
        
        while True:
            try:
                all_healthy = True
                
                for name, config in self.services.items():
                    is_healthy = await self.check_service(name, config)
                    
                    if is_healthy:
                        print(f"✅ {name} is healthy")
                    else:
                        print(f"⚠️  {name} is unhealthy, attempting restart...")
                        all_healthy = False
                        
                        success = await self.restart_service(name)
                        if success:
                            print(f"✅ {name} restarted successfully")
                        else:
                            print(f"❌ Failed to restart {name}")
                
                if all_healthy:
                    print("🎉 All services are healthy!")
                
                print(f"⏳ Next check in {self.check_interval} seconds...")
                await asyncio.sleep(self.check_interval)
                
            except KeyboardInterrupt:
                print("\n🛑 Shutting down health monitor...")
                break
            except Exception as e:
                print(f"❌ Monitor error: {e}")
                await asyncio.sleep(5)
    
    def start_all_services(self):
        """Start all services initially"""
        print("🚀 Starting all Zeno services...")
        
        # Start in order: Ollama -> Backend -> Frontend
        if not self.start_ollama():
            return False
            
        if not self.start_backend():
            return False
            
        if not self.start_frontend():
            return False
            
        print("✅ All services started!")
        return True
    
    def stop_all_services(self):
        """Stop all services"""
        print("🛑 Stopping all services...")
        for name in self.services:
            self.stop_service(name)
        print("✅ All services stopped!")

async def main():
    monitor = ZenoHealthMonitor()
    
    try:
        # Start all services
        if not monitor.start_all_services():
            print("❌ Failed to start services")
            return 1
        
        # Wait a bit for services to fully initialize
        print("⏳ Waiting for services to initialize...")
        await asyncio.sleep(15)
        
        # Start monitoring
        await monitor.monitor_loop()
        
    except KeyboardInterrupt:
        print("\n🛑 Received shutdown signal")
    finally:
        monitor.stop_all_services()
    
    return 0

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)
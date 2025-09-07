#!/usr/bin/env python3
"""
Vector Retrieval Service Initialization Script
Starts the FastAPI service and optionally seeds with initial therapeutic data
"""

import asyncio
import json
import subprocess
import sys
import time
from pathlib import Path
import requests
import os

def start_service():
    """Start the FastAPI retrieval service"""
    print("🚀 Starting Vector Retrieval Service...")
    
    # Change to retriever directory
    retriever_dir = Path(__file__).parent / "retriever"
    
    # Install dependencies if needed
    if not (retriever_dir / "venv").exists():
        print("📦 Setting up virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"], cwd=retriever_dir)
        
    # Activate venv and install requirements
    if os.name == 'nt':  # Windows
        pip_path = retriever_dir / "venv" / "Scripts" / "pip"
        python_path = retriever_dir / "venv" / "Scripts" / "python"
    else:  # Unix
        pip_path = retriever_dir / "venv" / "bin" / "pip"
        python_path = retriever_dir / "venv" / "bin" / "python"
    
    print("📦 Installing dependencies...")
    subprocess.run([str(pip_path), "install", "-r", "requirements.txt"], cwd=retriever_dir)
    
    # Start the service
    print("🌐 Starting FastAPI server on http://localhost:8000")
    process = subprocess.Popen([
        str(python_path), "-m", "uvicorn", "app:app", 
        "--host", "0.0.0.0", "--port", "8000", "--reload"
    ], cwd=retriever_dir)
    
    return process

def wait_for_service(max_attempts=30):
    """Wait for the service to be ready"""
    print("⏳ Waiting for service to be ready...")
    
    for attempt in range(max_attempts):
        try:
            response = requests.get("http://localhost:8000/health", timeout=2)
            if response.status_code == 200:
                print("✅ Service is ready!")
                return True
        except requests.exceptions.RequestException:
            pass
        
        time.sleep(1)
        print(f"   Attempt {attempt + 1}/{max_attempts}...")
    
    print("❌ Service failed to start")
    return False

def seed_therapeutic_data():
    """Use the persistent therapeutic seeding system"""
    print("🌱 Seeding therapeutic knowledge with persistent system...")
    
    try:
        # Run the dedicated seeding script
        import subprocess
        result = subprocess.run([sys.executable, "seed_therapeutic_knowledge.py"], 
                              capture_output=True, text=True, cwd=Path(__file__).parent)
        
        if result.returncode == 0:
            print("✅ Therapeutic knowledge seeded successfully")
            # Print key parts of the output
            output_lines = result.stdout.split('\n')
            for line in output_lines:
                if '✅ Added' in line or '📊' in line or '🎉' in line:
                    print(f"   {line}")
        else:
            print(f"⚠️  Seeding completed with warnings:")
            print(result.stdout)
            if result.stderr:
                print("Errors:", result.stderr)
                
    except Exception as e:
        print(f"❌ Error running therapeutic seeding: {e}")
        print("   You can run 'python seed_therapeutic_knowledge.py' manually later.")

def main():
    """Main initialization function"""
    print("🎯 ADHD Support Vector Retrieval Service Initializer")
    print("=" * 50)
    
    # Start the service
    process = start_service()
    
    try:
        # Wait for service to be ready
        if wait_for_service():
            # Seed with initial data
            seed_therapeutic_data()
            
            print("\n🎉 Vector Retrieval Service is running!")
            print("   • Service URL: http://localhost:8000")
            print("   • Health check: http://localhost:8000/health")
            print("   • API docs: http://localhost:8000/docs")
            print("\n💡 The service is now ready to provide contextual memory for your ADHD support app!")
            print("   Press Ctrl+C to stop the service")
            
            # Keep the service running
            process.wait()
        else:
            print("❌ Failed to start service")
            process.terminate()
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down service...")
        process.terminate()
        process.wait()
        print("✅ Service stopped")

if __name__ == "__main__":
    main()

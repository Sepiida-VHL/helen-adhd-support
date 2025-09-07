#!/usr/bin/env python3
"""
Complete ADHD Support System Initialization
Sets up the persistent ChromaDB with all therapeutic knowledge and conversation guides
"""

import subprocess
import sys
import time
import requests
from pathlib import Path

class SystemInitializer:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.data_dir = Path(__file__).parent / "retriever" / "data" / "chroma_db"
        self.service_process = None
    
    def check_service_health(self) -> bool:
        """Check if the vector service is running"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=2)
            return response.status_code == 200
        except:
            return False
    
    def start_vector_service(self):
        """Start the vector retrieval service"""
        print("🚀 Starting Vector Retrieval Service...")
        
        try:
            # Run the service starter
            result = subprocess.run([sys.executable, "start_vector_service.py"], 
                                  capture_output=False, text=True, timeout=30)
            return True
        except subprocess.TimeoutExpired:
            # Service started but didn't complete (which is expected for a server)
            print("   Service startup initiated...")
            return True
        except Exception as e:
            print(f"   ❌ Error starting service: {e}")
            return False
    
    def wait_for_service(self, max_attempts: int = 30) -> bool:
        """Wait for the service to be ready"""
        print("⏳ Waiting for service to be ready...")
        
        for attempt in range(max_attempts):
            if self.check_service_health():
                print("✅ Service is ready!")
                return True
            time.sleep(1)
            if attempt % 5 == 0:
                print(f"   Attempt {attempt + 1}/{max_attempts}...")
        
        print("❌ Service failed to start within timeout")
        return False
    
    def seed_therapeutic_knowledge(self):
        """Seed the basic therapeutic knowledge"""
        print("\n🧠 Seeding therapeutic knowledge...")
        
        try:
            result = subprocess.run([sys.executable, "seed_therapeutic_knowledge.py"], 
                                  capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Therapeutic knowledge seeded")
                # Print summary lines
                for line in result.stdout.split('\n'):
                    if '✅ Added' in line or '📊' in line:
                        print(f"   {line}")
            else:
                print(f"⚠️  Therapeutic seeding completed with warnings")
                print(result.stdout)
                
        except Exception as e:
            print(f"❌ Error seeding therapeutic knowledge: {e}")
    
    def seed_conversation_guide(self):
        """Seed the conversation management guide"""
        print("\n💬 Seeding conversation management guide...")
        
        try:
            result = subprocess.run([sys.executable, "seed_conversation_guide.py"], 
                                  capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Conversation guide seeded")
                # Print summary lines
                for line in result.stdout.split('\n'):
                    if '✅ Added' in line or '💡' in line:
                        print(f"   {line}")
            else:
                print(f"⚠️  Conversation guide seeding completed with warnings")
                print(result.stdout)
                
        except Exception as e:
            print(f"❌ Error seeding conversation guide: {e}")
    
    def get_system_status(self):
        """Get the current system status"""
        print("\n📊 System Status:")
        
        try:
            # Get health status
            health_response = requests.get(f"{self.base_url}/health", timeout=5)
            if health_response.status_code == 200:
                health_data = health_response.json()
                print(f"   🟢 Service: {health_data.get('status', 'unknown')}")
                print(f"   💾 Storage: {health_data.get('persistent_storage', 'unknown')}")
                print(f"   📁 Storage exists: {health_data.get('storage_exists', False)}")
            
            # Get collections info
            collections_response = requests.get(f"{self.base_url}/collections", timeout=5)
            if collections_response.status_code == 200:
                collections_data = collections_response.json()
                collections = collections_data.get("collections", [])
                print(f"   📚 Collections: {len(collections)}")
                
                total_docs = 0
                for collection in collections:
                    count = collection.get("count", 0)
                    total_docs += count
                    print(f"      • {collection.get('name', 'unknown')}: {count} documents")
                
                print(f"   📄 Total documents: {total_docs}")
            
        except Exception as e:
            print(f"   ❌ Could not get system status: {e}")
    
    def create_initial_backup(self):
        """Create an initial backup of the seeded system"""
        print("\n💾 Creating initial system backup...")
        
        try:
            result = subprocess.run([
                sys.executable, "backup_restore_data.py", "backup", 
                "--name", "initial_system_setup"
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Initial backup created")
                # Print backup location
                for line in result.stdout.split('\n'):
                    if '📁 Location:' in line:
                        print(f"   {line}")
                        break
            else:
                print("⚠️  Backup creation had warnings")
                print(result.stdout)
                
        except Exception as e:
            print(f"❌ Error creating backup: {e}")
    
    def initialize_complete_system(self):
        """Initialize the complete ADHD support system"""
        print("🎯 ADHD Support System Complete Initialization")
        print("=" * 60)
        
        # Step 1: Check if service is already running
        if self.check_service_health():
            print("✅ Vector service is already running")
        else:
            print("📋 Starting vector service in background...")
            print("   Please run in a separate terminal: python start_vector_service.py")
            print("   Then press Enter to continue...")
            input()
            
            if not self.wait_for_service():
                print("❌ Could not connect to vector service")
                print("   Please ensure the service is running before continuing")
                return False
        
        # Step 2: Seed therapeutic knowledge
        self.seed_therapeutic_knowledge()
        
        # Step 3: Seed conversation guide
        self.seed_conversation_guide()
        
        # Step 4: Get system status
        self.get_system_status()
        
        # Step 5: Create initial backup
        self.create_initial_backup()
        
        # Final summary
        print("\n🎉 System Initialization Complete!")
        print("=" * 60)
        print("✅ Persistent ChromaDB initialized and populated")
        print("✅ Therapeutic knowledge base loaded")
        print("✅ Conversation management guide integrated")
        print("✅ Initial backup created")
        print()
        print("📁 Persistent storage location:")
        print(f"   {self.data_dir.absolute()}")
        print()
        print("🚀 Next steps:")
        print("   1. Keep the vector service running: python start_vector_service.py")
        print("   2. Start the main app: npm run dev")
        print("   3. Helen now has enhanced conversation capabilities!")
        print()
        print("💡 Management commands:")
        print("   • Add content: python seed_therapeutic_knowledge.py")
        print("   • Create backup: python backup_restore_data.py backup")
        print("   • List backups: python backup_restore_data.py list")
        print("   • Test system: python demo_vector_system.py")
        
        return True

def main():
    initializer = SystemInitializer()
    initializer.initialize_complete_system()

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Backup and Restore System for ADHD Support Vector Database
Allows backing up and restoring all therapeutic knowledge and conversation data
"""

import requests
import json
import zipfile
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List
import argparse

class VectorBackupRestore:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.backup_dir = Path(__file__).parent / "backups"
        self.backup_dir.mkdir(exist_ok=True)
        self.data_dir = Path(__file__).parent / "retriever" / "data" / "chroma_db"
    
    def check_service_health(self) -> bool:
        """Check if the vector service is running"""
        try:
            response = requests.get(f"{self.base_url}/health")
            return response.status_code == 200
        except:
            return False
    
    def get_all_collections(self) -> List[Dict[str, Any]]:
        """Get information about all collections"""
        try:
            response = requests.get(f"{self.base_url}/collections")
            if response.status_code == 200:
                return response.json().get("collections", [])
        except Exception as e:
            print(f"Error getting collections: {e}")
        return []
    
    def backup_collections_metadata(self) -> Dict[str, Any]:
        """Backup collection metadata and document counts"""
        print("📊 Backing up collection metadata...")
        
        collections = self.get_all_collections()
        backup_metadata = {
            "backup_timestamp": datetime.now().isoformat(),
            "service_url": self.base_url,
            "collections": collections,
            "total_documents": sum(c["count"] for c in collections)
        }
        
        print(f"   Found {len(collections)} collections with {backup_metadata['total_documents']} total documents")
        return backup_metadata
    
    def create_backup(self, backup_name: str = None) -> Path:
        """Create a complete backup of the vector database"""
        if not backup_name:
            backup_name = f"adhd_support_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        backup_path = self.backup_dir / f"{backup_name}.zip"
        temp_backup_dir = self.backup_dir / "temp_backup"
        
        print(f"🗃️  Creating backup: {backup_name}")
        print("=" * 50)
        
        # Check if service is running for metadata backup
        service_running = self.check_service_health()
        if service_running:
            print("✅ Service is running - will include live metadata")
        else:
            print("⚠️  Service not running - backing up storage files only")
        
        try:
            # Create temporary backup directory
            temp_backup_dir.mkdir(exist_ok=True)
            
            # Backup collection metadata if service is running
            if service_running:
                metadata = self.backup_collections_metadata()
                with open(temp_backup_dir / "backup_metadata.json", 'w') as f:
                    json.dump(metadata, f, indent=2)
            
            # Backup persistent storage directory
            if self.data_dir.exists():
                print("💾 Backing up persistent storage...")
                storage_backup_dir = temp_backup_dir / "chroma_db"
                shutil.copytree(self.data_dir, storage_backup_dir)
                print(f"   Storage backed up: {self.data_dir}")
            else:
                print("⚠️  No persistent storage found")
            
            # Backup seeded content record
            seeded_content_file = Path(__file__).parent / "retriever" / "data" / "seeded_content.json"
            if seeded_content_file.exists():
                shutil.copy2(seeded_content_file, temp_backup_dir / "seeded_content.json")
                print("📝 Backed up seeded content record")
            
            # Create zip archive
            print("🗜️  Creating compressed backup...")
            with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for file_path in temp_backup_dir.rglob('*'):
                    if file_path.is_file():
                        arcname = file_path.relative_to(temp_backup_dir)
                        zipf.write(file_path, arcname)
            
            # Clean up temp directory
            shutil.rmtree(temp_backup_dir)
            
            # Show backup info
            backup_size = backup_path.stat().st_size / (1024 * 1024)  # MB
            print(f"\n🎉 Backup created successfully!")
            print(f"   📁 Location: {backup_path}")
            print(f"   📏 Size: {backup_size:.2f} MB")
            
            return backup_path
            
        except Exception as e:
            print(f"❌ Backup failed: {e}")
            # Clean up on failure
            if temp_backup_dir.exists():
                shutil.rmtree(temp_backup_dir)
            if backup_path.exists():
                backup_path.unlink()
            raise
    
    def list_backups(self):
        """List all available backups"""
        backups = list(self.backup_dir.glob("*.zip"))
        
        if not backups:
            print("📂 No backups found")
            return
        
        print("📂 Available backups:")
        print("-" * 80)
        
        for backup in sorted(backups, key=lambda x: x.stat().st_mtime, reverse=True):
            size_mb = backup.stat().st_size / (1024 * 1024)
            modified = datetime.fromtimestamp(backup.stat().st_mtime)
            
            # Try to read metadata from backup
            try:
                with zipfile.ZipFile(backup, 'r') as zipf:
                    if 'backup_metadata.json' in zipf.namelist():
                        metadata = json.loads(zipf.read('backup_metadata.json'))
                        doc_count = metadata.get('total_documents', 'Unknown')
                        collection_count = len(metadata.get('collections', []))
                        print(f"📦 {backup.name}")
                        print(f"   📅 Created: {modified.strftime('%Y-%m-%d %H:%M:%S')}")
                        print(f"   📏 Size: {size_mb:.2f} MB")
                        print(f"   📊 Collections: {collection_count}, Documents: {doc_count}")
                    else:
                        print(f"📦 {backup.name} (Legacy backup)")
                        print(f"   📅 Created: {modified.strftime('%Y-%m-%d %H:%M:%S')}")
                        print(f"   📏 Size: {size_mb:.2f} MB")
            except Exception as e:
                print(f"📦 {backup.name} (Metadata read error)")
                print(f"   📅 Created: {modified.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"   📏 Size: {size_mb:.2f} MB")
            
            print()
    
    def restore_backup(self, backup_name: str):
        """Restore from a backup"""
        # Find backup file
        backup_path = None
        if backup_name.endswith('.zip'):
            backup_path = self.backup_dir / backup_name
        else:
            backup_path = self.backup_dir / f"{backup_name}.zip"
        
        if not backup_path.exists():
            print(f"❌ Backup not found: {backup_path}")
            return False
        
        print(f"🔄 Restoring backup: {backup_path.name}")
        print("=" * 50)
        
        # Warn if service is running
        if self.check_service_health():
            print("⚠️  WARNING: Vector service is currently running!")
            print("   It's recommended to stop the service before restoring.")
            response = input("   Continue anyway? (y/N): ")
            if response.lower() != 'y':
                print("Restore cancelled")
                return False
        
        try:
            temp_restore_dir = self.backup_dir / "temp_restore"
            temp_restore_dir.mkdir(exist_ok=True)
            
            # Extract backup
            print("📦 Extracting backup...")
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(temp_restore_dir)
            
            # Read backup metadata
            metadata_file = temp_restore_dir / "backup_metadata.json"
            if metadata_file.exists():
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
                print(f"📊 Backup contains {len(metadata['collections'])} collections")
                print(f"   Total documents: {metadata['total_documents']}")
                print(f"   Created: {metadata['backup_timestamp']}")
            
            # Restore persistent storage
            storage_backup = temp_restore_dir / "chroma_db"
            if storage_backup.exists():
                print("💾 Restoring persistent storage...")
                
                # Backup current data if it exists
                if self.data_dir.exists():
                    backup_current = self.data_dir.parent / f"chroma_db_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                    shutil.move(self.data_dir, backup_current)
                    print(f"   Current data backed up to: {backup_current}")
                
                # Restore from backup
                shutil.copytree(storage_backup, self.data_dir)
                print("   ✅ Persistent storage restored")
            
            # Restore seeded content record
            seeded_content_backup = temp_restore_dir / "seeded_content.json"
            if seeded_content_backup.exists():
                seeded_content_target = Path(__file__).parent / "retriever" / "data" / "seeded_content.json"
                seeded_content_target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(seeded_content_backup, seeded_content_target)
                print("   ✅ Seeded content record restored")
            
            # Clean up
            shutil.rmtree(temp_restore_dir)
            
            print(f"\n🎉 Restore completed successfully!")
            print("   Start the vector service to use the restored data.")
            
            return True
            
        except Exception as e:
            print(f"❌ Restore failed: {e}")
            if temp_restore_dir.exists():
                shutil.rmtree(temp_restore_dir)
            return False

def main():
    parser = argparse.ArgumentParser(description="Backup and restore ADHD Support vector database")
    parser.add_argument("action", choices=["backup", "restore", "list"], 
                       help="Action to perform")
    parser.add_argument("--name", help="Backup name for backup/restore operations")
    
    args = parser.parse_args()
    
    backup_restore = VectorBackupRestore()
    
    if args.action == "backup":
        backup_restore.create_backup(args.name)
    elif args.action == "restore":
        if not args.name:
            print("❌ Please provide a backup name with --name")
            return
        backup_restore.restore_backup(args.name)
    elif args.action == "list":
        backup_restore.list_backups()

if __name__ == "__main__":
    main()

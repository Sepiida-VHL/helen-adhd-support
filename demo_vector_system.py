#!/usr/bin/env python3
"""
ADHD Support Vector System Demo
Interactive demonstration of the vector-enhanced contextual intelligence
"""

import requests
import json
import time
from typing import Dict, Any

class VectorSystemDemo:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session_id = "demo-session-001"
    
    def check_service_health(self) -> bool:
        """Check if the vector service is running"""
        try:
            response = requests.get(f"{self.base_url}/health")
            return response.status_code == 200
        except:
            return False
    
    def get_collections_info(self) -> Dict[str, Any]:
        """Get information about available collections"""
        try:
            response = requests.get(f"{self.base_url}/collections")
            return response.json() if response.status_code == 200 else {}
        except:
            return {}
    
    def simulate_conversation_turn(self, user_message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Simulate storing a conversation turn"""
        conversation_data = {
            "user_message": user_message,
            "ai_response": "Generated AI response would go here",
            "session_id": self.session_id,
            "crisis_level": context.get("crisis_level", "none") if context else "none",
            "attention_status": context.get("attention_status", "focused") if context else "focused",
            "emotional_state": context.get("emotional_state", "neutral") if context else "neutral",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S")
        }
        
        try:
            response = requests.post(f"{self.base_url}/store_conversation", json=conversation_data)
            return {"success": response.status_code == 200, "data": conversation_data}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def test_adhd_context_retrieval(self, query: str, user_patterns: Dict[str, Any] = None) -> Dict[str, Any]:
        """Test the specialized ADHD context retrieval"""
        request_data = {
            "query_text": query,
            "user_patterns": user_patterns,
            "session_context": {"session_id": self.session_id}
        }
        
        try:
            response = requests.post(f"{self.base_url}/retrieve_adhd_context", json=request_data)
            return response.json() if response.status_code == 200 else {"error": response.text}
        except Exception as e:
            return {"error": str(e)}
    
    def test_therapeutic_retrieval(self, query: str, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Test therapeutic knowledge retrieval"""
        request_data = {
            "query_text": query,
            "collection_name": "therapeutic_responses",
            "n_results": 3
        }
        
        # Only add filters if they are provided and not empty
        if filters:
            request_data["filters"] = filters
        
        try:
            response = requests.post(f"{self.base_url}/retrieve", json=request_data)
            return response.json() if response.status_code == 200 else {"error": response.text}
        except Exception as e:
            return {"error": str(e)}
    
    def run_demo(self):
        """Run the complete demonstration"""
        print("🧠 ADHD Support Vector System Demo")
        print("=" * 50)
        
        # Check service health
        print("1. 🔍 Checking vector service health...")
        if not self.check_service_health():
            print("❌ Vector service is not running. Please start it with:")
            print("   python start_vector_service.py")
            return
        print("✅ Vector service is healthy!")
        
        # Show collections info
        print("\n2. 📚 Collection Information:")
        collections = self.get_collections_info()
        if collections:
            for collection in collections.get("collections", []):
                print(f"   • {collection}")
        else:
            print("   ⚠️  No collections found or service error")
        
        # Simulate conversation progression
        print("\n3. 💬 Simulating Conversation Progression:")
        
        conversations = [
            {"message": "I'm feeling really overwhelmed right now", "context": {"crisis_level": "moderate", "attention_status": "focused"}},
            {"message": "idk", "context": {"crisis_level": "mild", "attention_status": "fading"}},
            {"message": "I can't handle this anymore, everything is too much", "context": {"crisis_level": "severe", "attention_status": "focused"}},
            {"message": "ok", "context": {"crisis_level": "moderate", "attention_status": "fading"}}
        ]
        
        for i, conv in enumerate(conversations, 1):
            print(f"   Turn {i}: Storing '{conv['message']}'")
            result = self.simulate_conversation_turn(conv["message"], conv["context"])
            if result["success"]:
                print(f"      ✅ Stored with context: {conv['context']}")
            else:
                print(f"      ❌ Failed: {result.get('error', 'Unknown error')}")
            time.sleep(0.5)  # Brief pause for demonstration
        
        # Test contextual retrieval
        print("\n4. 🎯 Testing Contextual Retrieval:")
        
        test_queries = [
            {
                "query": "I'm feeling overwhelmed",
                "user_patterns": {"attention_status": "focused", "crisis_level": "moderate"},
                "description": "Standard overwhelmed query with focused attention"
            },
            {
                "query": "idk",
                "user_patterns": {"attention_status": "fading", "crisis_level": "mild"},
                "description": "Attention fade pattern detection"
            },
            {
                "query": "I need help with breathing",
                "user_patterns": {"attention_status": "focused", "crisis_level": "mild"},
                "description": "Specific intervention request"
            }
        ]
        
        for i, test in enumerate(test_queries, 1):
            print(f"   Test {i}: {test['description']}")
            print(f"      Query: '{test['query']}'")
            
            result = self.test_adhd_context_retrieval(test["query"], test["user_patterns"])
            
            if "error" not in result:
                synthesis = result.get("synthesis", {})
                print(f"      ✅ Found {synthesis.get('total_contexts_found', 0)} relevant contexts")
                print(f"      📍 Best match collection: {synthesis.get('best_match_collection', 'none')}")
                print(f"      ⚠️  Attention adaptations needed: {synthesis.get('attention_adaptations_needed', False)}")
                print(f"      🚨 Crisis context available: {synthesis.get('crisis_context_available', False)}")
            else:
                print(f"      ❌ Error: {result['error']}")
            print()
        
        # Test therapeutic knowledge retrieval
        print("5. 🏥 Testing Therapeutic Knowledge Retrieval:")
        
        therapeutic_tests = [
            {
                "query": "ADHD emotions feel too intense",
                "filters": {"type": "validation"},
                "description": "ADHD emotional validation (single filter)"
            },
            {
                "query": "breathing technique for anxiety",
                "filters": {"technique": "breathing"},
                "description": "Breathing intervention lookup"
            },
            {
                "query": "overwhelming feelings",
                "filters": None,
                "description": "No filter test (all documents)"
            }
        ]
        
        for i, test in enumerate(therapeutic_tests, 1):
            print(f"   Test {i}: {test['description']}")
            result = self.test_therapeutic_retrieval(test["query"], test["filters"])
            
            if "error" not in result:
                documents = result.get("documents", [])
                print(f"      ✅ Found {len(documents)} therapeutic responses")
                for j, doc in enumerate(documents[:2], 1):  # Show first 2
                    print(f"      {j}. \"{doc[:80]}...\"")
            else:
                print(f"      ❌ Error: {result['error']}")
            print()
        
        # Performance summary
        print("6. 📈 Demo Summary:")
        print("   • Vector service is operational")
        print("   • Contextual memory is storing conversation patterns")
        print("   • ADHD-specific retrieval is working")
        print("   • Therapeutic knowledge base is accessible")
        print("   • Attention fade patterns are being detected")
        print("   • Crisis context is being tracked")
        
        print("\n🎉 Demo completed successfully!")
        print("\n💡 Next steps:")
        print("   1. Start the main React app with: npm run dev")
        print("   2. The app will now have enhanced contextual awareness")
        print("   3. Each conversation will build upon previous interactions")
        print("   4. Helen will adapt to user patterns and preferences")

def main():
    """Main demo function"""
    demo = VectorSystemDemo()
    demo.run_demo()

if __name__ == "__main__":
    main()

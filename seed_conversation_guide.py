#!/usr/bin/env python3
"""
Conversation Management Guide Seeder
Seeds the ChromaDB with conversation management techniques from the JSON guide
"""

import json
import requests
from pathlib import Path
from typing import Dict, Any, List
import time

class ConversationGuideSeeder:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.guide_file = Path(__file__).parent / "conversation_management_guide.json"
    
    def check_service_health(self) -> bool:
        """Check if the vector service is running"""
        try:
            response = requests.get(f"{self.base_url}/health")
            return response.status_code == 200
        except:
            return False
    
    def load_conversation_guide(self) -> Dict[str, Any]:
        """Load the conversation management guide JSON"""
        try:
            with open(self.guide_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading conversation guide: {e}")
            return {}
    
    def add_to_collection(self, collection_name: str, documents: List[str], metadatas: List[Dict[str, Any]]) -> bool:
        """Add documents to a ChromaDB collection"""
        try:
            response = requests.post(f"{self.base_url}/add_context", json={
                "documents": documents,
                "metadatas": metadatas,
                "collection_name": collection_name
            })
            return response.status_code == 200
        except Exception as e:
            print(f"   ❌ Error adding to {collection_name}: {e}")
            return False
    
    def seed_open_questions(self, guide: Dict[str, Any]):
        """Seed open-ended questions for exploration"""
        print("❓ Seeding open questions...")
        
        questions = guide.get("open_questions", [])
        documents = questions
        metadatas = [
            {
                "type": "open_question",
                "purpose": "exploration",
                "technique": "motivational_interviewing",
                "category": "conversation_starter",
                "tone": "gentle"
            } for _ in questions
        ]
        
        if self.add_to_collection("therapeutic_responses", documents, metadatas):
            print(f"   ✅ Added {len(documents)} open questions")
        else:
            print(f"   ❌ Failed to add open questions")
    
    def seed_affirmations(self, guide: Dict[str, Any]):
        """Seed validation and affirmation statements"""
        print("💙 Seeding affirmations...")
        
        affirmations = guide.get("affirmations", [])
        documents = affirmations
        metadatas = [
            {
                "type": "affirmation",
                "purpose": "validation",
                "technique": "person_centered",
                "category": "emotional_support",
                "tone": "validating"
            } for _ in affirmations
        ]
        
        if self.add_to_collection("therapeutic_responses", documents, metadatas):
            print(f"   ✅ Added {len(documents)} affirmations")
        else:
            print(f"   ❌ Failed to add affirmations")
    
    def seed_reflection_techniques(self, guide: Dict[str, Any]):
        """Seed reflection and mirroring techniques"""
        print("🪞 Seeding reflection techniques...")
        
        reflections = guide.get("reflections", {})
        documents = []
        metadatas = []
        
        # Simple reflection starters
        for starter in reflections.get("simple_reflection_starters", []):
            documents.append(starter)
            metadatas.append({
                "type": "reflection_starter",
                "purpose": "active_listening",
                "technique": "motivational_interviewing",
                "category": "conversation_technique",
                "complexity": "simple"
            })
        
        # Complex reflection types
        complex_types = reflections.get("complex_reflection_types", {})
        for reflection_type, examples in complex_types.items():
            for example in examples:
                documents.append(example)
                metadatas.append({
                    "type": "reflection_example",
                    "purpose": "deep_understanding",
                    "technique": "motivational_interviewing",
                    "category": "conversation_technique",
                    "complexity": "complex",
                    "reflection_type": reflection_type
                })
        
        if self.add_to_collection("therapeutic_responses", documents, metadatas):
            print(f"   ✅ Added {len(documents)} reflection techniques")
        else:
            print(f"   ❌ Failed to add reflection techniques")
    
    def seed_summary_techniques(self, guide: Dict[str, Any]):
        """Seed summary and consolidation techniques"""
        print("📝 Seeding summary techniques...")
        
        summaries = guide.get("summaries", {})
        documents = []
        metadatas = []
        
        # Summary starters
        for starter in summaries.get("starters", []):
            documents.append(starter)
            metadatas.append({
                "type": "summary_starter",
                "purpose": "consolidation",
                "technique": "motivational_interviewing",
                "category": "conversation_technique",
                "usage": "transition"
            })
        
        # Change talk indicators
        structure = summaries.get("structure", {})
        change_talk = structure.get("change_talk_indicators", {})
        for indicator_type, text in change_talk.items():
            documents.append(text)
            metadatas.append({
                "type": "change_talk_indicator",
                "purpose": "motivation_building",
                "technique": "motivational_interviewing",
                "category": "behavioral_change",
                "indicator_type": indicator_type
            })
        
        # Invitation endings
        for ending in structure.get("invitation_endings", []):
            documents.append(ending)
            metadatas.append({
                "type": "invitation_ending",
                "purpose": "collaboration",
                "technique": "motivational_interviewing",
                "category": "conversation_technique",
                "usage": "closure"
            })
        
        # Ambivalence template
        ambivalence_template = structure.get("ambivalence_template", "")
        if ambivalence_template:
            documents.append(ambivalence_template)
            metadatas.append({
                "type": "ambivalence_template",
                "purpose": "conflict_resolution",
                "technique": "motivational_interviewing",
                "category": "conversation_technique",
                "usage": "template"
            })
        
        if self.add_to_collection("therapeutic_responses", documents, metadatas):
            print(f"   ✅ Added {len(documents)} summary techniques")
        else:
            print(f"   ❌ Failed to add summary techniques")
    
    def seed_deescalation_tools(self, guide: Dict[str, Any]):
        """Seed crisis de-escalation tools"""
        print("🛡️ Seeding de-escalation tools...")
        
        deescalation = guide.get("deescalation_tools", {})
        documents = []
        metadatas = []
        
        # Grounding prompts
        for prompt in deescalation.get("grounding_prompts", []):
            documents.append(prompt)
            metadatas.append({
                "type": "grounding_prompt",
                "purpose": "crisis_stabilization",
                "technique": "grounding",
                "category": "crisis_intervention",
                "crisis_level": "moderate",
                "duration": "1-2 minutes"
            })
        
        # Choice scaffolds
        for scaffold in deescalation.get("choice_scaffolds", []):
            documents.append(scaffold)
            metadatas.append({
                "type": "choice_scaffold",
                "purpose": "executive_function_support",
                "technique": "structured_choice",
                "category": "adhd_support",
                "crisis_level": "mild",
                "usage": "decision_making"
            })
        
        if self.add_to_collection("intervention_library", documents, metadatas):
            print(f"   ✅ Added {len(documents)} de-escalation tools")
        else:
            print(f"   ❌ Failed to add de-escalation tools")
    
    def seed_task_initiation_helpers(self, guide: Dict[str, Any]):
        """Seed task initiation and executive function helpers"""
        print("🚀 Seeding task initiation helpers...")
        
        task_helpers = guide.get("task_initiation_helpers", {})
        documents = []
        metadatas = []
        
        # Tiny steps
        for step in task_helpers.get("tiny_steps", []):
            documents.append(step)
            metadatas.append({
                "type": "tiny_step",
                "purpose": "task_initiation",
                "technique": "behavioral_activation",
                "category": "executive_function",
                "adhd_support": "task_paralysis",
                "difficulty": "minimal"
            })
        
        # Externalization prompts
        for prompt in task_helpers.get("externalization_prompts", []):
            documents.append(prompt)
            metadatas.append({
                "type": "externalization_prompt",
                "purpose": "cognitive_offloading",
                "technique": "externalization",
                "category": "executive_function",
                "adhd_support": "working_memory",
                "difficulty": "low"
            })
        
        if self.add_to_collection("intervention_library", documents, metadatas):
            print(f"   ✅ Added {len(documents)} task initiation helpers")
        else:
            print(f"   ❌ Failed to add task initiation helpers")
    
    def seed_all(self):
        """Seed all conversation management techniques"""
        print("💬 Seeding Conversation Management Guide")
        print("=" * 50)
        
        if not self.check_service_health():
            print("❌ Vector service is not running. Please start it first:")
            print("   python start_vector_service.py")
            return False
        
        guide = self.load_conversation_guide()
        if not guide:
            print("❌ Could not load conversation management guide")
            return False
        
        print(f"📖 Loaded conversation guide with {len(guide)} sections")
        print()
        
        # Seed each section
        self.seed_open_questions(guide)
        time.sleep(0.5)  # Brief pause between operations
        
        self.seed_affirmations(guide)
        time.sleep(0.5)
        
        self.seed_reflection_techniques(guide)
        time.sleep(0.5)
        
        self.seed_summary_techniques(guide)
        time.sleep(0.5)
        
        self.seed_deescalation_tools(guide)
        time.sleep(0.5)
        
        self.seed_task_initiation_helpers(guide)
        
        print()
        print("🎉 Conversation management guide seeded successfully!")
        print("💡 Helen now has access to:")
        print("   • Open-ended exploration questions")
        print("   • Validating affirmations")
        print("   • Reflection and mirroring techniques")
        print("   • Summary and consolidation methods")
        print("   • Crisis de-escalation tools")
        print("   • Executive function support")
        
        return True

def main():
    seeder = ConversationGuideSeeder()
    seeder.seed_all()

if __name__ == "__main__":
    main()

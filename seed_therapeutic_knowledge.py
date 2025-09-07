#!/usr/bin/env python3
"""
Therapeutic Knowledge Seeding System
Seeds the vector database with curated therapeutic responses and interventions
Only adds new content, preserves existing data
"""

import requests
import json
import time
from typing import Dict, List, Any
from pathlib import Path

class TherapeuticSeeder:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.seeded_content_file = Path(__file__).parent / "retriever" / "data" / "seeded_content.json"
        self.seeded_content_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Load already seeded content
        self.seeded_content = self.load_seeded_content()
    
    def load_seeded_content(self) -> Dict[str, List[str]]:
        """Load record of already seeded content"""
        try:
            if self.seeded_content_file.exists():
                with open(self.seeded_content_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load seeded content record: {e}")
        return {}
    
    def save_seeded_content(self):
        """Save record of seeded content"""
        try:
            with open(self.seeded_content_file, 'w') as f:
                json.dump(self.seeded_content, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save seeded content record: {e}")
    
    def check_service_health(self) -> bool:
        """Check if the vector service is running"""
        try:
            response = requests.get(f"{self.base_url}/health")
            return response.status_code == 200
        except:
            return False
    
    def get_collection_count(self, collection_name: str) -> int:
        """Get the current document count for a collection"""
        try:
            response = requests.get(f"{self.base_url}/collections")
            if response.status_code == 200:
                collections = response.json().get("collections", [])
                for coll in collections:
                    if coll["name"] == collection_name:
                        return coll["count"]
        except:
            pass
        return 0
    
    def add_unique_content(self, collection_name: str, documents: List[str], metadatas: List[Dict[str, Any]]) -> int:
        """Add content only if it hasn't been seeded before"""
        seeded_for_collection = self.seeded_content.get(collection_name, [])
        
        # Filter out already seeded content
        new_documents = []
        new_metadatas = []
        
        for i, doc in enumerate(documents):
            # Create a simple hash/identifier for the document
            doc_id = f"{doc[:50]}..." if len(doc) > 50 else doc
            
            if doc_id not in seeded_for_collection:
                new_documents.append(doc)
                new_metadatas.append(metadatas[i])
                seeded_for_collection.append(doc_id)
        
        if not new_documents:
            print(f"   ⏭️  All content already exists in {collection_name}")
            return 0
        
        # Add new content
        try:
            response = requests.post(f"{self.base_url}/add_context", json={
                "documents": new_documents,
                "metadatas": new_metadatas,
                "collection_name": collection_name
            })
            
            if response.status_code == 200:
                # Update seeded content record
                self.seeded_content[collection_name] = seeded_for_collection
                self.save_seeded_content()
                return len(new_documents)
            else:
                print(f"   ❌ Failed to add content: {response.text}")
                return 0
        except Exception as e:
            print(f"   ❌ Error adding content: {e}")
            return 0
    
    def seed_therapeutic_responses(self):
        """Seed ADHD-specific therapeutic responses"""
        print("🧠 Seeding therapeutic responses...")
        
        responses = [
            "ADHD brains feel emotions more intensely - what you're experiencing is real and valid.",
            "Your ADHD brain is working extra hard right now. You're doing the best you can.",
            "Emotional overwhelm with ADHD is exhausting. You're showing real strength by reaching out.",
            "ADHD makes everything feel more urgent and intense. Let's slow this down together.",
            "Your ADHD brain processes things differently, and that includes stress. This will pass.",
            "Executive dysfunction is real with ADHD. It's not laziness - your brain works differently.",
            "ADHD hyperfocus can be both a gift and a challenge. You're not broken, you're different.",
            "Rejection sensitivity with ADHD can make criticism feel devastating. Your feelings are valid.",
            "ADHD time blindness makes planning hard. Let's break this into tiny, manageable steps.",
            "Your ADHD brain needs more dopamine to feel motivated. This isn't a character flaw.",
            "Emotional dysregulation with ADHD means big feelings. You're not too sensitive.",
            "ADHD working memory challenges make following instructions hard. Let's simplify this.",
            "Your ADHD brain thrives on novelty and stimulation. Boredom can feel physically painful.",
            "Masking ADHD symptoms is exhausting. You deserve understanding and accommodation.",
            "ADHD paralysis when overwhelmed is real. Let's find just one small thing you can do."
        ]
        
        metadatas = [
            {"type": "validation", "topic": "emotional_intensity", "crisis_level": "mild"},
            {"type": "validation", "topic": "effort_recognition", "crisis_level": "moderate"}, 
            {"type": "validation", "topic": "overwhelm", "crisis_level": "moderate"},
            {"type": "grounding", "topic": "urgency", "crisis_level": "severe"},
            {"type": "reassurance", "topic": "difference", "crisis_level": "mild"},
            {"type": "education", "topic": "executive_dysfunction", "crisis_level": "mild"},
            {"type": "reframe", "topic": "hyperfocus", "crisis_level": "none"},
            {"type": "validation", "topic": "rejection_sensitivity", "crisis_level": "moderate"},
            {"type": "education", "topic": "time_blindness", "crisis_level": "mild"},
            {"type": "education", "topic": "motivation", "crisis_level": "mild"},
            {"type": "validation", "topic": "emotional_dysregulation", "crisis_level": "moderate"},
            {"type": "education", "topic": "working_memory", "crisis_level": "mild"},
            {"type": "education", "topic": "stimulation_needs", "crisis_level": "none"},
            {"type": "validation", "topic": "masking", "crisis_level": "moderate"},
            {"type": "grounding", "topic": "paralysis", "crisis_level": "severe"}
        ]
        
        added = self.add_unique_content("therapeutic_responses", responses, metadatas)
        print(f"   ✅ Added {added} new therapeutic responses")
    
    def seed_intervention_library(self):
        """Seed crisis intervention techniques"""
        print("🆘 Seeding intervention library...")
        
        interventions = [
            "Let's start with just one deep breath. In through your nose for 4 counts, hold for 4, out through your mouth for 6.",
            "Right now, name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, 1 thing you can taste.",
            "Your safety is the most important thing right now. Are you in a safe space? Can you move to one if needed?",
            "This intense feeling will pass. ADHD emotions are like waves - they peak and then they recede. You've gotten through this before.",
            "Let's use the TIPP technique: splash cold water on your face, do 10 jumping jacks, breathe slowly, and tense then relax your muscles.",
            "Try the STOP technique: Stop what you're doing, Take a breath, Observe your thoughts and feelings, Proceed mindfully.",
            "Use bilateral stimulation: tap your knees alternating left-right, or cross your arms and pat your shoulders.",
            "Ground yourself: press your feet firmly into the floor, feel the weight of your body in the chair.",
            "Name your emotions: 'I'm feeling overwhelming anxiety right now' - labeling helps your brain process.",
            "Use the 4-7-8 breath: breathe in for 4, hold for 7, exhale slowly for 8 counts.",
            "Try progressive muscle relaxation: tense your shoulders for 5 seconds, then release and notice the contrast.",
            "Use the RAIN technique: Recognize what's happening, Allow the experience, Investigate with kindness, Natural awareness.",
            "Practice radical acceptance: 'This is what I'm feeling right now, and that's okay.'",
            "Use your senses: hold an ice cube, smell something strong, listen to calming music.",
            "Create safety: remind yourself where you are, that you're safe, and this will pass."
        ]
        
        metadatas = [
            {"technique": "breathing", "crisis_level": "moderate", "duration": "30 seconds", "type": "physiological"},
            {"technique": "grounding", "crisis_level": "moderate", "duration": "2 minutes", "type": "sensory"},
            {"technique": "safety", "crisis_level": "severe", "duration": "1 minute", "type": "assessment"},
            {"technique": "validation", "crisis_level": "moderate", "duration": "30 seconds", "type": "cognitive"},
            {"technique": "DBT_TIPP", "crisis_level": "severe", "duration": "5 minutes", "type": "physiological"},
            {"technique": "mindfulness", "crisis_level": "mild", "duration": "1 minute", "type": "cognitive"},
            {"technique": "bilateral_stimulation", "crisis_level": "moderate", "duration": "1 minute", "type": "physiological"},
            {"technique": "grounding", "crisis_level": "mild", "duration": "30 seconds", "type": "physical"},
            {"technique": "emotion_labeling", "crisis_level": "moderate", "duration": "30 seconds", "type": "cognitive"},
            {"technique": "breathing", "crisis_level": "moderate", "duration": "1 minute", "type": "physiological"},
            {"technique": "progressive_relaxation", "crisis_level": "mild", "duration": "2 minutes", "type": "physiological"},
            {"technique": "RAIN", "crisis_level": "moderate", "duration": "3 minutes", "type": "mindfulness"},
            {"technique": "acceptance", "crisis_level": "moderate", "duration": "30 seconds", "type": "cognitive"},
            {"technique": "sensory", "crisis_level": "severe", "duration": "1 minute", "type": "sensory"},
            {"technique": "safety_reminder", "crisis_level": "severe", "duration": "30 seconds", "type": "cognitive"}
        ]
        
        added = self.add_unique_content("intervention_library", interventions, metadatas)
        print(f"   ✅ Added {added} new intervention techniques")
    
    def seed_user_patterns(self):
        """Seed user pattern recognition data"""
        print("👤 Seeding user pattern library...")
        
        patterns = [
            "User shows attention fade pattern: short responses, 'idk', 'ok', 'whatever' - needs micro-breaks and simplified guidance.",
            "User exhibits ADHD emotional dysregulation: intense emotions, catastrophic thinking - needs validation and grounding first.",
            "User demonstrates hyperfocus tendency: very long messages, detailed explanations - can handle more complex interventions.",
            "User shows executive dysfunction: difficulty with decisions, feeling overwhelmed by choices - needs structured options.",
            "User displays rejection sensitivity: takes feedback personally, needs extra validation and gentle approach.",
            "User exhibits time blindness: underestimates task duration, struggles with transitions - needs explicit time awareness.",
            "User shows working memory challenges: loses track of conversation, needs frequent summaries and simple instructions.",
            "User demonstrates perfectionism paralysis: afraid to start tasks, overwhelmed by standards - needs permission to be imperfect.",
            "User exhibits emotional overwhelm: big feelings about small things - needs validation that emotions are proportional to ADHD brain.",
            "User shows masking exhaustion: appears fine but struggling internally - needs permission to unmask and be authentic.",
            "User demonstrates dopamine-seeking: difficulty with boring tasks, needs novelty - needs gamification and rewards.",
            "User exhibits social anxiety: fears judgment about ADHD traits - needs reassurance about neurodivergent authenticity.",
            "User shows cognitive overload: too many thoughts at once - needs brain dump and prioritization techniques.",
            "User demonstrates imposter syndrome: feels like fraud despite success - needs validation of ADHD strengths.",
            "User exhibits crisis escalation: moves quickly from mild to severe distress - needs early intervention recognition."
        ]
        
        metadatas = [
            {"pattern": "attention_fade", "intervention": "micro_breaks", "priority": "high"},
            {"pattern": "emotional_dysregulation", "intervention": "validation_first", "priority": "high"},
            {"pattern": "hyperfocus", "intervention": "complex_ok", "priority": "medium"},
            {"pattern": "executive_dysfunction", "intervention": "structure_needed", "priority": "high"},
            {"pattern": "rejection_sensitivity", "intervention": "extra_validation", "priority": "high"},
            {"pattern": "time_blindness", "intervention": "time_awareness", "priority": "medium"},
            {"pattern": "working_memory", "intervention": "simplify_repeat", "priority": "high"},
            {"pattern": "perfectionism", "intervention": "permission_imperfect", "priority": "medium"},
            {"pattern": "emotional_overwhelm", "intervention": "validate_proportionality", "priority": "high"},
            {"pattern": "masking_exhaustion", "intervention": "permission_authentic", "priority": "high"},
            {"pattern": "dopamine_seeking", "intervention": "gamification", "priority": "medium"},
            {"pattern": "social_anxiety", "intervention": "neurodivergent_acceptance", "priority": "medium"},
            {"pattern": "cognitive_overload", "intervention": "brain_dump", "priority": "high"},
            {"pattern": "imposter_syndrome", "intervention": "strength_validation", "priority": "medium"},
            {"pattern": "crisis_escalation", "intervention": "early_intervention", "priority": "critical"}
        ]
        
        added = self.add_unique_content("user_patterns", patterns, metadatas)
        print(f"   ✅ Added {added} new user patterns")
    
    def seed_all(self):
        """Seed all therapeutic knowledge"""
        print("🌱 Seeding Therapeutic Knowledge Base")
        print("=" * 50)
        
        if not self.check_service_health():
            print("❌ Vector service is not running. Please start it first:")
            print("   python start_vector_service.py")
            return
        
        # Show current state
        print("📊 Current collection sizes:")
        for collection in ["therapeutic_responses", "intervention_library", "user_patterns"]:
            count = self.get_collection_count(collection)
            print(f"   • {collection}: {count} documents")
        print()
        
        # Seed each collection
        self.seed_therapeutic_responses()
        self.seed_intervention_library()
        self.seed_user_patterns()
        
        print("\n📊 Final collection sizes:")
        for collection in ["therapeutic_responses", "intervention_library", "user_patterns"]:
            count = self.get_collection_count(collection)
            print(f"   • {collection}: {count} documents")
        
        print("\n🎉 Therapeutic knowledge seeding complete!")
        print("💾 All content is persistently stored and will survive service restarts.")
        print("🔄 Run this script again anytime to add new therapeutic content.")

def main():
    seeder = TherapeuticSeeder()
    seeder.seed_all()

if __name__ == "__main__":
    main()

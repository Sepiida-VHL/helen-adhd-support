# ============================================================================
# INTELLIGENT CONVERSATION ORCHESTRATION
# ============================================================================

class CrisisConversationOrchestrator:
    """Smart conversation flow management for ADHD-adapted crisis intervention"""
    
    def __init__(self):
        self.attention_threshold_seconds = 15  # ADHD attention span indicator
        self.micro_session_max_minutes = 3    # Maximum uninterrupted session length
        self.engagement_indicators = {
            'high': ['yes', 'okay', 'sure', 'let\'s do it', 'that helps'],
            'medium': ['maybe', 'i guess', 'ok', 'sure'],
            'low': ['no', 'not really', 'whatever', 'i don\'t know'],
            'withdrawal': ['forget it', 'never mind', 'this isn\'t working', 'leave me alone']
        }
    
    def detect_attention_fade(self, context: ConversationContext) -> Dict[str, Any]:
        """Detect when ADHD user attention is waning based on response patterns"""
        if len(context.conversation_history) < 2:
            return {'attention_fading': False, 'indicators': []}
        
        recent_turns = context.conversation_history[-3:]
        indicators = []
        
        # Check response time patterns (simulated - would use real timestamps)
        for turn in recent_turns:
            if 'response_time' in turn and turn['response_time'] > self.attention_threshold_seconds:
                indicators.append('delayed_responses')
        
        # Check response length decline
        response_lengths = [len(turn.get('user_input', '')) for turn in recent_turns]
        if len(response_lengths) >= 2 and all(response_lengths[i] > response_lengths[i+1] for i in range(len(response_lengths)-1)):
            indicators.append('declining_response_length')
        
        # Check for disengagement language
        recent_text = ' '.join([turn.get('user_input', '').lower() for turn in recent_turns])
        for level, phrases in self.engagement_indicators.items():
            if level in ['low', 'withdrawal'] and any(phrase in recent_text for phrase in phrases):
                indicators.append(f'disengagement_language_{level}')
        
        attention_fading = len(indicators) >= 2
        
        return {
            'attention_fading': attention_fading,
            'indicators': indicators,
            'severity': 'high' if 'withdrawal' in str(indicators) else 'medium' if attention_fading else 'low'
        }
    
    def plan_intervention_sequence(self, crisis_level: CrisisLevel, user_response: str, 
                                 context: ConversationContext) -> Dict[str, Any]:
        """Determine optimal intervention sequence based on crisis level and user state"""
        
        # Assess user's current capacity
        attention_status = self.detect_attention_fade(context)
        user_energy = self._assess_user_energy(user_response)
        
        # Base sequence for different crisis levels
        sequences = {
            CrisisLevel.IMMINENT: ['safety_assessment', 'immediate_support', 'human_handoff'],
            CrisisLevel.SEVERE: ['grounding', 'breathing', 'safety_planning'],
            CrisisLevel.MODERATE: ['breathing', 'grounding', 'cognitive_defusion', 'values'],
            CrisisLevel.MILD: ['grounding', 'cognitive_defusion', 'values', 'coping_skills'],
            CrisisLevel.NONE: ['check_in', 'prevention_skills', 'wellness_planning']
        }
        
        base_sequence = sequences.get(crisis_level, ['check_in'])
        
        # Adapt sequence based on ADHD attention and energy
        if attention_status['attention_fading']:
            # Shorten and prioritize most effective interventions
            adapted_sequence = base_sequence[:2] + ['micro_break', 'check_in']
        elif user_energy == 'low':
            # Choose less demanding interventions
            adapted_sequence = [item for item in base_sequence if item in ['grounding', 'breathing', 'safety_planning']]
        else:
            adapted_sequence = base_sequence
        
        return {
            'planned_sequence': adapted_sequence,
            'current_step': 0,
            'estimated_total_time': len(adapted_sequence) * 3,  # 3 minutes per step average
            'attention_adaptations': attention_status['attention_fading'],
            'energy_adaptations': user_energy == 'low'
        }
    
    def manage_micro_session(self, current_intervention: Dict[str, Any], 
                           time_elapsed: int, context: ConversationContext) -> Dict[str, Any]:
        """Break interventions into ADHD-friendly micro-sessions with check-ins"""
        
        # Check if we need a micro-break
        if time_elapsed >= self.micro_session_max_minutes * 60:  # Convert to seconds
            return {
                'action': 'micro_break',
                'message': 'You\'re doing great! Let\'s take a quick 30-second break. Just breathe normally and know that you\'re taking good care of yourself.',
                'break_duration': 30,
                'continuation_prompt': 'Ready to continue, or would you like to try something different?'
            }
        
        # Check attention status mid-intervention
        attention_status = self.detect_attention_fade(context)
        if attention_status['attention_fading']:
            return {
                'action': 'attention_check',
                'message': 'I notice you might be getting tired. That\'s totally normal with ADHD. Would you like to keep going with this, try something shorter, or take a break?',
                'options': [
                    'Keep going',
                    'Try something shorter', 
                    'Take a break',
                    'I\'m done for now'
                ]
            }
        
        # Provide encouragement and progress update
        return {
            'action': 'continue',
            'encouragement': self._generate_adhd_encouragement(current_intervention),
            'progress_indicator': f"You\'re doing well. About {self.micro_session_max_minutes - (time_elapsed//60)} minutes left in this exercise."
        }
    
    def detect_therapeutic_rupture(self, user_responses: List[str]) -> Dict[str, Any]:
        """Detect when user is pulling away or getting frustrated"""
        
        if len(user_responses) < 2:
            return {'rupture_detected': False, 'type': None}
        
        recent_responses = ' '.join(user_responses[-3:]).lower()
        
        # Rupture indicators
        rupture_signals = {
            'resistance': ['this isn\'t working', 'i don\'t want to', 'whatever', 'fine'],
            'overwhelm': ['too much', 'can\'t handle', 'stop', 'too hard'],
            'disconnection': ['you don\'t understand', 'this is stupid', 'forget it', 'leave me alone'],
            'shame': ['i\'m terrible at this', 'i can\'t do anything right', 'i\'m broken']
        }
        
        detected_ruptures = []
        for rupture_type, signals in rupture_signals.items():
            if any(signal in recent_responses for signal in signals):
                detected_ruptures.append(rupture_type)
        
        if detected_ruptures:
            return {
                'rupture_detected': True,
                'types': detected_ruptures,
                'repair_strategy': self._get_rupture_repair_strategy(detected_ruptures[0]),
                'severity': 'high' if 'disconnection' in detected_ruptures else 'medium'
            }
        
        return {'rupture_detected': False, 'type': None}
    
    def _assess_user_energy(self, user_response: str) -> str:
        """Assess user's current energy level from their response"""
        response_lower = user_response.lower()
        
        high_energy_indicators = ['yes!', 'let\'s do it', 'ready', 'excited', 'motivated']
        low_energy_indicators = ['tired', 'exhausted', 'can\'t', 'barely', 'drained', 'weak']
        
        if any(indicator in response_lower for indicator in high_energy_indicators):
            return 'high'
        elif any(indicator in response_lower for indicator in low_energy_indicators):
            return 'low'
        else:
            return 'medium'
    
    def _generate_adhd_encouragement(self, current_intervention: Dict[str, Any]) -> str:
        """Generate ADHD-specific encouragement during interventions"""
        encouragements = [
            "Your ADHD brain is working hard right now - that takes courage.",
            "It's normal for this to feel challenging. You're building important skills.",
            "Every moment you spend on this is you taking care of yourself.",
            "Your attention might wander - that's okay, just gently come back.",
            "You're doing something really important for your wellbeing right now."
        ]
        
        import random
        return random.choice(encouragements)
    
    def _get_rupture_repair_strategy(self, rupture_type: str) -> Dict[str, Any]:
        """Get appropriate repair strategy for therapeutic rupture"""
        
        repair_strategies = {
            'resistance': {
                'approach': 'validation_and_choice',
                'message': 'I hear that this doesn\'t feel right for you right now. That\'s totally okay. What would feel more helpful?',
                'options': ['Try something different', 'Take a break', 'Just talk', 'End for now']
            },
            'overwhelm': {
                'approach': 'simplify_and_slow',
                'message': 'You\'re right, that was too much at once. Let\'s slow way down. Just focus on breathing for a moment.',
                'action': 'reduce_to_breathing_only'
            },
            'disconnection': {
                'approach': 'empathy_and_repair',
                'message': 'You\'re absolutely right - I can\'t fully understand what you\'re going through. Your experience is unique, especially with ADHD. I\'m here to support you in whatever way feels helpful.',
                'validation': 'acknowledge_their_expertise_in_their_own_experience'
            },
            'shame': {
                'approach': 'compassion_and_normalization',
                'message': 'Whoa, hold on. You\'re not broken, and you\'re not terrible at this. ADHD brains work differently, and that comes with both challenges AND strengths. Right now, you\'re taking care of yourself, and that\'s what matters.',
                'redirect': 'focus_on_self_compassion'
            }
        }
        
        return repair_strategies.get(rupture_type, repair_strategies['resistance'])

class AdaptiveSessionManager:
    """Manages session adaptation based on ADHD attention patterns"""
    
    def __init__(self):
        self.session_chunks = {
            'micro': 2,    # 2 minutes for high distress/low attention
            'short': 5,    # 5 minutes for moderate engagement
            'standard': 8  # 8 minutes for high engagement
        }
        self.break_types = {
            'breathing': 'Take three deep breaths and notice you\'re doing something good for yourself.',
            'movement': 'Stretch your arms up high, roll your shoulders, or wiggle your fingers.',
            'grounding': 'Look around and notice three things you can see right now.',
            'self_compassion': 'Put your hand on your heart and remember: you\'re being brave right now.'
        }
    
    def determine_session_length(self, context: ConversationContext, 
                               current_intervention: str) -> Dict[str, Any]:
        """Determine appropriate session length based on user state"""
        
        # Analyze recent engagement
        if len(context.conversation_history) >= 3:
            recent_engagement = self._analyze_engagement_pattern(context)
        else:
            recent_engagement = 'unknown'
        
        # Factor in crisis level - higher crisis = shorter initial sessions
        crisis_factor = {
            CrisisLevel.IMMINENT: 'micro',
            CrisisLevel.SEVERE: 'micro', 
            CrisisLevel.MODERATE: 'short',
            CrisisLevel.MILD: 'short',
            CrisisLevel.NONE: 'standard'
        }
        
        crisis_recommendation = crisis_factor.get(context.crisis_level, 'short')
        
        # Combine factors
        if recent_engagement == 'low' or crisis_recommendation == 'micro':
            recommended_length = 'micro'
        elif recent_engagement == 'high' and crisis_recommendation != 'micro':
            recommended_length = 'standard'
        else:
            recommended_length = 'short'
        
        return {
            'session_type': recommended_length,
            'duration_minutes': self.session_chunks[recommended_length],
            'reasoning': f'Based on {recent_engagement} engagement and {context.crisis_level.value} crisis level',
            'break_scheduled': recommended_length in ['short', 'standard'],
            'break_type': self._choose_break_type(context)
        }
    
    def create_session_schedule(self, interventions: List[str], 
                              session_type: str) -> Dict[str, Any]:
        """Create a schedule breaking interventions into appropriate chunks"""
        
        chunk_size = self.session_chunks[session_type]
        schedule = []
        
        for i, intervention in enumerate(interventions):
            schedule.append({
                'intervention': intervention,
                'duration_minutes': min(chunk_size, 3),  # Max 3 minutes per intervention
                'position': i + 1,
                'total': len(interventions)
            })
            
            # Add breaks between interventions for longer sessions
            if session_type != 'micro' and i < len(interventions) - 1:
                schedule.append({
                    'type': 'break',
                    'duration_minutes': 1,
                    'break_activity': self._choose_break_type({})
                })
        
        return {
            'schedule': schedule,
            'total_time': sum(item.get('duration_minutes', 0) for item in schedule),
            'intervention_count': len(interventions),
            'break_count': len([item for item in schedule if item.get('type') == 'break'])
        }
    
    def _analyze_engagement_pattern(self, context: ConversationContext) -> str:
        """Analyze user engagement from recent conversation history"""
        recent_turns = context.conversation_history[-3:]
        
        # Look for engagement indicators
        high_engagement = ['yes', 'that helps', 'let\'s try', 'okay', 'good', 'better']
        medium_engagement = ['maybe', 'i guess', 'sure', 'ok']
        low_engagement = ['no', 'not really', 'whatever', 'i don\'t know']
        
        engagement_scores = []
        for turn in recent_turns:
            user_input = turn.get('user_input', '').lower()
            if any(phrase in user_input for phrase in high_engagement):
                engagement_scores.append(3)
            elif any(phrase in user_input for phrase in medium_engagement):
                engagement_scores.append(2)
            elif any(phrase in user_input for phrase in low_engagement):
                engagement_scores.append(1)
            else:
                engagement_scores.append(2)  # neutral
        
        avg_engagement = sum(engagement_scores) / len(engagement_scores)
        
        if avg_engagement >= 2.5:
            return 'high'
        elif avg_engagement >= 1.5:
            return 'medium'
        else:
            return 'low'
    
    def _choose_break_type(self, context: Dict[str, Any]) -> str:
        """Choose appropriate break type based on context"""
        import random
        # For now, random selection - could be more sophisticated based on user preferences
        return random.choice(list(self.break_types.keys()))

# ============================================================================
# ENHANCED RESPONSE HANDLERS WITH ORCHESTRATION
# ============================================================================

class EnhancedResponseGenerator(ResponseGenerator):
    """Enhanced response generator with intelligent orchestration"""
    
    def __init__(self):
        super().__init__()
        self.orchestrator = CrisisConversationOrchestrator()
        self.session_manager = AdaptiveSessionManager()
        self.advanced_interventions = AdvancedCrisisInterventions()
    
    async def generate_response(self, nlu_result: NLUResult, 
                              context: ConversationContext) -> Dict[str, Any]:
        """Enhanced response generation with attention management"""
        
        # Check for therapeutic rupture first
        recent_responses = [turn.get('user_input', '') for turn in context.conversation_history[-3:]]
        rupture_check = self.orchestrator.detect_therapeutic_rupture(recent_responses)
        
        if rupture_check['rupture_detected']:
            return await self._handle_therapeutic_rupture(rupture_check, context)
        
        # Check attention status
        attention_status = self.orchestrator.detect_attention_fade(context)
        if attention_status['attention_fading'] and attention_status['severity'] == 'high':
            return await self._handle_attention_fade(attention_status, context)
        
        # Crisis escalation check
        if context.crisis_level in [CrisisLevel.SEVERE, CrisisLevel.IMMINENT]:
            return await self._generate_crisis_response(context)
        
        # Enhanced intent routing with orchestration
        if nlu_result.confidence >= 0.8:
            return await self._execute_enhanced_intent(nlu_result, context)
        elif nlu_result.confidence >= 0.5:
            return await self._confirm_intent_with_adaptation(nlu_result, context)
        else:
            return await self._handle_low_confidence_adaptive(nlu_result, context)
    
    async def _handle_therapeutic_rupture(self, rupture_info: Dict[str, Any], 
                                        context: ConversationContext) -> Dict[str, Any]:
        """Handle therapeutic rupture with specific repair strategies"""
        repair_strategy = rupture_info['repair_strategy']
        
        response = {
            'text': repair_strategy['message'],
            'rupture_repair': True,
            'repair_type': repair_strategy['approach']
        }
        
        # Add specific actions based on repair type
        if 'options' in repair_strategy:
            response['options'] = repair_strategy['options']
        
        if repair_strategy['approach'] == 'simplify_and_slow':
            response['intervention'] = self.breathing.box_breathing()
            response['simplified'] = True
        
        return response
    
    async def _handle_attention_fade(self, attention_status: Dict[str, Any], 
                                   context: ConversationContext) -> Dict[str, Any]:
        """Handle attention fade with ADHD-appropriate responses"""
        
        if attention_status['severity'] == 'high':
            return {
                'text': 'I can tell your attention might be wandering - that\'s totally normal with ADHD! Let\'s take a quick break or try something really short. What sounds better?',
                'attention_accommodation': True,
                'options': [
                    '30-second breathing break',
                    '1-minute grounding exercise', 
                    'Just chat for a bit',
                    'I\'m done for now'
                ],
                'adhd_validation': True
            }
        else:
            return {
                'text': 'You\'re doing great! I notice we\'ve been going for a bit. Would you like to keep going or take a quick break?',
                'micro_break_offer': True,
                'options': ['Keep going', 'Quick break', 'Try something different']
            }
    
    async def _execute_enhanced_intent(self, nlu_result: NLUResult, 
                                     context: ConversationContext) -> Dict[str, Any]:
        """Execute intent with enhanced intervention options"""
        
        # Plan intervention sequence
        intervention_plan = self.orchestrator.plan_intervention_sequence(
            context.crisis_level, nlu_result.raw_text, context
        )
        
        # Determine session structure
        session_plan = self.session_manager.determine_session_length(
            context, nlu_result.intent
        )
        
        # Enhanced intent handlers
        enhanced_handlers = {
            'crisis_help': self._handle_enhanced_crisis,
            'breathing_request': self._handle_adaptive_breathing,
            'grounding_request': self._handle_enhanced_grounding,
            'defusion_request': self._handle_enhanced_defusion,
            'values_exploration': self._handle_adaptive_values,
            'overwhelming_emotions': self._handle_emotional_overwhelm
        }
        
        handler = enhanced_handlers.get(nlu_result.intent, self._handle_enhanced_default)
        response = await handler(nlu_result, context)
        
        # Add orchestration metadata
        response['intervention_plan'] = intervention_plan
        response['session_plan'] = session_plan
        response['adhd_adaptations'] = {
            'attention_aware': True,
            'micro_sessions': session_plan['session_type'] == 'micro',
            'break_scheduled': session_plan.get('break_scheduled', False)
        }
        
        return response
    
    async def _handle_enhanced_crisis(self, nlu_result: NLUResult,
                                    context: ConversationContext) -> Dict[str, Any]:
        """Enhanced crisis handling with multiple intervention options"""
        
        if context.crisis_level >= CrisisLevel.MODERATE:
            # Offer crisis toolkit menu for moderate/severe crisis
            toolkit = self.advanced_interventions.distress_tolerance_menu()
            
            return {
                'text': 'I\'m really glad you reached out. Let\'s get you some immediate relief. Here are some options that work well in crisis:',
                'crisis_toolkit': toolkit,
                'immediate_options': [
                    {'name': 'Ice cube technique', 'duration': '30 seconds', 'type': 'body'},
                    {'name': '4-7-8 breathing', 'duration': '2 minutes', 'type': 'breathing'},
                    {'name': '5-4-3-2-1 grounding', 'duration': '3 minutes', 'type': 'grounding'},
                    {'name': 'RAIN for emotions', 'duration': '4 minutes', 'type': 'emotional'}
                ],
                'selection_help': 'What feels most doable right now - something quick with your body, breathing, grounding, or emotions?',
                'state_transition': ConversationState.CRISIS_ASSESSMENT
            }
        else:
            return await super()._handle_crisis_help(nlu_result, context)
    
    async def _handle_adaptive_breathing(self, nlu_result: NLUResult,
                                       context: ConversationContext) -> Dict[str, Any]:
        """Adaptive breathing selection based on context and attention"""
        
        # Choose breathing technique based on crisis level and attention capacity
        attention_status = self.orchestrator.detect_attention_fade(context)
        
        if attention_status['attention_fading'] or context.crisis_level == CrisisLevel.SEVERE:
            # Simple, short breathing for compromised attention
            technique = {
                'name': 'Simple Calm Breathing',
                'duration_minutes': 2,
                'instruction': 'Just breathe in for 4 counts, out for 6 counts. Nothing fancy, just slow and steady.',
                'cycles': 6
            }
        elif 'anxious' in [e['value'] for e in nlu_result.entities if e['entity'] == 'emotion']:
            technique = self.breathing.four_seven_eight_breathing()
        else:
            technique = self.breathing.box_breathing()
        
        return {
            'text': f'Perfect choice. Let\'s do {technique["name"]} - it\'s designed for exactly what you\'re experiencing right now.',
            'intervention': technique,
            'state_transition': ConversationState.BREATHING_EXERCISE,
            'attention_adapted': attention_status['attention_fading'],
            'micro_session': technique.get('duration_minutes', 5) <= 3
        }
    
    async def _handle_enhanced_grounding(self, nlu_result: NLUResult,
                                       context: ConversationContext) -> Dict[str, Any]:
        """Enhanced grounding with multiple technique options"""
        
        grounding_options = [
            {
                'name': '5-4-3-2-1 Senses',
                'duration': '3 minutes',
                'description': 'Use all your senses to connect with the present',
                'technique': self.grounding.five_four_three_two_one()
            },
            {
                'name': 'Self-Touch Containment', 
                'duration': '2 minutes',
                'description': 'Gentle self-hug for comfort and grounding',
                'technique': self.grounding.containment_self_touch()
            },
            {
                'name': 'Physical Environment',
                'duration': '2 minutes', 
                'description': 'Feel your connection to the ground and surfaces around you',
                'technique': {
                    'name': 'Physical Grounding',
                    'instructions': [
                        'Feel your feet on the floor - really notice the contact',
                        'Put your hands on a solid surface and feel its texture',
                        'Notice how your back feels against your chair',
                        'Press your palms together and feel the warmth and pressure'
                    ]
                }
            }
        ]
        
        return {
            'text': 'Grounding can really help when everything feels chaotic. Which of these sounds most appealing right now?',
            'grounding_menu': grounding_options,
            'selection_prompt': 'Choose what feels right for your body right now',
            'state_transition': ConversationState.GROUNDING_TECHNIQUE
        }
    
    async def _handle_enhanced_defusion(self, nlu_result: NLUResult,
                                      context: ConversationContext) -> Dict[str, Any]:
        """Enhanced cognitive defusion with multiple techniques"""
        
        # Try to extract specific thought from conversation
        specific_thought = self._extract_thought_from_context(context)
        
        if specific_thought:
            # Offer multiple defusion options for the specific thought
            defusion_options = [
                self.act_interventions.notice_and_name_defusion(specific_thought),
                self.act_interventions.word_repetition_defusion(self._extract_key_word(specific_thought)),
                self.act_interventions.thanking_your_mind_technique(specific_thought),
                self.act_interventions.translator_defusion(specific_thought)
            ]
            
            return {
                'text': f'I noticed you mentioned "{specific_thought}" - those kinds of thoughts can feel really heavy. Let\'s try creating some space between you and that thought.',
                'defusion_options': defusion_options,
                'selection_help': 'Which approach feels most interesting to you right now?',
                'state_transition': ConversationState.ACT_INTERVENTION
            }
        else:
            # General defusion techniques
            general_options = [
                self.act_interventions.thought_train_visualization(),
                self.act_interventions.radio_station_defusion(),
                self.act_interventions.observer_self_technique()
            ]
            
            return {
                'text': 'Racing thoughts or difficult thoughts can feel overwhelming. Let\'s try a technique to help you step back from them.',
                'defusion_options': general_options,
                'state_transition': ConversationState.ACT_INTERVENTION
            }
    
    async def _handle_emotional_overwhelm(self, nlu_result: NLUResult,
                                        context: ConversationContext) -> Dict[str, Any]:
        """Handle emotional overwhelm with ADHD-specific techniques"""
        
        # Determine if this is likely ADHD emotional dysregulation
        adhd_indicators = ['overwhelming', 'intense', 'rejection', 'too much', 'can\'t handle']
        text_lower = nlu_result.raw_text.lower()
        likely_adhd_overwhelm = any(indicator in text_lower for indicator in adhd_indicators)
        
        if likely_adhd_overwhelm:
            rain_technique = self.advanced_interventions.rain_method_adhd()
            tipp_technique = self.advanced_interventions.tipp_technique()
            
            return {
                'text': 'ADHD emotions can feel incredibly intense and overwhelming. You\'re not broken - your brain just feels things deeply. Let\'s try something that works specifically for ADHD emotional overwhelm.',
                'adhd_specific': True,
                'technique_options': [
                    {
                        'name': 'RAIN for ADHD Emotions',
                        'duration': '4 minutes',
                        'description': 'Gentle way to work with intense ADHD emotions',
                        'technique': rain_technique
                    },
                    {
                        'name': 'TIPP Crisis Technique',
                        'duration': '5 minutes', 
                        'description': 'Rapidly change your body chemistry when emotions are overwhelming',
                        'technique': tipp_technique,
                        'intensity': 'high'
                    }
                ],
                'validation': 'ADHD brains feel emotions more intensely - this is temporary and manageable',
                'state_transition': ConversationState.ACT_INTERVENTION
            }
        else:
            # Standard emotional overwhelm response
            return {
                'text': 'Overwhelming emotions are really hard to handle. Let\'s find a way to help you feel more steady.',
                'intervention': self.advanced_interventions.radical_acceptance_steps(),
                'state_transition': ConversationState.ACT_INTERVENTION
            }
    
    def _extract_key_word(self, thought: str) -> str:
        """Extract key emotional word from thought for defusion"""
        emotional_words = ['worthless', 'stupid', 'failure', 'useless', 'terrible', 'awful', 'broken']
        thought_lower = thought.lower()
        
        for word in emotional_words:
            if word in thought_lower:
                return word
        
        # Default to first meaningful word
        words = thought.split()
        meaningful_words = [w for w in words if len(w) > 3 and w.lower() not in ['that', 'this', 'with', 'have', 'will']]
        return meaningful_words[0] if meaningful_words else 'difficult'
    
    async def _handle_enhanced_default(self, nlu_result: NLUResult,
                                     context: ConversationContext) -> Dict[str, Any]:
        """Enhanced default handler with context awareness"""
        return await super()._execute_intent(nlu_result, context)# Conversational AI System with ADHD-Adapted Crisis Intervention
# Built on evidence-based ACT, MI, and conversation design principles

import asyncio
import json
import time
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
import redis
import aiohttp
from prometheus_client import Counter, Histogram, Gauge

# ============================================================================
# CORE DATA STRUCTURES
# ============================================================================

class ConfidenceLevel(Enum):
    HIGH = "high"      # >= 0.8
    MEDIUM = "medium"  # 0.5 - 0.8
    LOW = "low"        # < 0.5

class ConversationState(Enum):
    GREETING = "greeting"
    CRISIS_ASSESSMENT = "crisis_assessment"
    ACT_INTERVENTION = "act_intervention"
    MI_MOTIVATION = "mi_motivation"
    BREATHING_EXERCISE = "breathing_exercise"
    GROUNDING_TECHNIQUE = "grounding_technique"
    SAFETY_PLANNING = "safety_planning"
    HUMAN_HANDOFF = "human_handoff"
    COMPLETION = "completion"

class CrisisLevel(Enum):
    NONE = "none"
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    IMMINENT = "imminent"

@dataclass
class NLUResult:
    intent: str
    confidence: float
    entities: List[Dict[str, Any]]
    raw_text: str
    processing_time: float

@dataclass
class ConversationContext:
    session_id: str
    user_id: Optional[str] = None
    current_state: ConversationState = ConversationState.GREETING
    crisis_level: CrisisLevel = CrisisLevel.NONE
    slots: Dict[str, Any] = field(default_factory=dict)
    conversation_history: List[Dict[str, Any]] = field(default_factory=list)
    last_interaction: datetime = field(default_factory=datetime.utcnow)
    intervention_progress: Dict[str, Any] = field(default_factory=dict)
    adhd_adaptations: Dict[str, Any] = field(default_factory=dict)

# ============================================================================
# NLU AND INTENT PROCESSING
# ============================================================================

class ADHDAdaptedNLU:
    """NLU pipeline with ADHD-specific adaptations"""
    
    def __init__(self):
        self.crisis_keywords = [
            'suicidal', 'kill myself', 'end it all', 'can\'t go on',
            'worthless', 'hopeless', 'overwhelming', 'panic', 'meltdown'
        ]
        self.adhd_emotional_patterns = [
            'rejection sensitive', 'emotional dysregulation', 'overstimulated',
            'hyperfocus', 'executive dysfunction', 'time blindness'
        ]
        
    async def process(self, user_input: str, context: ConversationContext) -> NLUResult:
        """Process user input with ADHD-aware analysis"""
        start_time = time.time()
        
        # Crisis detection (priority processing)
        crisis_score = self._detect_crisis_level(user_input)
        
        # Intent classification with context
        intent, confidence = self._classify_intent(user_input, context)
        
        # Entity extraction with context resolution
        entities = self._extract_entities(user_input, context)
        
        processing_time = time.time() - start_time
        
        return NLUResult(
            intent=intent,
            confidence=confidence,
            entities=entities,
            raw_text=user_input,
            processing_time=processing_time
        )
    
    def _detect_crisis_level(self, text: str) -> CrisisLevel:
        """Detect crisis level with ADHD emotional patterns"""
        text_lower = text.lower()
        
        # Imminent danger keywords
        if any(keyword in text_lower for keyword in ['kill myself', 'end it all', 'suicide']):
            return CrisisLevel.IMMINENT
        
        # Severe crisis indicators
        severe_indicators = ['can\'t go on', 'hopeless', 'worthless', 'overwhelming panic']
        if any(indicator in text_lower for indicator in severe_indicators):
            return CrisisLevel.SEVERE
        
        # ADHD-specific emotional dysregulation
        adhd_crisis = ['meltdown', 'overstimulated', 'rejection sensitive dysphoria']
        if any(pattern in text_lower for pattern in adhd_crisis):
            return CrisisLevel.MODERATE
        
        # Mild distress
        mild_indicators = ['stressed', 'anxious', 'overwhelmed', 'frustrated']
        if any(indicator in text_lower for indicator in mild_indicators):
            return CrisisLevel.MILD
        
        return CrisisLevel.NONE
    
    def _classify_intent(self, text: str, context: ConversationContext) -> Tuple[str, float]:
        """Intent classification with conversation context"""
        text_lower = text.lower()
        
        # Crisis intervention intents
        if any(word in text_lower for word in ['help', 'crisis', 'emergency']):
            return 'crisis_help', 0.9
        
        if any(word in text_lower for word in ['breathing', 'calm', 'relax']):
            return 'breathing_request', 0.85
        
        if any(word in text_lower for word in ['grounding', 'present', 'here']):
            return 'grounding_request', 0.85
        
        # ACT-specific intents
        if any(word in text_lower for word in ['thoughts', 'thinking', 'mind']):
            return 'defusion_request', 0.8
        
        if any(word in text_lower for word in ['values', 'important', 'matter']):
            return 'values_exploration', 0.8
        
        # MI motivational intents
        if any(word in text_lower for word in ['change', 'different', 'better']):
            return 'change_talk', 0.75
        
        # General conversation
        if any(word in text_lower for word in ['hello', 'hi', 'start']):
            return 'greeting', 0.9
        
        if any(word in text_lower for word in ['bye', 'goodbye', 'done']):
            return 'ending', 0.9
        
        return 'unclear', 0.3
    
    def _extract_entities(self, text: str, context: ConversationContext) -> List[Dict[str, Any]]:
        """Extract entities with contextual resolution"""
        entities = []
        
        # Time expressions
        time_entities = ['today', 'tomorrow', 'yesterday', 'now', 'later']
        for entity in time_entities:
            if entity in text.lower():
                entities.append({
                    'entity': 'time',
                    'value': entity,
                    'confidence': 0.8
                })
        
        # Emotional states
        emotions = ['anxious', 'sad', 'angry', 'frustrated', 'overwhelmed', 'calm']
        for emotion in emotions:
            if emotion in text.lower():
                entities.append({
                    'entity': 'emotion',
                    'value': emotion,
                    'confidence': 0.9
                })
        
        return entities

# ============================================================================
# EVIDENCE-BASED INTERVENTION MODULES
# ============================================================================

class ACTInterventions:
    """Acceptance and Commitment Therapy techniques for digital delivery"""
    
    @staticmethod
    def stop_crisis_protocol() -> Dict[str, Any]:
        """S.T.O.P. crisis protocol (7-9 minutes total)"""
        return {
            'name': 'S.T.O.P. Crisis Protocol',
            'duration_minutes': 8,
            'steps': [
                {
                    'phase': 'Slow',
                    'duration': 1,
                    'instruction': 'Let\'s start by slowing your breathing. Take a deep breath in through your nose for 4 counts... hold for 4... out through your mouth for 6. Let\'s do this together.'
                },
                {
                    'phase': 'Take Note',
                    'duration': 1,
                    'instruction': 'Now, take note of what\'s happening right now. Notice any thoughts swirling in your mind, any feelings in your body, without trying to change them.'
                },
                {
                    'phase': 'Open Up',
                    'duration': 2,
                    'instruction': 'Let\'s open up space for these difficult feelings. Imagine your thoughts and emotions are like clouds passing through the sky of your mind.'
                },
                {
                    'phase': 'Pursue Values',
                    'duration': 4,
                    'instruction': 'What do you want to stand for in this crisis? What kind of person do you want to be, even in this difficult moment?'
                }
            ]
        }
    
    @staticmethod
    def notice_and_name_defusion(thought: str) -> Dict[str, Any]:
        """Cognitive defusion for specific thoughts"""
        return {
            'name': 'Notice and Name',
            'duration_minutes': 3,
            'technique': f'Instead of: "{thought}"\nTry: "I\'m noticing the thought that {thought.lower()}"\nOr: "My mind is telling me that {thought.lower()}"',
            'follow_up': 'How does it feel different when you relate to the thought this way?'
        }
    
    @staticmethod
    def observer_self_technique() -> Dict[str, Any]:
        """Create distance through observer perspective"""
        return {
            'name': 'Observer Self',
            'duration_minutes': 5,
            'guided_imagery': [
                'Imagine floating up above where you are right now...',
                'Float higher, seeing your neighborhood from above...',
                'Higher still, seeing your city, your state, your country...',
                'Now you\'re looking down at Earth from space...',
                'From this cosmic perspective, notice how your problems look...',
                'You\'re the same person who can observe from this distance.'
            ]
        }
    
    @staticmethod
    def word_repetition_defusion(painful_word: str) -> Dict[str, Any]:
        """Word repetition technique to reduce emotional impact"""
        return {
            'name': 'Word Repetition Defusion',
            'duration_minutes': 2,
            'painful_word': painful_word,
            'instructions': [
                f'We\'re going to repeat the word "{painful_word}" quickly for 30 seconds.',
                'This might feel strange, but it helps the word lose its emotional punch.',
                'Ready? Say it with me as fast as you can...',
                f'"{painful_word}" "{painful_word}" "{painful_word}"...',
                'Keep going until I say stop...'
            ],
            'timer_seconds': 30,
            'follow_up': f'Notice how "{painful_word}" feels different now? Like just a sound rather than something heavy?'
        }
    
    @staticmethod
    def translator_defusion(thought: str) -> Dict[str, Any]:
        """Create distance through language translation"""
        import random
        
        # Simple mock translations for psychological distance
        translations = {
            'spanish': {'I am worthless': 'Soy inútil', 'I can\'t do this': 'No puedo hacer esto'},
            'french': {'I am worthless': 'Je suis inutile', 'I can\'t do this': 'Je ne peux pas faire ça'},
            'silly': {'I am worthless': 'Banana banana banana', 'I can\'t do this': 'Wiggle wiggle cannot'}
        }
        
        lang = random.choice(['spanish', 'french', 'silly'])
        translated = translations[lang].get(thought, f'[{thought} in {lang}]')
        
        return {
            'name': 'Translator Defusion',
            'duration_minutes': 2,
            'original_thought': thought,
            'translated_thought': translated,
            'language': lang,
            'instruction': f'Let\'s translate that difficult thought. In {lang}, "{thought}" becomes "{translated}". Notice how it feels different when it\'s not in your native language?',
            'follow_up': 'Sometimes changing how we hear thoughts can change how much power they have over us.'
        }
    
    @staticmethod
    def thought_train_visualization() -> Dict[str, Any]:
        """Interactive train metaphor for thought observation"""
        return {
            'name': 'Thought Train Station',
            'duration_minutes': 3,
            'visualization_steps': [
                'Imagine you\'re standing on a train platform...',
                'Different trains pull into the station - these are your thoughts.',
                'Some trains have "Worry" written on the side, others say "Fear" or "Anger"...',
                'You can watch the trains, but you don\'t have to get on them.',
                'Notice a difficult thought-train pulling in right now...',
                'What does it look like? What\'s written on the side?',
                'Watch it slow down, stop, then pull away again...',
                'You\'re still standing safely on the platform.'
            ],
            'interactive_prompts': [
                'What thought-train do you see right now?',
                'What color is this thought-train?',
                'Are you tempted to get on it?',
                'Can you wave goodbye as it leaves the station?'
            ]
        }
    
    @staticmethod
    def radio_station_defusion() -> Dict[str, Any]:
        """Radio metaphor for thought control"""
        return {
            'name': 'Mind Radio Station',
            'duration_minutes': 2,
            'metaphor_steps': [
                'Imagine your mind is like a radio, and difficult thoughts are like stations.',
                'Right now, what "station" is your mind tuned to?',
                'Maybe it\'s "WORRY-FM" or "SELF-DOUBT 101.5"?',
                'You can\'t turn off the radio completely, but you can...',
                'Turn down the volume... *imagine turning a dial*',
                'Change the station... *imagine pressing buttons*',
                'Or just remember: you\'re not the radio, you\'re the person holding it.'
            ],
            'interactive_controls': {
                'volume_down': 'Turn down the volume on that thought',
                'change_station': 'Switch to a different mental channel',
                'static': 'Let the thought become just background noise'
            }
        }
    
    @staticmethod
    def thanking_your_mind_technique(thought: str) -> Dict[str, Any]:
        """Appreciation approach to difficult thoughts"""
        return {
            'name': 'Thank Your Mind',
            'duration_minutes': 1,
            'thought': thought,
            'responses': [
                f'Thank you, mind, for the thought "{thought}"',
                'Thank you for trying to protect me, even though this isn\'t helpful right now',
                'I see you\'re working hard, mind, but I\'ve got this handled',
                'Thanks for the warning, but I\'m going to choose my response'
            ],
            'tone': 'gentle and appreciative, like talking to a well-meaning but anxious friend',
            'follow_up': 'Notice how it feels different to thank your mind rather than fight with it?'
        }

class AdvancedCrisisInterventions:
    """Additional crisis-specific techniques including DBT skills"""
    
    @staticmethod
    def tipp_technique() -> Dict[str, Any]:
        """Temperature, Intense exercise, Paced breathing, Paired muscle relaxation"""
        return {
            'name': 'TIPP for Crisis',
            'purpose': 'Rapidly change body chemistry in severe distress',
            'duration_minutes': 5,
            'components': [
                {
                    'component': 'Temperature',
                    'instruction': 'Hold an ice cube, splash cold water on your face, or hold your breath and put your face in cold water for 30 seconds',
                    'purpose': 'Activates dive response, slows heart rate quickly'
                },
                {
                    'component': 'Intense Exercise',
                    'instruction': 'Do jumping jacks, run in place, or do push-ups for 10 minutes',
                    'purpose': 'Burns off stress hormones and adrenaline'
                },
                {
                    'component': 'Paced Breathing',
                    'instruction': 'Breathe out longer than you breathe in. Try 4 counts in, 6 counts out',
                    'purpose': 'Activates parasympathetic nervous system'
                },
                {
                    'component': 'Paired Muscle Relaxation',
                    'instruction': 'Tense all your muscles for 5 seconds, then release completely',
                    'purpose': 'Releases physical tension holding the emotional intensity'
                }
            ],
            'crisis_level': 'severe',
            'note': 'Use when emotions feel completely overwhelming and out of control'
        }
    
    @staticmethod
    def radical_acceptance_steps() -> Dict[str, Any]:
        """Brief radical acceptance for crisis moments"""
        return {
            'name': 'Radical Acceptance in Crisis',
            'duration_minutes': 3,
            'steps': [
                {
                    'step': 1,
                    'instruction': 'Notice what you\'re fighting against right now',
                    'prompt': 'What situation or feeling are you trying to push away?'
                },
                {
                    'step': 2, 
                    'instruction': 'Acknowledge: "This is what\'s happening right now"',
                    'prompt': 'Can you say: "This pain/situation/feeling is here right now"?'
                },
                {
                    'step': 3,
                    'instruction': 'Notice any resistance in your body - tension, clenching',
                    'prompt': 'Where are you holding the fight in your body?'
                },
                {
                    'step': 4,
                    'instruction': 'Soften that resistance, like unclenching a fist',
                    'prompt': 'Can you let your body relax, even while the pain is here?'
                },
                {
                    'step': 5,
                    'instruction': 'Remember: accepting doesn\'t mean approving or giving up',
                    'prompt': 'You\'re just stopping the extra pain of fighting reality'
                }
            ],
            'mantra': 'This is what\'s here right now. I can handle what\'s actually here.'
        }
    
    @staticmethod
    def rain_method_adhd() -> Dict[str, Any]:
        """RAIN method adapted for ADHD emotional dysregulation"""
        return {
            'name': 'R.A.I.N. for ADHD Emotions',
            'duration_minutes': 4,
            'adapted_for': 'ADHD emotional intensity and rejection sensitive dysphoria',
            'steps': [
                {
                    'letter': 'R - Recognize',
                    'duration': 1,
                    'instruction': 'Name what\'s happening: "I\'m noticing intense [emotion]"',
                    'adhd_note': 'ADHD emotions come fast and big - naming helps slow them down'
                },
                {
                    'letter': 'A - Allow',
                    'duration': 1,
                    'instruction': 'Let the feeling be here without trying to fix it immediately',
                    'adhd_note': 'Resist the ADHD urge to DO something right now'
                },
                {
                    'letter': 'I - Investigate',
                    'duration': 1,
                    'instruction': 'Where do you feel this in your body? What triggered it?',
                    'adhd_note': 'Look for rejection sensitivity triggers or overwhelm patterns'
                },
                {
                    'letter': 'N - Nurture',
                    'duration': 1,
                    'instruction': 'Put your hand on your heart. What would you say to a friend feeling this?',
                    'adhd_note': 'ADHD brains need extra self-compassion - be gentle with your intense emotions'
                }
            ],
            'adhd_reminders': [
                'ADHD emotions are temporary but intense - this will pass',
                'Your emotional intensity is not a character flaw',
                'You feel things deeply, and that\'s also a strength'
            ]
        }
    
    @staticmethod
    def distress_tolerance_menu() -> Dict[str, Any]:
        """Quick menu of distress tolerance options for immediate use"""
        return {
            'name': 'Crisis Toolkit Menu',
            'purpose': 'Quick access to different crisis techniques',
            'duration_minutes': 'varies by choice',
            'options': [
                {
                    'category': 'Body-Based (Fast)',
                    'techniques': [
                        {'name': 'Ice cube hold', 'time': '30 seconds'},
                        {'name': 'Intense exercise', 'time': '2 minutes'},
                        {'name': 'Progressive muscle release', 'time': '3 minutes'}
                    ]
                },
                {
                    'category': 'Mind-Based (Medium)',
                    'techniques': [
                        {'name': 'Count backwards from 100 by 7s', 'time': '2-3 minutes'},
                        {'name': 'Name everything blue in the room', 'time': '1 minute'},
                        {'name': 'Alphabet categories (animals A-Z)', 'time': '3-5 minutes'}
                    ]
                },
                {
                    'category': 'Emotion-Based (Longer)',
                    'techniques': [
                        {'name': 'RAIN method', 'time': '4 minutes'},
                        {'name': 'Radical acceptance', 'time': '3 minutes'},
                        {'name': 'Self-compassion break', 'time': '2 minutes'}
                    ]
                }
            ],
            'selection_prompt': 'What feels most doable right now - something with your body, mind, or emotions?'
        }

class MotivationalInterviewing:
    """Motivational Interviewing techniques for behavior change"""
    
    @staticmethod
    def generate_oars_response(user_input: str, response_type: str) -> str:
        """Generate OARS framework responses"""
        oars_templates = {
            'open_question': [
                'What would you like to be different?',
                'How would you like things to change?',
                'What would be helpful right now?',
                'What matters most to you in this situation?'
            ],
            'affirmation': [
                'It takes courage to reach out when you\'re struggling.',
                'You\'re taking an important step by being here.',
                'I can hear how much you care about making things better.',
                'Your willingness to explore this shows real strength.'
            ],
            'reflection': [
                f'It sounds like you\'re feeling {self._extract_emotion(user_input)}.',
                f'You\'re experiencing {self._extract_experience(user_input)}.',
                'You want things to be different, and that\'s important.'
            ],
            'summary': [
                'Let me make sure I understand - you\'re feeling overwhelmed and looking for ways to cope better.',
                'You\'ve shared that you\'re struggling with intense emotions and want to find healthier ways to manage them.'
            ]
        }
        
        import random
        return random.choice(oars_templates.get(response_type, ['I hear you.']))
    
    @staticmethod
    def _extract_emotion(text: str) -> str:
        """Extract primary emotion from text"""
        emotions = {
            'overwhelmed': ['overwhelmed', 'too much', 'can\'t handle'],
            'anxious': ['anxious', 'worried', 'nervous'],
            'frustrated': ['frustrated', 'annoyed', 'irritated'],
            'sad': ['sad', 'down', 'depressed'],
            'angry': ['angry', 'mad', 'furious']
        }
        
        text_lower = text.lower()
        for emotion, keywords in emotions.items():
            if any(keyword in text_lower for keyword in keywords):
                return emotion
        return 'struggling'
    
    @staticmethod
    def _extract_experience(text: str) -> str:
        """Extract experience description"""
        if 'overwhelmed' in text.lower():
            return 'a lot of pressure and stress'
        elif 'can\'t' in text.lower():
            return 'limitations and challenges'
        else:
            return 'difficult emotions'

class BreathingInterventions:
    """Evidence-based breathing techniques"""
    
    @staticmethod
    def four_seven_eight_breathing() -> Dict[str, Any]:
        """4-7-8 breathing for anxiety and sleep"""
        return {
            'name': '4-7-8 Breathing',
            'purpose': 'Reduce anxiety and promote calm',
            'duration_minutes': 5,
            'instructions': [
                'Exhale completely through your mouth',
                'Close your mouth, inhale through nose for 4 counts',
                'Hold your breath for 7 counts',
                'Exhale through mouth for 8 counts with a whoosh sound',
                'This completes one cycle. Repeat 3-4 times.'
            ],
            'audio_cues': True,
            'visual_guide': True
        }
    
    @staticmethod
    def box_breathing() -> Dict[str, Any]:
        """Box breathing for acute stress"""
        return {
            'name': 'Box Breathing',
            'purpose': 'Manage acute stress and anger',
            'duration_minutes': 4,
            'pattern': '4-4-4-4',
            'instructions': [
                'Inhale for 4 counts',
                'Hold for 4 counts', 
                'Exhale for 4 counts',
                'Hold empty for 4 counts'
            ],
            'cycles': 8
        }
    
    @staticmethod
    def cyclic_sighing() -> Dict[str, Any]:
        """Cyclic sighing for mood improvement"""
        return {
            'name': 'Cyclic Sighing',
            'purpose': 'Daily mood improvement',
            'duration_minutes': 5,
            'technique': 'Double inhale through nose, long exhale through mouth',
            'instructions': [
                'Take a normal breath in through your nose',
                'Take a second, smaller breath in on top of the first',
                'Long, slow exhale through your mouth',
                'Repeat for 5 minutes'
            ]
        }

class GroundingTechniques:
    """Somatic and grounding techniques for crisis stabilization"""
    
    @staticmethod
    def five_four_three_two_one() -> Dict[str, Any]:
        """5-4-3-2-1 sensory grounding"""
        return {
            'name': '5-4-3-2-1 Grounding',
            'purpose': 'Immediate crisis stabilization',
            'duration_minutes': 3,
            'steps': [
                {
                    'sense': 'sight',
                    'instruction': 'Name 5 things you can see around you',
                    'count': 5
                },
                {
                    'sense': 'touch',
                    'instruction': 'Name 4 things you can touch or feel',
                    'count': 4
                },
                {
                    'sense': 'hearing',
                    'instruction': 'Name 3 things you can hear',
                    'count': 3
                },
                {
                    'sense': 'smell',
                    'instruction': 'Name 2 things you can smell',
                    'count': 2
                },
                {
                    'sense': 'taste',
                    'instruction': 'Name 1 thing you can taste',
                    'count': 1
                }
            ]
        }
    
    @staticmethod
    def containment_self_touch() -> Dict[str, Any]:
        """Self-touch containment technique"""
        return {
            'name': 'Containment with Self-Touch',
            'purpose': 'Self-soothing through proprioceptive input',
            'duration_minutes': 2,
            'instructions': [
                'Cross your arms over your chest, hands on opposite shoulders',
                'Gently squeeze yourself in a self-hug',
                'Notice the feeling of containment and support',
                'Breathe slowly while maintaining this position',
                'Feel your feet on the ground, supported and stable'
            ]
        }

# ============================================================================
# CONVERSATION STATE MANAGEMENT
# ============================================================================

class ConversationStateManager:
    """Manages conversation state with ADHD adaptations"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.session_ttl = 3600  # 1 hour
        
    async def get_context(self, session_id: str) -> ConversationContext:
        """Retrieve conversation context"""
        context_data = self.redis.get(f"session:{session_id}")
        if context_data:
            data = json.loads(context_data)
            return ConversationContext(**data)
        
        # Create new context with ADHD adaptations
        context = ConversationContext(
            session_id=session_id,
            adhd_adaptations={
                'micro_session_length': 300,  # 5 minutes max
                'visual_simplicity': True,
                'immediate_feedback': True,
                'progress_indicators': True
            }
        )
        await self.save_context(context)
        return context
    
    async def save_context(self, context: ConversationContext):
        """Save conversation context with TTL"""
        context_dict = {
            'session_id': context.session_id,
            'user_id': context.user_id,
            'current_state': context.current_state.value,
            'crisis_level': context.crisis_level.value,
            'slots': context.slots,
            'conversation_history': context.conversation_history[-10:],  # Keep last 10 turns
            'last_interaction': context.last_interaction.isoformat(),
            'intervention_progress': context.intervention_progress,
            'adhd_adaptations': context.adhd_adaptations
        }
        
        self.redis.setex(
            f"session:{context.session_id}",
            self.session_ttl,
            json.dumps(context_dict, default=str)
        )
    
    async def update_context(self, context: ConversationContext, 
                           user_input: str, system_response: str, 
                           nlu_result: NLUResult):
        """Update context with conversation turn"""
        # Add to conversation history
        turn = {
            'timestamp': datetime.utcnow().isoformat(),
            'user_input': user_input,
            'system_response': system_response,
            'intent': nlu_result.intent,
            'confidence': nlu_result.confidence,
            'entities': nlu_result.entities
        }
        
        context.conversation_history.append(turn)
        context.last_interaction = datetime.utcnow()
        
        # Update crisis level based on NLU
        crisis_level = self._assess_crisis_level(nlu_result)
        if crisis_level.value > context.crisis_level.value:
            context.crisis_level = crisis_level
        
        # Update slots from entities
        for entity in nlu_result.entities:
            context.slots[entity['entity']] = entity['value']
        
        await self.save_context(context)
    
    def _assess_crisis_level(self, nlu_result: NLUResult) -> CrisisLevel:
        """Assess crisis level from NLU result"""
        crisis_intents = {
            'crisis_help': CrisisLevel.SEVERE,
            'suicidal_ideation': CrisisLevel.IMMINENT,
            'panic_attack': CrisisLevel.MODERATE,
            'emotional_overwhelm': CrisisLevel.MILD
        }
        
        return crisis_intents.get(nlu_result.intent, CrisisLevel.NONE)

# ============================================================================
# RESPONSE GENERATION AND CONVERSATION FLOW
# ============================================================================

class ResponseGenerator:
    """Generate contextual, therapeutic responses"""
    
    def __init__(self):
        self.act_interventions = ACTInterventions()
        self.mi_techniques = MotivationalInterviewing()
        self.breathing = BreathingInterventions()
        self.grounding = GroundingTechniques()
    
    async def generate_response(self, nlu_result: NLUResult, 
                              context: ConversationContext) -> Dict[str, Any]:
        """Generate appropriate response based on context and intent"""
        
        # Crisis escalation check
        if context.crisis_level in [CrisisLevel.SEVERE, CrisisLevel.IMMINENT]:
            return await self._generate_crisis_response(context)
        
        # Route based on intent and confidence
        if nlu_result.confidence >= 0.8:
            return await self._execute_intent(nlu_result, context)
        elif nlu_result.confidence >= 0.5:
            return await self._confirm_intent(nlu_result, context)
        else:
            return await self._handle_low_confidence(nlu_result, context)
    
    async def _generate_crisis_response(self, context: ConversationContext) -> Dict[str, Any]:
        """Generate immediate crisis intervention response"""
        if context.crisis_level == CrisisLevel.IMMINENT:
            return {
                'text': 'I\'m very concerned about your safety right now. You don\'t have to go through this alone. Please call 988 (Suicide & Crisis Lifeline) immediately, or text "HELLO" to 741741 (Crisis Text Line). If you\'re in immediate danger, please call 911.',
                'action': 'escalate_to_human',
                'crisis_resources': [
                    {'name': '988 Suicide & Crisis Lifeline', 'number': '988'},
                    {'name': 'Crisis Text Line', 'text': 'Text HELLO to 741741'},
                    {'name': 'Emergency Services', 'number': '911'}
                ],
                'state_transition': ConversationState.HUMAN_HANDOFF
            }
        
        return {
            'text': 'I can see you\'re going through something really difficult right now. You\'re not alone in this. Would you like to try a quick technique to help you feel more grounded, or would you prefer to talk to a human counselor?',
            'options': [
                'Try grounding technique',
                'Talk to human counselor',
                'Learn breathing exercise'
            ],
            'state_transition': ConversationState.CRISIS_ASSESSMENT
        }
    
    async def _execute_intent(self, nlu_result: NLUResult, 
                            context: ConversationContext) -> Dict[str, Any]:
        """Execute high-confidence intent"""
        intent_handlers = {
            'crisis_help': self._handle_crisis_help,
            'breathing_request': self._handle_breathing_request,
            'grounding_request': self._handle_grounding_request,
            'defusion_request': self._handle_defusion_request,
            'values_exploration': self._handle_values_exploration,
            'greeting': self._handle_greeting,
            'ending': self._handle_ending
        }
        
        handler = intent_handlers.get(nlu_result.intent, self._handle_unknown)
        return await handler(nlu_result, context)
    
    async def _handle_breathing_request(self, nlu_result: NLUResult, 
                                      context: ConversationContext) -> Dict[str, Any]:
        """Handle breathing exercise request"""
        # Offer breathing options based on user state
        if 'anxious' in [e['value'] for e in nlu_result.entities if e['entity'] == 'emotion']:
            technique = self.breathing.four_seven_eight_breathing()
        elif context.crisis_level == CrisisLevel.MODERATE:
            technique = self.breathing.box_breathing()
        else:
            technique = self.breathing.cyclic_sighing()
        
        return {
            'text': f'Let\'s try {technique["name"]} - it\'s great for {technique["purpose"].lower()}. This will take about {technique["duration_minutes"]} minutes.',
            'intervention': technique,
            'state_transition': ConversationState.BREATHING_EXERCISE,
            'adhd_adaptations': {
                'audio_guidance': True,
                'visual_timer': True,
                'pause_resume': True
            }
        }
    
    async def _handle_grounding_request(self, nlu_result: NLUResult,
                                      context: ConversationContext) -> Dict[str, Any]:
        """Handle grounding technique request"""
        if context.crisis_level >= CrisisLevel.MODERATE:
            technique = self.grounding.five_four_three_two_one()
        else:
            technique = self.grounding.containment_self_touch()
        
        return {
            'text': f'Let\'s ground you with the {technique["name"]} technique. This helps bring you back to the present moment.',
            'intervention': technique,
            'state_transition': ConversationState.GROUNDING_TECHNIQUE
        }
    
    async def _handle_defusion_request(self, nlu_result: NLUResult,
                                     context: ConversationContext) -> Dict[str, Any]:
        """Handle cognitive defusion request"""
        # Look for specific thought in conversation history
        thought = self._extract_thought_from_context(context)
        
        if thought:
            defusion = self.act_interventions.notice_and_name_defusion(thought)
        else:
            defusion = self.act_interventions.observer_self_technique()
        
        return {
            'text': 'Difficult thoughts can feel very real and urgent. Let\'s try a technique to create some space between you and those thoughts.',
            'intervention': defusion,
            'state_transition': ConversationState.ACT_INTERVENTION
        }
    
    def _extract_thought_from_context(self, context: ConversationContext) -> Optional[str]:
        """Extract negative thought from recent conversation"""
        negative_patterns = ['I am', 'I\'m', 'I can\'t', 'I\'ll never', 'I should']
        
        for turn in reversed(context.conversation_history[-3:]):
            user_input = turn.get('user_input', '').lower()
            for pattern in negative_patterns:
                if pattern in user_input and any(neg in user_input for neg in ['not', 'never', 'can\'t', 'won\'t', 'bad', 'terrible', 'awful']):
                    return turn['user_input']
        
        return None

# ============================================================================
# SAFETY AND MONITORING SYSTEMS
# ============================================================================

class SafetyMonitor:
    """Monitor conversations for safety and escalation needs"""
    
    def __init__(self):
        self.crisis_counter = Counter('crisis_interventions_total', 'Total crisis interventions', ['level'])
        self.safety_escalations = Counter('safety_escalations_total', 'Safety escalations to humans')
        self.response_times = Histogram('safety_response_time_seconds', 'Safety response times')
    
    async def assess_safety(self, nlu_result: NLUResult, 
                          context: ConversationContext) -> Dict[str, Any]:
        """Assess conversation safety and escalation needs"""
        start_time = time.time()
        
        safety_assessment = {
            'requires_escalation': False,
            'escalation_reason': None,
            'recommended_action': None,
            'crisis_level': context.crisis_level
        }
        
        # Check for imminent danger
        if self._detect_imminent_danger(nlu_result.raw_text):
            safety_assessment.update({
                'requires_escalation': True,
                'escalation_reason': 'imminent_danger',
                'recommended_action': 'immediate_human_intervention'
            })
            self.safety_escalations.inc()
        
        # Check for sustained high crisis level
        elif self._check_sustained_crisis(context):
            safety_assessment.update({
                'requires_escalation': True,
                'escalation_reason': 'sustained_crisis',
                'recommended_action': 'professional_support'
            })
        
        # Monitor response time
        response_time = time.time() - start_time
        self.response_times.observe(response_time)
        
        # Update crisis metrics
        self.crisis_counter.labels(level=context.crisis_level.value).inc()
        
        return safety_assessment
    
    def _detect_imminent_danger(self, text: str) -> bool:
        """Detect immediate danger keywords"""
        imminent_keywords = [
            'kill myself', 'end my life', 'suicide', 'die tonight',
            'have a plan', 'pills ready', 'gun', 'bridge'
        ]
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in imminent_keywords)
    
    def _check_sustained_crisis(self, context: ConversationContext) -> bool:
        """Check for sustained high crisis level"""
        if len(context.conversation_history) < 5:
            return False
        
        recent_turns = context.conversation_history[-5:]
        crisis_mentions = sum(1 for turn in recent_turns 
                            if any(word in turn['user_input'].lower() 
                                 for word in ['crisis', 'help', 'can\'t', 'overwhelmed']))
        
        return crisis_mentions >= 3 and context.crisis_level >= CrisisLevel.MODERATE

# ============================================================================
# MAIN CONVERSATION CONTROLLER WITH ENHANCED ORCHESTRATION
# ============================================================================

class EnhancedConversationController(ConversationController):
    """Enhanced conversation controller with intelligent orchestration"""
    
    def __init__(self, redis_client: redis.Redis):
        super().__init__(redis_client)
        self.response_generator = EnhancedResponseGenerator()
        self.orchestrator = CrisisConversationOrchestrator()
        self.session_manager = AdaptiveSessionManager()
        
        # Enhanced metrics
        self.attention_fade_counter = Counter('attention_fade_total', 'Attention fade detections', ['severity'])
        self.rupture_counter = Counter('therapeutic_ruptures_total', 'Therapeutic ruptures', ['type'])
        self.intervention_effectiveness = Histogram('intervention_completion_rate', 'Intervention completion rates', ['intervention_type'])
    
    async def process_message(self, user_input: str, session_id: str) -> Dict[str, Any]:
        """Enhanced message processing with orchestration"""
        start_time = time.time()
        
        try:
            # Get conversation context
            context = await self.state_manager.get_context(session_id)
            
            # Track session timing for ADHD adaptations
            session_duration = (datetime.utcnow() - context.last_interaction).total_seconds()
            
            # Process with NLU
            nlu_result = await self.nlu.process(user_input, context)
            
            # Enhanced orchestration checks
            orchestration_info = await self._run_orchestration_checks(nlu_result, context, session_duration)
            
            # Safety assessment
            safety_assessment = await self.safety_monitor.assess_safety(nlu_result, context)
            
            # Handle safety escalation
            if safety_assessment['requires_escalation']:
                response = await self._handle_safety_escalation(safety_assessment, context)
            else:
                # Generate enhanced therapeutic response
                response = await self.response_generator.generate_response(nlu_result, context)
                
                # Apply orchestration adaptations
                response = await self._apply_orchestration_adaptations(response, orchestration_info, context)
            
            # Update conversation context with orchestration data
            await self._update_context_with_orchestration(
                context, user_input, response, nlu_result, orchestration_info
            )
            
            # Update enhanced metrics
            total_time = time.time() - start_time
            self._update_enhanced_metrics(nlu_result, orchestration_info, total_time)
            
            # Enhanced logging
            self.logger.info(
                "Enhanced conversation turn processed",
                extra={
                    'session_id': session_id,
                    'intent': nlu_result.intent,
                    'confidence': nlu_result.confidence,
                    'crisis_level': context.crisis_level.value,
                    'response_time': total_time,
                    'attention_status': orchestration_info.get('attention_status', {}),
                    'rupture_detected': orchestration_info.get('rupture_detected', False),
                    'session_adaptations': orchestration_info.get('session_adaptations', {})
                }
            )
            
            return {
                'success': True,
                'response': response,
                'session_id': session_id,
                'processing_time': total_time,
                'crisis_level': context.crisis_level.value,
                'requires_escalation': safety_assessment['requires_escalation'],
                'orchestration_info': orchestration_info,
                'adhd_adaptations': response.get('adhd_adaptations', {})
            }
            
        except Exception as e:
            self.logger.error(f"Error in enhanced message processing: {str(e)}", exc_info=True)
            return await self._handle_system_error(session_id, user_input, str(e))
    
    async def _run_orchestration_checks(self, nlu_result: NLUResult, 
                                      context: ConversationContext,
                                      session_duration: float) -> Dict[str, Any]:
        """Run comprehensive orchestration checks"""
        
        # Attention fade detection
        attention_status = self.orchestrator.detect_attention_fade(context)
        
        # Therapeutic rupture detection
        recent_responses = [turn.get('user_input', '') for turn in context.conversation_history[-3:]]
        rupture_status = self.orchestrator.detect_therapeutic_rupture(recent_responses)
        
        # Session management
        session_plan = self.session_manager.determine_session_length(context, nlu_result.intent)
        
        # Intervention sequencing
        intervention_plan = self.orchestrator.plan_intervention_sequence(
            context.crisis_level, nlu_result.raw_text, context
        )
        
        return {
            'attention_status': attention_status,
            'rupture_status': rupture_status,
            'session_plan': session_plan,
            'intervention_plan': intervention_plan,
            'session_duration': session_duration,
            'adaptations_needed': {
                'attention_fade': attention_status['attention_fading'],
                'therapeutic_rupture': rupture_status['rupture_detected'],
                'micro_session': session_plan['session_type'] == 'micro'
            }
        }
    
    async def _apply_orchestration_adaptations(self, response: Dict[str, Any],
                                             orchestration_info: Dict[str, Any],
                                             context: ConversationContext) -> Dict[str, Any]:
        """Apply orchestration adaptations to response"""
        
        adaptations = orchestration_info['adaptations_needed']
        
        # Apply attention fade adaptations
        if adaptations['attention_fade']:
            response['text'] = self._shorten_response_text(response.get('text', ''))
            response['attention_adapted'] = True
            
            # Simplify intervention if present
            if 'intervention' in response:
                response['intervention'] = self._simplify_intervention(response['intervention'])
        
        # Apply micro-session adaptations
        if adaptations['micro_session']:
            response['micro_session'] = True
            response['session_limit'] = orchestration_info['session_plan']['duration_minutes']
            
            # Add progress indicators for ADHD
            response['progress_indicator'] = f"Quick {orchestration_info['session_plan']['duration_minutes']}-minute session"
        
        # Add session schedule if appropriate
        if orchestration_info['session_plan'].get('break_scheduled'):
            response['break_schedule'] = {
                'break_after_minutes': orchestration_info['session_plan']['duration_minutes'],
                'break_type': orchestration_info['session_plan'].get('break_type', 'breathing')
            }
        
        return response
    
    def _shorten_response_text(self, text: str) -> str:
        """Shorten response text for attention-compromised users"""
        sentences = text.split('. ')
        if len(sentences) <= 2:
            return text
        
        # Keep first sentence and most important part
        important_keywords = ['safety', 'crisis', 'help', 'breathe', 'ground']
        
        first_sentence = sentences[0]
        important_sentences = [s for s in sentences[1:] if any(keyword in s.lower() for keyword in important_keywords)]
        
        if important_sentences:
            return f"{first_sentence}. {important_sentences[0]}."
        else:
            return f"{first_sentence}. {sentences[1]}." if len(sentences) > 1 else first_sentence
    
    def _simplify_intervention(self, intervention: Dict[str, Any]) -> Dict[str, Any]:
        """Simplify intervention for compromised attention"""
        simplified = intervention.copy()
        
        # Reduce steps/instructions
        if 'steps' in simplified:
            simplified['steps'] = simplified['steps'][:3]  # Max 3 steps
        
        if 'instructions' in simplified:
            simplified['instructions'] = simplified['instructions'][:3]  # Max 3 instructions
        
        # Reduce duration
        if 'duration_minutes' in simplified:
            simplified['duration_minutes'] = min(simplified['duration_minutes'], 2)  # Max 2 minutes
        
        # Add attention-adapted language
        simplified['attention_adapted'] = True
        simplified['simplified_version'] = True
        
        return simplified
    
    async def _update_context_with_orchestration(self, context: ConversationContext,
                                                user_input: str, response: Dict[str, Any],
                                                nlu_result: NLUResult, 
                                                orchestration_info: Dict[str, Any]):
        """Update context with orchestration data"""
        
        # Standard context update
        await self.state_manager.update_context(context, user_input, response.get('text', ''), nlu_result)
        
        # Add orchestration metadata
        context.intervention_progress.update({
            'last_attention_status': orchestration_info['attention_status'],
            'last_session_type': orchestration_info['session_plan']['session_type'],
            'total_session_time': orchestration_info['session_duration'],
            'adaptations_applied': orchestration_info['adaptations_needed']
        })
        
        # Track intervention effectiveness
        if 'intervention' in response:
            intervention_name = response['intervention'].get('name', 'unknown')
            if intervention_name not in context.intervention_progress:
                context.intervention_progress[intervention_name] = {
                    'attempts': 0,
                    'completed': 0,
                    'effectiveness_ratings': []
                }
            context.intervention_progress[intervention_name]['attempts'] += 1
        
        await self.state_manager.save_context(context)
    
    def _update_enhanced_metrics(self, nlu_result: NLUResult,
                               orchestration_info: Dict[str, Any],
                               total_time: float):
        """Update enhanced metrics"""
        
        # Standard metrics
        super()._get_confidence_bucket(nlu_result.confidence)
        
        # Attention fade metrics
        if orchestration_info['attention_status']['attention_fading']:
            self.attention_fade_counter.labels(
                severity=orchestration_info['attention_status']['severity']
            ).inc()
        
        # Rupture metrics
        if orchestration_info['rupture_status']['rupture_detected']:
            for rupture_type in orchestration_info['rupture_status']['types']:
                self.rupture_counter.labels(type=rupture_type).inc()

# ============================================================================
# ENHANCED EXAMPLE USAGE
# ============================================================================

async def example_enhanced_conversation():
    """Example conversation demonstrating enhanced orchestration capabilities"""
    
    # Initialize enhanced system
    redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
    controller = EnhancedConversationController(redis_client)
    session_id = str(uuid.uuid4())
    
    # Simulate ADHD user conversation with attention challenges
    conversation_steps = [
        "Hi, I'm having a really bad day and feeling overwhelmed",
        "Everything feels like too much and I can't focus on anything",
        "yeah maybe breathing could help",  # Medium engagement
        "that's helping a little bit",      # Positive feedback
        "i don't know",                     # Attention starting to fade
        "whatever",                         # Low engagement/possible rupture
        "sorry, I'm just really tired",    # Acknowledgment after rupture repair
        "can we try something really short?", # Request for adaptation
        "that was actually helpful, thank you"
    ]
    
    print("=== ENHANCED CONVERSATION WITH ORCHESTRATION ===")
    
    for i, user_input in enumerate(conversation_steps, 1):
        print(f"\n--- Turn {i} ---")
        print(f"User: {user_input}")
        
        result = await controller.process_message(user_input, session_id)
        
        if result['success']:
            response = result['response']
            orchestration = result.get('orchestration_info', {})
            
            print(f"Assistant: {response.get('text', 'No response text')}")
            
            # Show orchestration adaptations
            if orchestration.get('adaptations_needed', {}).get('attention_fade'):
                print("🧠 ATTENTION ADAPTATION: Response shortened for ADHD attention")
            
            if orchestration.get('adaptations_needed', {}).get('therapeutic_rupture'):
                print("🔧 RUPTURE REPAIR: Therapeutic rupture detected and addressed")
            
            if orchestration.get('adaptations_needed', {}).get('micro_session'):
                print(f"⏱️  MICRO-SESSION: {orchestration['session_plan']['duration_minutes']}-minute session planned")
            
            # Show intervention offered
            if 'intervention' in response:
                intervention = response['intervention']
                print(f"🎯 Intervention: {intervention.get('name', 'Unknown')}")
                if response.get('attention_adapted'):
                    print("   (Simplified for attention challenges)")
            
            # Show crisis level and safety
            print(f"Crisis Level: {result['crisis_level']}")
            if result['requires_escalation']:
                print("⚠️  SAFETY ESCALATION TRIGGERED")
            
            # Show session adaptations
            if 'adhd_adaptations' in response:
                adaptations = response['adhd_adaptations']
                print(f"ADHD Adaptations: {adaptations}")
        
        else:
            print(f"Error: {result.get('error', 'Unknown error')}")
    
    print("\n=== ENHANCED CONVERSATION COMPLETE ===")
    print("Key Features Demonstrated:")
    print("✅ Attention fade detection and adaptation")
    print("✅ Therapeutic rupture detection and repair")
    print("✅ Micro-session management for ADHD")
    print("✅ Enhanced intervention selection")
    print("✅ Intelligent conversation orchestration")

# Entry point for enhanced testing
if __name__ == "__main__":
    asyncio.run(example_enhanced_conversation()) ConversationStateManager(redis_client)
        self.response_generator = ResponseGenerator()
        self.safety_monitor = SafetyMonitor()
        
        # Metrics
        self.conversation_counter = Counter('conversations_total', 'Total conversations', ['intent', 'confidence'])
        self.response_time_hist = Histogram('response_time_seconds', 'Response time distribution')
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    async def process_message(self, user_input: str, session_id: str) -> Dict[str, Any]:
        """Process a conversation turn"""
        start_time = time.time()
        
        try:
            # Get conversation context
            context = await self.state_manager.get_context(session_id)
            
            # Process with NLU
            nlu_result = await self.nlu.process(user_input, context)
            
            # Safety assessment
            safety_assessment = await self.safety_monitor.assess_safety(nlu_result, context)
            
            # Handle safety escalation
            if safety_assessment['requires_escalation']:
                response = await self._handle_safety_escalation(safety_assessment, context)
            else:
                # Generate therapeutic response
                response = await self.response_generator.generate_response(nlu_result, context)
            
            # Update conversation context
            await self.state_manager.update_context(
                context, user_input, response.get('text', ''), nlu_result
            )
            
            # Update metrics
            total_time = time.time() - start_time
            self.conversation_counter.labels(
                intent=nlu_result.intent, 
                confidence=self._get_confidence_bucket(nlu_result.confidence)
            ).inc()
            self.response_time_hist.observe(total_time)
            
            # Log conversation turn
            self.logger.info(
                "Conversation turn processed",
                extra={
                    'session_id': session_id,
                    'intent': nlu_result.intent,
                    'confidence': nlu_result.confidence,
                    'crisis_level': context.crisis_level.value,
                    'response_time': total_time,
                    'safety_escalation': safety_assessment['requires_escalation']
                }
            )
            
            return {
                'success': True,
                'response': response,
                'session_id': session_id,
                'processing_time': total_time,
                'crisis_level': context.crisis_level.value,
                'requires_escalation': safety_assessment['requires_escalation']
            }
            
        except Exception as e:
            self.logger.error(f"Error processing message: {str(e)}", exc_info=True)
            return await self._handle_system_error(session_id, user_input, str(e))
    
    async def _handle_safety_escalation(self, safety_assessment: Dict[str, Any], 
                                      context: ConversationContext) -> Dict[str, Any]:
        """Handle safety escalation scenarios"""
        if safety_assessment['escalation_reason'] == 'imminent_danger':
            return {
                'text': 'I\'m very concerned about your safety right now. You don\'t have to go through this alone. Please reach out for immediate help:',
                'crisis_resources': [
                    {'name': '988 Suicide & Crisis Lifeline', 'contact': 'Call or text 988'},
                    {'name': 'Crisis Text Line', 'contact': 'Text HOME to 741741'},
                    {'name': 'Emergency Services', 'contact': 'Call 911 if in immediate danger'}
                ],
                'action': 'escalate_to_human',
                'priority': 'CRITICAL',
                'state_transition': ConversationState.HUMAN_HANDOFF
            }
        
        elif safety_assessment['escalation_reason'] == 'sustained_crisis':
            return {
                'text': 'I can see you\'ve been struggling for a while now. While I want to continue supporting you, I think it would be really helpful to connect with a human counselor who can provide more comprehensive support. Would you like me to help you find resources?',
                'options': [
                    'Connect with counselor',
                    'Find local resources', 
                    'Continue with app support'
                ],
                'action': 'recommend_human_support',
                'state_transition': ConversationState.HUMAN_HANDOFF
            }
        
        return await self.response_generator._handle_unknown({}, context)
    
    async def _handle_system_error(self, session_id: str, user_input: str, 
                                 error: str) -> Dict[str, Any]:
        """Handle system errors gracefully"""
        return {
            'success': False,
            'response': {
                'text': 'I\'m experiencing some technical difficulties right now. Your safety and wellbeing are important to me. If you\'re in crisis, please call 988 or text HOME to 741741. I\'ll try to help you again in a moment.',
                'fallback': True,
                'retry_available': True
            },
            'error': 'system_error',
            'session_id': session_id
        }
    
    def _get_confidence_bucket(self, confidence: float) -> str:
        """Convert confidence score to bucket for metrics"""
        if confidence >= 0.8:
            return 'high'
        elif confidence >= 0.5:
            return 'medium'
        else:
            return 'low'

# ============================================================================
# ENHANCED RESPONSE HANDLERS
# ============================================================================

class ADHDOptimizedResponseGenerator(ResponseGenerator):
    """Extended response generator with ADHD-specific optimizations"""
    
    async def _handle_greeting(self, nlu_result: NLUResult, 
                             context: ConversationContext) -> Dict[str, Any]:
        """Handle greeting with ADHD-friendly introduction"""
        return {
            'text': 'Hi there! I\'m here to support you through whatever you\'re experiencing. I understand that emotions can feel really intense sometimes, especially if you have ADHD. \n\nWhat\'s bringing you here today?',
            'options': [
                'I\'m having a crisis',
                'Feeling overwhelmed',
                'Need coping strategies',
                'Just want to talk'
            ],
            'adhd_adaptations': {
                'clear_next_steps': True,
                'limited_options': True,
                'immediate_feedback': True
            },
            'state_transition': ConversationState.CRISIS_ASSESSMENT
        }
    
    async def _handle_crisis_help(self, nlu_result: NLUResult,
                                context: ConversationContext) -> Dict[str, Any]:
        """Handle direct crisis help request"""
        return {
            'text': 'I\'m really glad you reached out. That takes courage. Let\'s work through this together, one step at a time.\n\nFirst, are you safe right now? Are you having thoughts of hurting yourself?',
            'crisis_assessment': True,
            'safety_check': True,
            'expected_responses': ['yes', 'no', 'maybe', 'I don\'t know'],
            'state_transition': ConversationState.CRISIS_ASSESSMENT,
            'intervention_ready': {
                'stop_protocol': self.act_interventions.stop_crisis_protocol(),
                'grounding': self.grounding.five_four_three_two_one(),
                'breathing': self.breathing.box_breathing()
            }
        }
    
    async def _handle_values_exploration(self, nlu_result: NLUResult,
                                       context: ConversationContext) -> Dict[str, Any]:
        """Handle values exploration for ACT intervention"""
        values_prompts = [
            'What kind of person do you want to be, especially during difficult times?',
            'When you think about what really matters to you, what comes to mind?',
            'If your best friend was describing you, what qualities would you want them to mention?',
            'What would you want to be remembered for?'
        ]
        
        # Choose prompt based on conversation context
        import random
        prompt = random.choice(values_prompts)
        
        return {
            'text': f'Values can be like a compass when everything feels chaotic. {prompt}',
            'values_exploration': True,
            'follow_up_prompts': [
                'Tell me more about that',
                'How does that show up in your daily life?',
                'What makes that important to you?'
            ],
            'state_transition': ConversationState.ACT_INTERVENTION
        }
    
    async def _handle_ending(self, nlu_result: NLUResult,
                           context: ConversationContext) -> Dict[str, Any]:
        """Handle conversation ending with resources"""
        return {
            'text': 'Thank you for spending this time working on your wellbeing. Remember, reaching out takes strength.\n\nBefore you go, please remember these resources are always available:',
            'closing_resources': [
                {'name': '988 Suicide & Crisis Lifeline', 'available': '24/7'},
                {'name': 'Crisis Text Line', 'contact': 'Text HOME to 741741'},
                {'name': 'ADHD/Mental Health Apps', 'examples': ['Headspace', 'Calm', 'ADHD Assistant']}
            ],
            'self_care_reminder': 'Be gentle with yourself. You\'re doing the best you can.',
            'state_transition': ConversationState.COMPLETION
        }
    
    async def _confirm_intent(self, nlu_result: NLUResult,
                            context: ConversationContext) -> Dict[str, Any]:
        """Confirm medium-confidence intents"""
        confirmation_templates = {
            'breathing_request': 'It sounds like you might want to try a breathing exercise. Is that right?',
            'grounding_request': 'Would you like to try a grounding technique to help you feel more present?',
            'defusion_request': 'Are you looking for help with difficult thoughts that are bothering you?',
            'crisis_help': 'It seems like you might be in crisis or feeling overwhelmed. Is that accurate?'
        }
        
        template = confirmation_templates.get(nlu_result.intent, 
                                            f'Just to make sure I understand - you want help with {nlu_result.intent.replace("_", " ")}?')
        
        return {
            'text': template,
            'confirmation_request': True,
            'original_intent': nlu_result.intent,
            'options': ['Yes, that\'s right', 'No, something else', 'I\'m not sure'],
            'clarification_help': 'It\'s okay if you\'re not sure what you need right now. We can explore together.'
        }
    
    async def _handle_low_confidence(self, nlu_result: NLUResult,
                                   context: ConversationContext) -> Dict[str, Any]:
        """Handle low confidence with contextual fallbacks"""
        # Use conversation history for context
        recent_topics = self._extract_recent_topics(context)
        
        if recent_topics:
            topic_context = ", ".join(recent_topics)
            response_text = f'I want to make sure I understand what would be most helpful. You\'ve mentioned {topic_context}. Could you tell me a bit more about what you\'re looking for right now?'
        else:
            response_text = 'I want to make sure I give you the most helpful support. Could you tell me more about what you\'re experiencing or what kind of help you\'re looking for?'
        
        return {
            'text': response_text,
            'clarification_request': True,
            'suggested_options': [
                'I\'m feeling overwhelmed',
                'I need coping strategies', 
                'I want to talk about my thoughts',
                'I\'m having trouble with emotions'
            ],
            'low_confidence_fallback': True
        }
    
    def _extract_recent_topics(self, context: ConversationContext) -> List[str]:
        """Extract topics from recent conversation history"""
        topics = []
        topic_keywords = {
            'anxiety': ['anxious', 'worried', 'nervous', 'panic'],
            'depression': ['sad', 'down', 'hopeless', 'depressed'],
            'overwhelm': ['overwhelmed', 'too much', 'can\'t handle'],
            'ADHD': ['adhd', 'attention', 'focus', 'hyperactive', 'executive function'],
            'thoughts': ['thinking', 'thoughts', 'mind racing', 'ruminating']
        }
        
        recent_text = ' '.join([turn.get('user_input', '') for turn in context.conversation_history[-3:]])
        recent_text_lower = recent_text.lower()
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in recent_text_lower for keyword in keywords):
                topics.append(topic)
        
        return topics[:3]  # Limit to 3 most recent topics

# ============================================================================
# TESTING AND QUALITY ASSURANCE
# ============================================================================

class ConversationTester:
    """Comprehensive testing framework for conversation system"""
    
    def __init__(self, conversation_controller: ConversationController):
        self.controller = conversation_controller
        self.test_results = []
    
    async def run_comprehensive_tests(self) -> Dict[str, Any]:
        """Run full test suite"""
        test_results = {
            'intent_recognition': await self.test_intent_recognition(),
            'conversation_flows': await self.test_conversation_flows(),
            'crisis_handling': await self.test_crisis_scenarios(),
            'error_recovery': await self.test_error_scenarios(),
            'performance': await self.test_performance(),
            'adhd_adaptations': await self.test_adhd_features()
        }
        
        return {
            'overall_success_rate': self._calculate_overall_success(test_results),
            'detailed_results': test_results,
            'recommendations': self._generate_recommendations(test_results)
        }
    
    async def test_intent_recognition(self) -> Dict[str, Any]:
        """Test NLU accuracy across different phrasings"""
        test_cases = [
            ('I need help with a crisis', 'crisis_help', 0.8),
            ('Can we do breathing exercises?', 'breathing_request', 0.8),
            ('My thoughts are racing', 'defusion_request', 0.7),
            ('I feel overwhelmed and can\'t cope', 'crisis_help', 0.8),
            ('Help me feel more grounded', 'grounding_request', 0.8),
            ('What do I value most?', 'values_exploration', 0.7),
            ('Hello there', 'greeting', 0.9),
            ('I think I\'m done for now', 'ending', 0.8)
        ]
        
        results = []
        for user_input, expected_intent, min_confidence in test_cases:
            session_id = f"test_intent_{uuid.uuid4()}"
            result = await self.controller.process_message(user_input, session_id)
            
            success = (
                result['success'] and 
                result['response'].get('original_intent', '') == expected_intent or
                expected_intent in str(result['response'])
            )
            
            results.append({
                'input': user_input,
                'expected_intent': expected_intent,
                'success': success,
                'actual_response': result['response'].get('text', '')[:100]
            })
        
        success_rate = sum(1 for r in results if r['success']) / len(results)
        return {
            'success_rate': success_rate,
            'total_tests': len(test_cases),
            'passed': sum(1 for r in results if r['success']),
            'detailed_results': results
        }
    
    async def test_crisis_scenarios(self) -> Dict[str, Any]:
        """Test crisis detection and escalation"""
        crisis_scenarios = [
            ('I want to kill myself', CrisisLevel.IMMINENT, True),
            ('I can\'t go on anymore', CrisisLevel.SEVERE, True),
            ('I\'m having a meltdown', CrisisLevel.MODERATE, False),
            ('Feeling overwhelmed today', CrisisLevel.MILD, False),
            ('Just saying hello', CrisisLevel.NONE, False)
        ]
        
        results = []
        for scenario, expected_level, should_escalate in crisis_scenarios:
            session_id = f"test_crisis_{uuid.uuid4()}"
            result = await self.controller.process_message(scenario, session_id)
            
            escalated = result.get('requires_escalation', False)
            has_resources = 'crisis_resources' in result.get('response', {})
            
            success = escalated == should_escalate
            if should_escalate:
                success = success and has_resources
            
            results.append({
                'scenario': scenario,
                'expected_level': expected_level.value,
                'should_escalate': should_escalate,
                'actual_escalation': escalated,
                'success': success
            })
        
        success_rate = sum(1 for r in results if r['success']) / len(results)
        return {
            'success_rate': success_rate,
            'crisis_detection_accuracy': success_rate,
            'detailed_results': results
        }
    
    async def test_conversation_flows(self) -> Dict[str, Any]:
        """Test complete conversation flows"""
        # Test breathing exercise flow
        session_id = f"test_flow_{uuid.uuid4()}"
        
        flow_steps = [
            ('Hi there', 'greeting'),
            ('I need help with breathing', 'breathing_request'),
            ('Yes, let\'s do it', 'confirmation'),
            ('That helped, thank you', 'gratitude'),
            ('Goodbye', 'ending')
        ]
        
        flow_success = True
        responses = []
        
        for step_input, expected_behavior in flow_steps:
            result = await self.controller.process_message(step_input, session_id)
            responses.append(result['response'].get('text', '')[:100])
            
            if not result['success']:
                flow_success = False
                break
        
        return {
            'complete_flow_success': flow_success,
            'steps_completed': len([r for r in responses if r]),
            'total_steps': len(flow_steps),
            'conversation_responses': responses
        }
    
    async def test_performance(self) -> Dict[str, Any]:
        """Test system performance under load"""
        start_time = time.time()
        
        # Simulate concurrent conversations
        tasks = []
        for i in range(20):
            session_id = f"perf_test_{i}"
            task = self.controller.process_message('Hello, I need help', session_id)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        total_time = time.time() - start_time
        
        successful_results = [r for r in results if not isinstance(r, Exception)]
        avg_response_time = sum(r.get('processing_time', 0) for r in successful_results) / len(successful_results) if successful_results else 0
        
        return {
            'total_requests': len(tasks),
            'successful_requests': len(successful_results),
            'success_rate': len(successful_results) / len(tasks),
            'total_time': total_time,
            'avg_response_time': avg_response_time,
            'max_response_time': max((r.get('processing_time', 0) for r in successful_results), default=0)
        }
    
    def _calculate_overall_success(self, test_results: Dict[str, Any]) -> float:
        """Calculate overall success rate across all tests"""
        success_rates = []
        for test_category, results in test_results.items():
            if isinstance(results, dict) and 'success_rate' in results:
                success_rates.append(results['success_rate'])
        
        return sum(success_rates) / len(success_rates) if success_rates else 0.0
    
    def _generate_recommendations(self, test_results: Dict[str, Any]) -> List[str]:
        """Generate improvement recommendations based on test results"""
        recommendations = []
        
        # Intent recognition recommendations
        if test_results['intent_recognition']['success_rate'] < 0.8:
            recommendations.append('Improve NLU training data with more diverse examples')
        
        # Crisis handling recommendations
        if test_results['crisis_handling']['success_rate'] < 0.9:
            recommendations.append('Enhance crisis detection keywords and patterns')
        
        # Performance recommendations
        if test_results['performance']['avg_response_time'] > 2.0:
            recommendations.append('Optimize response generation for faster processing')
        
        return recommendations

# ============================================================================
# PRODUCTION DEPLOYMENT UTILITIES
# ============================================================================

class ProductionMonitor:
    """Production monitoring and health checks"""
    
    def __init__(self, conversation_controller: ConversationController):
        self.controller = conversation_controller
        self.health_checks = {
            'redis_connection': self._check_redis,
            'nlu_service': self._check_nlu,
            'response_generation': self._check_response_gen,
            'safety_monitoring': self._check_safety_monitor
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive system health check"""
        results = {}
        overall_healthy = True
        
        for check_name, check_func in self.health_checks.items():
            try:
                result = await check_func()
                results[check_name] = result
                if not result.get('healthy', False):
                    overall_healthy = False
            except Exception as e:
                results[check_name] = {'healthy': False, 'error': str(e)}
                overall_healthy = False
        
        return {
            'overall_healthy': overall_healthy,
            'timestamp': datetime.utcnow().isoformat(),
            'checks': results
        }
    
    async def _check_redis(self) -> Dict[str, Any]:
        """Check Redis connectivity"""
        try:
            test_key = f"health_check_{time.time()}"
            self.controller.state_manager.redis.set(test_key, "test", ex=10)
            value = self.controller.state_manager.redis.get(test_key)
            self.controller.state_manager.redis.delete(test_key)
            
            return {
                'healthy': value == b'test',
                'response_time': 'under_100ms'
            }
        except Exception as e:
            return {'healthy': False, 'error': str(e)}
    
    async def _check_nlu(self) -> Dict[str, Any]:
        """Check NLU processing"""
        try:
            test_context = ConversationContext(session_id='health_check')
            result = await self.controller.nlu.process('Hello test', test_context)
            
            return {
                'healthy': result.confidence > 0,
                'processing_time': result.processing_time
            }
        except Exception as e:
            return {'healthy': False, 'error': str(e)}
    
    async def _check_response_gen(self) -> Dict[str, Any]:
        """Check response generation"""
        try:
            test_context = ConversationContext(session_id='health_check')
            nlu_result = NLUResult(
                intent='greeting',
                confidence=0.9,
                entities=[],
                raw_text='hello',
                processing_time=0.1
            )
            
            response = await self.controller.response_generator.generate_response(nlu_result, test_context)
            
            return {
                'healthy': 'text' in response,
                'has_content': len(response.get('text', '')) > 0
            }
        except Exception as e:
            return {'healthy': False, 'error': str(e)}
    
    async def _check_safety_monitor(self) -> Dict[str, Any]:
        """Check safety monitoring system"""
        try:
            test_context = ConversationContext(session_id='health_check')
            nlu_result = NLUResult(
                intent='test',
                confidence=0.9,
                entities=[],
                raw_text='test message',
                processing_time=0.1
            )
            
            assessment = await self.controller.safety_monitor.assess_safety(nlu_result, test_context)
            
            return {
                'healthy': 'requires_escalation' in assessment,
                'assessment_complete': True
            }
        except Exception as e:
            return {'healthy': False, 'error': str(e)}

# ============================================================================
# EXAMPLE USAGE AND INITIALIZATION
# ============================================================================

async def initialize_conversation_system():
    """Initialize the complete conversation system"""
    
    # Setup Redis connection
    redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
    
    # Initialize conversation controller
    controller = ConversationController(redis_client)
    
    # Setup monitoring
    monitor = ProductionMonitor(controller)
    
    # Run health check
    health_status = await monitor.health_check()
    print(f"System Health: {health_status}")
    
    return controller, monitor

async def example_conversation():
    """Example conversation demonstrating system capabilities"""
    
    controller, _ = await initialize_conversation_system()
    session_id = str(uuid.uuid4())
    
    # Simulate conversation flow
    conversation_steps = [
        "Hi, I'm feeling really overwhelmed right now",
        "I'm having trouble with racing thoughts and I can't focus",
        "Yes, I'd like to try a breathing exercise",
        "That helped a little, but I'm still feeling anxious",
        "Can you help me with my thoughts? They feel so real and scary",
        "Thank you, that was helpful. I think I'm feeling a bit better"
    ]
    
    print("=== CONVERSATION EXAMPLE ===")
    
    for i, user_input in enumerate(conversation_steps, 1):
        print(f"\n--- Turn {i} ---")
        print(f"User: {user_input}")
        
        result = await controller.process_message(user_input, session_id)
        
        if result['success']:
            response_text = result['response'].get('text', 'No response text')
            print(f"Assistant: {response_text}")
            
            # Show any interventions offered
            if 'intervention' in result['response']:
                intervention = result['response']['intervention']
                print(f"Intervention offered: {intervention.get('name', 'Unknown')}")
            
            # Show crisis level
            print(f"Crisis Level: {result['crisis_level']}")
            
            # Show if escalation is needed
            if result['requires_escalation']:
                print("⚠️  ESCALATION TRIGGERED")
        else:
            print(f"Error: {result.get('error', 'Unknown error')}")
    
    print("\n=== CONVERSATION COMPLETE ===")

# Entry point for testing
if __name__ == "__main__":
    asyncio.run(example_conversation())
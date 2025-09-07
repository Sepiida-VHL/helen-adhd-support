export enum Sender {
  User = 'user',
  AI = 'ai',
  System = 'system',
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  responseTime?: number;
  userEngagement?: EngagementLevel;
}

export enum CrisisLevel {
  NONE = "none",
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  IMMINENT = "imminent",
}

export enum ConversationState {
  GREETING = "greeting",
  CRISIS_ASSESSMENT = "crisis_assessment",
  INTERVENTION_CHOICE = "intervention_choice",
  GUIDED_INTERVENTION = "guided_intervention",
  SAFETY_PLANNING = "safety_planning",
  HUMAN_HANDOFF = "human_handoff",
  COMPLETION = "completion",
  ACT_INTERVENTION = "act_intervention",
  BREATHING_EXERCISE = "breathing_exercise",
  GROUNDING_TECHNIQUE = "grounding_technique",
  MICRO_BREAK = "micro_break",
}

export enum EngagementLevel {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  WITHDRAWAL = "withdrawal"
}

export enum AttentionStatus {
  FOCUSED = "focused",
  FADING = "fading",
  LOST = "lost"
}

export interface AttentionFadeIndicators {
  attention_fading: boolean;
  indicators: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface TherapeuticRupture {
  rupture_detected: boolean;
  types: string[];
  repair_strategy?: RuptureRepairStrategy;
  severity: 'medium' | 'high';
}

export interface RuptureRepairStrategy {
  approach: string;
  message: string;
  options?: string[];
  action?: string;
  validation?: string;
  redirect?: string;
}

export enum InterventionTechnique {
  BREATHING = "breathing",
  GROUNDING = "grounding",
  ACT_DEFUSION = "act_defusion",
  ACT_VALUES = "act_values",
  ACT_MINDFULNESS = "act_mindfulness",
  ACT_COMMITMENT = "act_commitment",
  DBT_TIPP = "dbt_tipp",
  DBT_DISTRESS_TOLERANCE = "dbt_distress_tolerance",
  RAIN = "rain",
  SAFETY_PLANNING = "safety_planning",
}

export interface InterventionTechnique {
  name: string;
  description: string;
  duration?: string;
  category?: string;
}

export interface InterventionTechniqueDetails {
  name: string;
  type: string;
  duration: string;
  description: string;
  details?: any;
  adhdAdapted?: boolean;
  crisisLevel?: CrisisLevel[];
  attentionRequired?: 'low' | 'medium' | 'high';
}

export interface BreathingTechnique {
  name: string;
  steps: { label: string; duration: number }[];
  description: string;
  purpose?: string;
  instructions?: string[];
  cycles?: number;
  pattern?: string;
  adhdTips?: string[];
}

export interface GroundingTechnique {
  name: string;
  description: string;
  steps: string[];
  duration: number;
  adhdAdaptations?: string[];
  materials?: string[];
  safetyNote?: string;
}

export interface GroundingStep {
  sense?: string;
  instruction: string;
  count?: number;
}

export interface ACTTechnique {
  name: string;
  type: string;
  duration: string;
  description: string;
  phase?: string;
  steps?: ACTStep[];
  thought?: string;
  visualization_steps?: string[];
  interactive_prompts?: string[];
  details?: any;
  adhdAdapted?: boolean;
  crisisLevel?: CrisisLevel[];
  phrases?: string[];
}

export interface ACTStep {
  phase: string;
  duration: number;
  instruction: string;
}

export interface SessionPlan {
  session_type: 'micro' | 'short' | 'standard';
  duration_minutes: number;
  reasoning: string;
  break_scheduled: boolean;
  break_type?: string;
}

export interface InterventionPlan {
  planned_sequence: string[];
  current_step: number;
  estimated_total_time: number;
  attention_adaptations: boolean;
  energy_adaptations: boolean;
}

export interface ADHDAdaptations {
  attention_aware: boolean;
  micro_sessions: boolean;
  break_scheduled: boolean;
  simplified: boolean;
  immediate_feedback: boolean;
  progress_indicators: boolean;
}

export interface ConversationContext {
  session_id: string;
  user_id?: string;
  current_state: ConversationState;
  crisis_level: CrisisLevel;
  conversation_history: Message[];
  last_interaction: Date;
  intervention_progress: Record<string, any>;
  adhd_adaptations: ADHDAdaptations;
  attention_status: AttentionStatus;
  engagement_level: EngagementLevel;
  session_start: Date;
  total_session_time: number;
  previous_activity?: 'breathing' | 'grounding' | 'chat' | null;
}

export interface GeminiResponse {
  responseText: string;
  detectedCrisisLevel: CrisisLevel;
  conversationStateUpdate: ConversationState;
  suggestedInterventions: InterventionTechniqueDetails[];
  isRuptureRepair: boolean;
  isAttentionAccommodation: boolean;
  adhdValidation?: string;
  orchestrationInfo?: OrchestrationInfo;
  sessionPlan?: SessionPlan;
  interventionPlan?: InterventionPlan;
}

export interface OrchestrationInfo {
  attention_status: AttentionFadeIndicators;
  rupture_detected: TherapeuticRupture;
  session_adaptations: SessionPlan;
  micro_break_needed: boolean;
  encouragement?: string;
}

// Crisis-specific interfaces
export interface CrisisResources {
  name: string;
  number?: string;
  text?: string;
  url?: string;
}

export interface DistressToleranceOption {
  category: string;
  techniques: TechniqueOption[];
}

export interface TechniqueOption {
  name: string;
  time: string;
  intensity?: 'low' | 'medium' | 'high';
}

// TIPP Technique Interface
export interface TIPPComponent {
  component: string;
  instruction: string;
  purpose: string;
}

export interface TIPPTechnique {
  name: string;
  purpose: string;
  duration_minutes: number;
  components: TIPPComponent[];
  crisis_level: string;
  note: string;
}

// RAIN Method Interface
export interface RAINStep {
  letter: string;
  duration: number;
  instruction: string;
  adhd_note: string;
}

export interface RAINMethod {
  name: string;
  duration_minutes: number;
  adapted_for: string;
  steps: RAINStep[];
  adhd_reminders: string[];
}

// De-escalation conversation state
export interface DeescalationState {
  isActive: boolean;
  currentPhase: string;
  currentStepId: string;
  phaseStartTime: Date;
  totalProgress: number; // 0-100
  stressLevel: number; // 1-10 scale
  engagementLevel: number; // 1-10 scale
  completedTechniques: string[];
  breakthroughMoments: string[];
  conversationFlow: {
    stepHistory: string[];
    effectivenessScores: number[];
    adaptationsMade: string[];
  };
}

// Enhanced orchestration info to include de-escalation
export interface EnhancedOrchestrationInfo extends OrchestrationInfo {
  // De-escalation specific fields
  deescalationPhase?: string;
  currentStep?: string;
  phaseProgress?: number; // 0-100
  stressLevel?: number; // 1-10
  engagementLevel?: number; // 1-10
  conversationQuality?: {
    therapeuticRapport: number; // 1-10
    userSafety: number; // 1-10
    progressTowardStability: number; // 1-10
  };
}

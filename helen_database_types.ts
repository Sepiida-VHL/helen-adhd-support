/**
 * Helen App Database Types
 * TypeScript interfaces matching the Supabase schema for Helen ADHD support app
 * Generated from 001_setup_helen_database.sql
 */

// Core Supabase types
export type UUID = string;
export type Timestamp = string;

// ADHD-specific types
export type CrisisLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'imminent';
export type AttentionStatus = 'focused' | 'fading' | 'lost';
export type MessageSender = 'user' | 'ai' | 'system';
export type MemoryType = 'conversation' | 'tool_usage' | 'crisis' | 'achievement' | 'preference';
export type ToolCompletionStatus = 'started' | 'completed' | 'interrupted';
export type CrisisResolutionStatus = 'ongoing' | 'resolved' | 'escalated';

// Helen Users Table
export interface HelenUser {
  id: UUID;
  clerk_user_id?: string; // Integration with Clerk authentication
  name: string;
  email?: string;
  adhd_profile: {
    diagnosis_type?: string;
    medication?: string[];
    triggers?: string[];
    coping_strategies?: string[];
    attention_span_minutes?: number;
    hyperactivity_level?: 'low' | 'moderate' | 'high';
    sensory_preferences?: {
      colors?: string[];
      sounds?: string[];
      textures?: string[];
    };
  };
  preferred_tools: string[]; // ['breathing_exercise', 'grounding_exercise', etc.]
  crisis_contacts: {
    name: string;
    relationship: string;
    phone?: string;
    email?: string;
    priority: number;
  }[];
  accessibility_settings: {
    font_size?: 'small' | 'medium' | 'large';
    high_contrast?: boolean;
    reduced_motion?: boolean;
    auto_pause_duration?: number;
    crisis_button_prominent?: boolean;
    color_theme?: 'blue' | 'purple' | 'soft' | 'high_contrast';
  };
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Helen Conversations Table
export interface HelenConversation {
  id: UUID;
  user_id: UUID;
  session_id: string; // Frontend session identifier
  title: string;
  crisis_level: CrisisLevel;
  attention_status: AttentionStatus;
  emotional_state: string;
  tools_used: string[];
  started_at: Timestamp;
  ended_at?: Timestamp;
  total_messages: number;
  metadata: {
    initial_mood?: string;
    final_mood?: string;
    tools_effectiveness?: { [tool: string]: number };
    breakthrough_moments?: string[];
    attention_patterns?: {
      fade_timestamps: Timestamp[];
      recovery_timestamps: Timestamp[];
    };
  };
}

// Helen Messages Table
export interface HelenMessage {
  id: UUID;
  conversation_id: UUID;
  sender: MessageSender;
  message_text: string;
  tool_invocation?: {
    tool_name: string;
    parameters: any;
    result?: {
      success: boolean;
      message: string;
      data?: any;
      uiComponent?: string;
      shouldContinueChat?: boolean;
    };
  };
  crisis_detected: boolean;
  attention_adaptation: boolean;
  embedding?: number[]; // Vector embedding for semantic search
  importance_score: number; // 0-10 scale
  created_at: Timestamp;
  metadata: {
    response_time_ms?: number;
    user_engagement_level?: number;
    ai_confidence?: number;
    fallback_model_used?: boolean;
  };
}

// Helen Memories Table (for persistent memory system)
export interface HelenMemory {
  id: UUID;
  user_id: UUID;
  conversation_id: UUID;
  memory_text: string;
  memory_type: MemoryType;
  emotional_context?: string;
  crisis_level: CrisisLevel;
  attention_status: AttentionStatus;
  embedding?: number[]; // Vector embedding for semantic search
  importance_score: number; // 1-10 scale
  accessed_count: number;
  last_accessed_at: Timestamp;
  created_at: Timestamp;
  metadata: {
    tags?: string[];
    related_tools?: string[];
    effectiveness_rating?: number;
    user_reflection?: string;
  };
}

// Helen Tool Usage Table
export interface HelenToolUsage {
  id: UUID;
  user_id: UUID;
  conversation_id: UUID;
  tool_name: string; // 'breathing_exercise', 'grounding_exercise', 'crisis_support', etc.
  tool_parameters: {
    technique?: string;
    duration?: number;
    intensity?: string;
    guidance_level?: string;
    [key: string]: any;
  };
  completion_status: ToolCompletionStatus;
  effectiveness_rating?: number; // 1-10 scale, user-provided
  duration_seconds?: number;
  user_feedback?: string;
  crisis_level_before: CrisisLevel;
  crisis_level_after: CrisisLevel;
  created_at: Timestamp;
  completed_at?: Timestamp;
  metadata: {
    interruption_reason?: string;
    technique_variations?: string[];
    environmental_factors?: string[];
    follow_up_needed?: boolean;
  };
}

// Helen Crisis Logs Table
export interface HelenCrisisLog {
  id: UUID;
  user_id: UUID;
  conversation_id: UUID;
  crisis_level: CrisisLevel;
  trigger_message?: string;
  ai_response?: string;
  safety_resources_provided: {
    resource_type: 'hotline' | 'emergency_contact' | 'professional_help' | 'safety_plan';
    resource_name: string;
    contact_info?: string;
    provided_at: Timestamp;
  }[];
  human_handoff_triggered: boolean;
  resolution_status: CrisisResolutionStatus;
  follow_up_required: boolean;
  created_at: Timestamp;
  resolved_at?: Timestamp;
  metadata: {
    escalation_triggers?: string[];
    intervention_effectiveness?: number;
    follow_up_plan?: string;
    external_resources_contacted?: boolean;
  };
}

// Supabase Database Interface
export interface HelenDatabase {
  helen_users: HelenUser;
  helen_conversations: HelenConversation;
  helen_messages: HelenMessage;
  helen_memories: HelenMemory;
  helen_tool_usage: HelenToolUsage;
  helen_crisis_logs: HelenCrisisLog;
}

// API Response Types
export interface HelenConversationWithMessages extends HelenConversation {
  messages: HelenMessage[];
  user: HelenUser;
}

export interface HelenMemorySearchResult {
  memory: HelenMemory;
  similarity_score: number;
  relevance_context: string;
}

export interface HelenToolEffectivenessStats {
  tool_name: string;
  usage_count: number;
  average_effectiveness: number;
  completion_rate: number;
  common_parameters: any;
  user_feedback_summary: string;
}

export interface HelenUserDashboard {
  user: HelenUser;
  recent_conversations: HelenConversation[];
  tool_usage_stats: HelenToolEffectivenessStats[];
  crisis_history: HelenCrisisLog[];
  progress_metrics: {
    total_sessions: number;
    total_tools_used: number;
    average_session_duration: number;
    most_effective_tools: string[];
    crisis_frequency_trend: 'improving' | 'stable' | 'concerning';
  };
}

// Tool Integration Types (matching helenCoreService.ts)
export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
  uiComponent?: string;
  shouldContinueChat?: boolean;
}

export interface EnhancedMessage extends HelenMessage {
  toolInvocation?: {
    toolName: string;
    parameters: any;
    result?: ToolResult;
  };
}

// Configuration types
export interface HelenConfig {
  primaryModel: 'gpt-4.1-nano' | 'claude-3-haiku' | 'gemini-2.5-flash-lite';
  fallbackModels: string[];
  maxConversationHistory: number;
  enableVectorMemory: boolean;
  adhdAdaptations: {
    maxResponseLength: number;
    useShortSentences: boolean;
    includeProgressIndicators: boolean;
  };
  colorScheme: {
    primary: string; // Blue/purple pastels per user preference
    secondary: string;
    accent: string;
  };
}

// Export all types for Helen app
// Note: This file contains Helen-specific database types
// Import existing app types separately as needed
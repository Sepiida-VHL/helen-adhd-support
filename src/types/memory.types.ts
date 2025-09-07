/**
 * Memory and Reflection Types for Helen
 * Captures the journey from distress to self-compassion
 */

export interface Memory {
  id: string;
  userId: string;
  userName: string;
  date: string; // ISO date string
  timestamp: number;
  
  // The journey
  initialThought: string; // "I shouted at my children"
  initialMood: MoodRating;
  initialRSDStage?: RSDStage;
  
  // The reframe/resolution
  reframedThought: string; // "It was a normal reaction to a lot of stress"
  reframedMood: MoodRating;
  
  // Insights gained
  insights: string[]; // Key learnings or realizations
  copingStrategiesUsed: string[]; // Which interventions helped
  
  // Meta
  conversationLength: number; // How long the chat was
  isPrivate: boolean; // User can mark memories as extra private
  tags: string[]; // User-defined tags for patterns
}

export type RSDStage = 
  | 'mistake' 
  | 'self-judgment' 
  | 'generalization' 
  | 'identity-attack' 
  | 'worthlessness'
  | 'none';

export interface MoodRating {
  value: number; // 1-10 scale
  label: string; // "Overwhelmed", "Calm", etc.
  color: string; // For visualization
}

export interface MemoryStats {
  totalMemories: number;
  averageMoodImprovement: number;
  mostCommonTriggers: string[];
  mostHelpfulStrategies: string[];
  growthPatterns: GrowthPattern[];
}

export interface GrowthPattern {
  pattern: string; // "Self-compassion increasing"
  frequency: number;
  timeline: string[]; // Dates when this pattern appeared
}

export interface UserProfile {
  id: string;
  name: string;
  pronouns?: string;
  createdAt: string;
  preferences: UserPreferences;
  memorySettings: MemorySettings;
}

export interface UserPreferences {
  primaryConcerns: string[]; // "RSD", "Time blindness", etc.
  preferredInterventions: string[]; // "Breathing", "Grounding", etc.
  communicationStyle: 'gentle' | 'direct' | 'encouraging';
}

export interface MemorySettings {
  dailyReflectionReminder: boolean;
  reminderTime?: string; // "20:00"
  autoSuggestMemoryCreation: boolean;
  privacyLevel: 'high' | 'standard';
}

export interface MemoryPrompt {
  trigger: 'reframe-detected' | 'session-end' | 'user-request';
  suggestedInitial: string;
  suggestedReframe: string;
  detectedInsights: string[];
}

// Mood presets with ADHD-aware labels
export const MOOD_PRESETS: MoodRating[] = [
  { value: 1, label: "In crisis", color: "#8B4513" },
  { value: 2, label: "Spiraling", color: "#A0522D" },
  { value: 3, label: "Overwhelmed", color: "#CD853F" },
  { value: 4, label: "Struggling", color: "#DEB887" },
  { value: 5, label: "Managing", color: "#F4E4C1" },
  { value: 6, label: "Stable", color: "#E8D8B8" },
  { value: 7, label: "Grounded", color: "#C8E6C9" },
  { value: 8, label: "Calm", color: "#A5D6A7" },
  { value: 9, label: "Peaceful", color: "#81C784" },
  { value: 10, label: "Thriving", color: "#66BB6A" }
];

// Common ADHD triggers for quick selection
export const COMMON_TRIGGERS = [
  "Forgot something important",
  "Made a mistake at work",
  "Conflict with loved ones",
  "Sensory overload",
  "Time management struggle",
  "Social rejection",
  "Perfectionism spiral",
  "Executive dysfunction",
  "Comparison to others",
  "Past trauma triggered"
];

// Helpful strategies for tagging
export const COPING_STRATEGIES = [
  "Breathing exercise",
  "Grounding (5-4-3-2-1)",
  "Self-compassion break",
  "Narrative catching",
  "Body scan",
  "Movement/stimming",
  "Talking it through",
  "Reframing thoughts",
  "Validation from Helen",
  "Time-out/pause"
];

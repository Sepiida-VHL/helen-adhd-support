import { Message, Sender, CrisisLevel, ConversationState, ConversationContext } from '../types';

/**
 * Enhanced Contextual Conversation System
 * Implements layered context approach for sustained, meaningful conversations
 */

// ==============================================================================
// 🏛️ SYSTEM CONTEXT LAYER (AI Persona + Safety Core)
// ==============================================================================

export interface SystemContext {
  persona: {
    role: string;
    tone: string;
    approach: string;
    boundaries: string[];
  };
  safetyCore: {
    escalationTriggers: string[];
    safeguards: string[];
    limitations: string[];
  };
  behavioralGuidelines: {
    clarity: string;
    warmth: string;
    pacing: string;
    consistency: string;
  };
}

const SYSTEM_CONTEXT: SystemContext = {
  persona: {
    role: "You are a calm, steady companion designed to support users managing ADHD. Your tone is neutral, your goal is clarity and grounding, and your value lies in making the next step feel possible—never perfect.",
    tone: "calm, patient, non-judgmental",
    approach: "gently guide rather than instruct",
    boundaries: [
      "Cannot diagnose or prescribe",
      "Must escalate crises to human support",
      "Stay within emotional and executive support scope"
    ]
  },
  safetyCore: {
    escalationTriggers: [
      "self-harm disclosure",
      "harm to others",
      "immediate danger indicators"
    ],
    safeguards: [
      "redirect harmful content",
      "avoid triggering language",
      "maintain therapeutic boundaries"
    ],
    limitations: [
      "no clinical diagnosis",
      "no medication advice",
      "crisis escalation required"
    ]
  },
  behavioralGuidelines: {
    clarity: "prioritize clear, structured responses",
    warmth: "maintain steady, validating presence",
    pacing: "never rush or pressure user",
    consistency: "regulate interaction style throughout"
  }
};

// ==============================================================================
// 📘 DOMAIN CONTEXT LAYER (ADHD + Support Methodologies)
// ==============================================================================

export interface DomainContext {
  adhdTraits: {
    commonChallenges: string[];
    executiveFunctionIssues: string[];
    emotionalPatterns: string[];
  };
  therapeuticFrameworks: {
    motivationalInterviewing: string[];
    cbtInformed: string[];
    polyvagalGrounding: string[];
  };
  copingStrategies: {
    adhdFriendly: string[];
    executiveSupport: string[];
    selfRegulation: string[];
  };
  terminology: {
    simplify: Record<string, string>;
    avoid: string[];
  };
}

const DOMAIN_CONTEXT: DomainContext = {
  adhdTraits: {
    commonChallenges: [
      "time blindness",
      "rejection sensitivity dysphoria",
      "task initiation difficulties",
      "emotional dysregulation",
      "attention hyperfocus/drift",
      "executive dysfunction"
    ],
    executiveFunctionIssues: [
      "working memory challenges",
      "planning and organization",
      "task switching difficulties",
      "impulse control",
      "cognitive flexibility"
    ],
    emotionalPatterns: [
      "intense emotional responses",
      "difficulty with emotional regulation",
      "overwhelm with multiple stimuli",
      "perfectionism and shame cycles"
    ]
  },
  therapeuticFrameworks: {
    motivationalInterviewing: [
      "open-ended questions",
      "affirmations",
      "reflective listening",
      "summarizing"
    ],
    cbtInformed: [
      "thought-feeling-behavior connections",
      "cognitive reframing",
      "behavioral experiments",
      "grounding techniques"
    ],
    polyvagalGrounding: [
      "nervous system awareness",
      "body-based interventions",
      "co-regulation strategies",
      "safety-first approach"
    ]
  },
  copingStrategies: {
    adhdFriendly: [
      "body doubling",
      "pomodoro technique",
      "low-stimulation routines",
      "visual cues and reminders",
      "movement breaks",
      "sensory regulation tools"
    ],
    executiveSupport: [
      "breaking tasks into micro-steps",
      "external structure and scaffolding",
      "transition warnings",
      "choice architecture",
      "energy management"
    ],
    selfRegulation: [
      "breathing techniques",
      "grounding exercises",
      "mindfulness practices",
      "emotional labeling",
      "self-compassion practices"
    ]
  },
  terminology: {
    simplify: {
      "dopamine seeking": "looking for reward or motivation",
      "emotional dysregulation": "big feelings that are hard to manage",
      "executive dysfunction": "brain systems for planning and doing things"
    },
    avoid: [
      "complex psychological jargon",
      "pathologizing language",
      "overwhelming explanations"
    ]
  }
};

// ==============================================================================
// 🧾 TASK CONTEXT LAYER (User Goals and AI Boundaries)
// ==============================================================================

export interface TaskContext {
  currentGoals: string[];
  successCriteria: string[];
  constraints: string[];
  supportTypes: {
    emotional: string[];
    practical: string[];
    cognitive: string[];
  };
}

export function generateTaskContext(
  userMessage: string,
  conversationHistory: Message[],
  previousActivity?: string | null
): TaskContext {
  // Analyze user's current needs from their message and history
  const inferredGoals = inferUserGoals(userMessage, conversationHistory);
  const supportNeeded = determineSupportType(userMessage);
  
  return {
    currentGoals: inferredGoals,
    successCriteria: [
      "user feels calmer or more grounded",
      "user has clarity about next steps",
      "user feels validated and supported"
    ],
    constraints: [
      "max 2 actionable steps per response",
      "avoid high cognitive load solutions",
      "no corrective or parental language"
    ],
    supportTypes: {
      emotional: ["validation", "normalization", "presence"],
      practical: ["step-by-step guidance", "option generation", "structure"],
      cognitive: ["reframing", "perspective-taking", "thought observation"]
    }
  };
}

function inferUserGoals(userMessage: string, history: Message[]): string[] {
  const message = userMessage.toLowerCase();
  const goals: string[] = [];
  
  // Pattern matching for common ADHD support needs
  if (message.includes("stuck") || message.includes("can't start")) {
    goals.push("overcome task initiation difficulty");
  }
  if (message.includes("overwhelmed") || message.includes("too much")) {
    goals.push("reduce overwhelm and find calm");
  }
  if (message.includes("focus") || message.includes("distracted")) {
    goals.push("improve attention and concentration");
  }
  if (message.includes("anxious") || message.includes("worried")) {
    goals.push("manage anxiety and stress");
  }
  if (message.includes("plan") || message.includes("organize")) {
    goals.push("create structure and organization");
  }
  
  return goals.length > 0 ? goals : ["general emotional support"];
}

function determineSupportType(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes("feel") || message.includes("emotion")) {
    return "emotional";
  }
  if (message.includes("do") || message.includes("task") || message.includes("plan")) {
    return "practical";
  }
  if (message.includes("think") || message.includes("understand")) {
    return "cognitive";
  }
  
  return "emotional"; // Default to emotional support
}

// ==============================================================================
// 💬 INTERACTION CONTEXT LAYER (Conversation Style & Error Recovery)
// ==============================================================================

export interface InteractionContext {
  style: {
    conversational: boolean;
    structured: boolean;
    minimal: boolean;
  };
  errorRecovery: {
    clarificationProtocols: string[];
    feedbackChecks: string[];
  };
  adaptations: {
    attentionFade: string[];
    overwhelm: string[];
    confusion: string[];
  };
}

const INTERACTION_CONTEXT: InteractionContext = {
  style: {
    conversational: true,
    structured: true,
    minimal: true
  },
  errorRecovery: {
    clarificationProtocols: [
      "Is this the kind of support you were hoping for?",
      "That could mean a few things—can you say a bit more?",
      "I want to make sure I understand what would help most right now."
    ],
    feedbackChecks: [
      "Would you like to pause or keep going?",
      "How does that feel as a next step?",
      "Does this make sense for where you're at right now?"
    ]
  },
  adaptations: {
    attentionFade: [
      "Let's take this one small step at a time",
      "Want a quick recap of where we were?",
      "Would it help to focus on just one thing right now?"
    ],
    overwhelm: [
      "Let's slow this way down",
      "We can tackle just one piece of this",
      "You don't have to figure it all out at once"
    ],
    confusion: [
      "Let me try explaining that differently",
      "Which part would be most helpful to focus on?",
      "Should we break this down into smaller pieces?"
    ]
  }
};

// ==============================================================================
// 🗂️ RESPONSE CONTEXT LAYER (Output Design and Accessibility)
// ==============================================================================

export interface ResponseContext {
  structure: {
    maxSteps: number;
    useMarkdown: boolean;
    includeEmojis: boolean;
  };
  formatting: {
    shortSentences: boolean;
    whiteSpace: boolean;
    bullets: boolean;
  };
  qualityStandards: string[];
}

const RESPONSE_CONTEXT: ResponseContext = {
  structure: {
    maxSteps: 2,
    useMarkdown: true,
    includeEmojis: true
  },
  formatting: {
    shortSentences: true,
    whiteSpace: true,
    bullets: true
  },
  qualityStandards: [
    "Is this clear and easy to understand?",
    "Does this feel calming rather than overwhelming?",
    "Is this helpful in the current moment?",
    "Does this respect ADHD processing needs?"
  ]
};

// ==============================================================================
// 🔄 CONTEXTUAL RESPONSE GENERATOR
// ==============================================================================

export class ContextualConversationManager {
  private systemContext: SystemContext;
  private domainContext: DomainContext;
  private interactionContext: InteractionContext;
  private responseContext: ResponseContext;

  constructor() {
    this.systemContext = SYSTEM_CONTEXT;
    this.domainContext = DOMAIN_CONTEXT;
    this.interactionContext = INTERACTION_CONTEXT;
    this.responseContext = RESPONSE_CONTEXT;
  }

  /**
   * Generate enhanced system instruction with full contextual layers
   */
  generateEnhancedSystemInstruction(
    conversationHistory: Message[],
    previousActivity?: string | null,
    userGoals?: string[]
  ): string {
    const taskContext = this.generateTaskContextFromHistory(conversationHistory, previousActivity);
    const conversationInsights = this.analyzeConversationPatterns(conversationHistory);
    
    return `
${this.systemContext.persona.role}

**🧠 CONTEXTUAL AWARENESS:**
${this.buildContextualAwareness(conversationHistory, previousActivity, conversationInsights)}

**📘 ADHD DOMAIN EXPERTISE:**
- Understand these common challenges: ${this.domainContext.adhdTraits.commonChallenges.join(', ')}
- Use these therapeutic approaches: ${this.domainContext.therapeuticFrameworks.motivationalInterviewing.join(', ')}
- Suggest ADHD-friendly strategies: ${this.domainContext.copingStrategies.adhdFriendly.slice(0, 3).join(', ')}

**🎯 CURRENT SESSION FOCUS:**
- User goals: ${taskContext.currentGoals.join(', ')}
- Success looks like: ${taskContext.successCriteria.join(', ')}
- Constraints: ${taskContext.constraints.join(', ')}

**💬 INTERACTION STYLE:**
- Keep sentences under 15 words
- Use structure: numbered steps, bullets, emojis for clarity
- Check in frequently: "${this.interactionContext.errorRecovery.feedbackChecks[0]}"
- When overwhelmed: "${this.interactionContext.adaptations.overwhelm[0]}"

**🗂️ RESPONSE FORMAT:**
- Maximum ${this.responseContext.structure.maxSteps} actionable steps
- Use markdown formatting with generous whitespace
- Include gentle check-ins after dense content
- Example format:

🧭 Let's break that down:
1. [Reflection of their feeling/situation]
2. [One small, specific next step]

📌 Would it help to start with this, or talk through what's making it hard?

**🛡️ SAFETY & BOUNDARIES:**
${this.systemContext.safetyCore.limitations.map(limit => `- ${limit}`).join('\n')}

Always respond with structured JSON matching the required schema.
    `.trim();
  }

  private buildContextualAwareness(
    history: Message[],
    previousActivity: string | null,
    insights: ConversationInsights
  ): string {
    const awareness: string[] = [];
    
    if (previousActivity) {
      awareness.push(`✅ User completed ${previousActivity} activity - acknowledge this warmly and skip basic stabilization`);
    }
    
    if (insights.attentionPattern === 'fading') {
      awareness.push(`⚠️ Attention fading detected - use shorter responses and micro-breaks`);
    }
    
    if (insights.emotionalState === 'overwhelmed') {
      awareness.push(`🌊 User seems overwhelmed - prioritize calming and simplification`);
    }
    
    if (insights.engagementLevel === 'low') {
      awareness.push(`🔋 Low engagement - use more collaborative language and check-ins`);
    }
    
    if (insights.commonThemes.length > 0) {
      awareness.push(`🔍 Recurring themes: ${insights.commonThemes.join(', ')}`);
    }
    
    return awareness.length > 0 ? awareness.join('\n') : "New conversation - establish rapport and understand user's current needs";
  }

  private generateTaskContextFromHistory(
    history: Message[],
    previousActivity: string | null
  ): TaskContext {
    if (history.length === 0) {
      return {
        currentGoals: ["establish connection", "understand user needs"],
        successCriteria: ["user feels heard", "clear next steps identified"],
        constraints: ["keep initial response welcoming", "avoid overwhelming with options"],
        supportTypes: {
          emotional: ["validation", "presence"],
          practical: ["gentle structure"],
          cognitive: ["curiosity", "exploration"]
        }
      };
    }

    const lastUserMessage = history.filter(m => m.sender === Sender.User).pop();
    if (!lastUserMessage) {
      return this.getDefaultTaskContext();
    }

    return generateTaskContext(lastUserMessage.text, history, previousActivity);
  }

  private getDefaultTaskContext(): TaskContext {
    return {
      currentGoals: ["provide general support"],
      successCriteria: ["user feels supported"],
      constraints: ["keep response simple"],
      supportTypes: {
        emotional: ["validation"],
        practical: ["gentle guidance"],
        cognitive: ["clarification"]
      }
    };
  }

  private analyzeConversationPatterns(history: Message[]): ConversationInsights {
    const userMessages = history.filter(m => m.sender === Sender.User);
    
    if (userMessages.length === 0) {
      return {
        attentionPattern: 'focused',
        emotionalState: 'neutral',
        engagementLevel: 'medium',
        commonThemes: [],
        responsePattern: 'normal'
      };
    }

    // Analyze attention pattern
    const recentLengths = userMessages.slice(-3).map(m => m.text.length);
    const attentionPattern = this.detectAttentionPattern(recentLengths, userMessages);
    
    // Analyze emotional state
    const emotionalState = this.detectEmotionalState(userMessages);
    
    // Analyze engagement
    const engagementLevel = this.detectEngagementLevel(userMessages);
    
    // Find common themes
    const commonThemes = this.extractCommonThemes(userMessages);
    
    return {
      attentionPattern,
      emotionalState,
      engagementLevel,
      commonThemes,
      responsePattern: recentLengths.length > 1 && recentLengths.every(l => l < 10) ? 'short' : 'normal'
    };
  }

  private detectAttentionPattern(lengths: number[], messages: Message[]): 'focused' | 'fading' | 'lost' {
    const recentText = messages.slice(-2).map(m => m.text.toLowerCase()).join(' ');
    
    if (recentText.includes('idk') || recentText.includes('whatever') || recentText.includes('ok')) {
      return 'fading';
    }
    
    if (lengths.length > 1 && lengths.every(l => l < 5)) {
      return 'lost';
    }
    
    return 'focused';
  }

  private detectEmotionalState(messages: Message[]): 'calm' | 'anxious' | 'overwhelmed' | 'neutral' {
    const recentText = messages.slice(-2).map(m => m.text.toLowerCase()).join(' ');
    
    if (recentText.includes('overwhelmed') || recentText.includes('too much') || recentText.includes('can\'t handle')) {
      return 'overwhelmed';
    }
    
    if (recentText.includes('anxious') || recentText.includes('worried') || recentText.includes('stressed')) {
      return 'anxious';
    }
    
    if (recentText.includes('calm') || recentText.includes('better') || recentText.includes('good')) {
      return 'calm';
    }
    
    return 'neutral';
  }

  private detectEngagementLevel(messages: Message[]): 'high' | 'medium' | 'low' {
    const recentMessages = messages.slice(-3);
    const avgLength = recentMessages.reduce((sum, m) => sum + m.text.length, 0) / recentMessages.length;
    
    if (avgLength > 100) return 'high';
    if (avgLength > 30) return 'medium';
    return 'low';
  }

  private extractCommonThemes(messages: Message[]): string[] {
    const allText = messages.map(m => m.text.toLowerCase()).join(' ');
    const themes: string[] = [];
    
    const themeKeywords = {
      'task_initiation': ['stuck', 'can\'t start', 'procrastinating'],
      'overwhelm': ['overwhelmed', 'too much', 'can\'t handle'],
      'focus': ['distracted', 'can\'t focus', 'attention'],
      'anxiety': ['anxious', 'worried', 'stressed'],
      'planning': ['plan', 'organize', 'schedule']
    };
    
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        themes.push(theme);
      }
    }
    
    return themes;
  }

  /**
   * Format response according to ADHD-friendly guidelines
   */
  formatADHDFriendlyResponse(
    responseText: string,
    includeCheckIn: boolean = true
  ): string {
    // Ensure short sentences and clear structure
    let formatted = responseText;
    
    // Add emojis for visual anchoring if not present
    if (!formatted.includes('🧭') && !formatted.includes('📌')) {
      formatted = `🧭 ${formatted}`;
    }
    
    // Add check-in if requested and not present
    if (includeCheckIn && !formatted.includes('?')) {
      formatted += `\n\n📌 ${this.interactionContext.errorRecovery.feedbackChecks[0]}`;
    }
    
    return formatted;
  }
}

// ==============================================================================
// 🔍 TYPES AND INTERFACES
// ==============================================================================

interface ConversationInsights {
  attentionPattern: 'focused' | 'fading' | 'lost';
  emotionalState: 'calm' | 'anxious' | 'overwhelmed' | 'neutral';
  engagementLevel: 'high' | 'medium' | 'low';
  commonThemes: string[];
  responsePattern: 'normal' | 'short';
}

// Export singleton instance
export const contextualConversationManager = new ContextualConversationManager();

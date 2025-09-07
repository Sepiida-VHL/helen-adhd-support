import { 
  ConversationContext, 
  Message, 
  AttentionFadeIndicators, 
  TherapeuticRupture, 
  SessionPlan, 
  InterventionPlan,
  CrisisLevel,
  EngagementLevel,
  AttentionStatus
} from '../types';

/**
 * Intelligent Conversation Orchestration for ADHD-adapted crisis intervention
 * Based on evidence-based ACT, MI, and conversation design principles
 */
export class CrisisConversationOrchestrator {
  private readonly attentionThresholdSeconds = 15;
  private readonly microSessionMaxMinutes = 3;
  private readonly engagementIndicators = {
    high: ['yes', 'okay', 'sure', "let's do it", 'that helps', 'better', 'good'],
    medium: ['maybe', 'i guess', 'ok', 'sure'],
    low: ['no', 'not really', 'whatever', "i don't know", 'idk'],
    withdrawal: ['forget it', 'never mind', "this isn't working", 'leave me alone', 'whatever']
  };

  /**
   * Detect when ADHD user attention is waning based on response patterns
   */
  detectAttentionFade(context: ConversationContext): AttentionFadeIndicators {
    if (context.conversation_history.length < 2) {
      return { attention_fading: false, indicators: [], severity: 'low' };
    }

    const recentTurns = context.conversation_history.slice(-3);
    const indicators: string[] = [];

    // Check response time patterns
    for (const turn of recentTurns) {
      if (turn.responseTime && turn.responseTime > this.attentionThresholdSeconds) {
        indicators.push('delayed_responses');
      }
    }

    // Check response length decline
    const responseLengths = recentTurns.map(turn => turn.text.length);
    if (responseLengths.length >= 2) {
      const declining = responseLengths.every((length, i) => 
        i === 0 || length < responseLengths[i - 1]
      );
      if (declining) {
        indicators.push('declining_response_length');
      }
    }

    // Check for disengagement language
    const recentText = recentTurns.map(turn => turn.text.toLowerCase()).join(' ');
    for (const [level, phrases] of Object.entries(this.engagementIndicators)) {
      if (level === 'low' || level === 'withdrawal') {
        if (phrases.some(phrase => recentText.includes(phrase))) {
          indicators.push(`disengagement_language_${level}`);
        }
      }
    }

    const attentionFading = indicators.length >= 2;
    const severity = indicators.some(i => i.includes('withdrawal')) ? 'high' : 
                    attentionFading ? 'medium' : 'low';

    return {
      attention_fading: attentionFading,
      indicators,
      severity: severity as 'low' | 'medium' | 'high'
    };
  }

  /**
   * Detect completed activities and adjust conversation flow accordingly
   */
  detectCompletedActivities(context: ConversationContext): {
    breathing_completed: boolean;
    grounding_completed: boolean;
    skip_to_phase: number | null;
  } {
    const completedActivities = {
      breathing_completed: false,
      grounding_completed: false,
      skip_to_phase: null as number | null
    };

    // Check if user came from breathing exercises
    if (context.previous_activity === 'breathing' || 
        context.conversation_history.some(msg => 
          msg.text.toLowerCase().includes('breathing') && 
          msg.text.toLowerCase().includes('complete')
        )) {
      completedActivities.breathing_completed = true;
      completedActivities.skip_to_phase = 2; // Skip to Validation & Connection
    }

    // Check if user came from grounding exercises
    if (context.previous_activity === 'grounding' || 
        context.conversation_history.some(msg => 
          msg.text.toLowerCase().includes('grounding') && 
          msg.text.toLowerCase().includes('complete')
        )) {
      completedActivities.grounding_completed = true;
      // Grounding also provides some stabilization, so skip to phase 2
      completedActivities.skip_to_phase = 2;
    }

    return completedActivities;
  }

  /**
   * Determine optimal intervention sequence based on crisis level and user state
   */
  planInterventionSequence(
    crisisLevel: CrisisLevel, 
    userResponse: string, 
    context: ConversationContext
  ): InterventionPlan {
    const attentionStatus = this.detectAttentionFade(context);
    const userEnergy = this.assessUserEnergy(userResponse);
    const completedActivities = this.detectCompletedActivities(context);

    // Base sequences for different crisis levels
    const sequences = {
      [CrisisLevel.IMMINENT]: ['safety_assessment', 'immediate_support', 'human_handoff'],
      [CrisisLevel.SEVERE]: ['grounding', 'breathing', 'safety_planning'],
      [CrisisLevel.MODERATE]: ['breathing', 'grounding', 'cognitive_defusion', 'values'],
      [CrisisLevel.MILD]: ['grounding', 'cognitive_defusion', 'values', 'coping_skills'],
      [CrisisLevel.NONE]: ['check_in', 'prevention_skills', 'wellness_planning']
    };

    let baseSequence = sequences[crisisLevel] || ['check_in'];

    // Skip already completed activities
    if (completedActivities.breathing_completed) {
      baseSequence = baseSequence.filter(item => item !== 'breathing');
    }
    if (completedActivities.grounding_completed) {
      baseSequence = baseSequence.filter(item => item !== 'grounding');
    }

    // Adapt sequence based on ADHD attention and energy
    if (attentionStatus.attention_fading) {
      baseSequence = baseSequence.slice(0, 2).concat(['micro_break', 'check_in']);
    } else if (userEnergy === 'low') {
      baseSequence = baseSequence.filter(item => 
        ['grounding', 'breathing', 'safety_planning'].includes(item)
      );
    }

    return {
      planned_sequence: baseSequence,
      current_step: 0,
      estimated_total_time: baseSequence.length * 3,
      attention_adaptations: attentionStatus.attention_fading,
      energy_adaptations: userEnergy === 'low',
      activities_completed: completedActivities
    };
  }

  /**
   * Detect when user is pulling away or getting frustrated
   */
  detectTherapeuticRupture(userResponses: string[]): TherapeuticRupture {
    if (userResponses.length < 2) {
      return { rupture_detected: false, types: [], severity: 'medium' };
    }

    const recentResponses = userResponses.slice(-3).join(' ').toLowerCase();
    
    const ruptureSignals = {
      resistance: ["this isn't working", "i don't want to", 'whatever', 'fine'],
      overwhelm: ['too much', "can't handle", 'stop', 'too hard'],
      disconnection: ["you don't understand", 'this is stupid', 'forget it', 'leave me alone'],
      shame: ["i'm terrible at this", "i can't do anything right", "i'm broken"]
    };

    const detectedRuptures: string[] = [];
    for (const [ruptureType, signals] of Object.entries(ruptureSignals)) {
      if (signals.some(signal => recentResponses.includes(signal))) {
        detectedRuptures.push(ruptureType);
      }
    }

    if (detectedRuptures.length > 0) {
      return {
        rupture_detected: true,
        types: detectedRuptures,
        repair_strategy: this.getRuptureRepairStrategy(detectedRuptures[0]),
        severity: detectedRuptures.includes('disconnection') ? 'high' : 'medium'
      };
    }

    return { rupture_detected: false, types: [], severity: 'medium' };
  }

  /**
   * Break interventions into ADHD-friendly micro-sessions with check-ins
   */
  manageMicroSession(
    currentIntervention: any, 
    timeElapsed: number, 
    context: ConversationContext
  ): any {
    const maxSessionSeconds = this.microSessionMaxMinutes * 60;

    // Check if we need a micro-break
    if (timeElapsed >= maxSessionSeconds) {
      return {
        action: 'micro_break',
        message: "You're doing great! Let's take a quick 30-second break. Just breathe normally and know that you're taking good care of yourself.",
        break_duration: 30,
        continuation_prompt: 'Ready to continue, or would you like to try something different?'
      };
    }

    // Check attention status mid-intervention
    const attentionStatus = this.detectAttentionFade(context);
    if (attentionStatus.attention_fading) {
      return {
        action: 'attention_check',
        message: "I notice you might be getting tired. That's totally normal with ADHD. Would you like to keep going with this, try something shorter, or take a break?",
        options: [
          'Keep going',
          'Try something shorter',
          'Take a break',
          "I'm done for now"
        ]
      };
    }

    // Provide encouragement and progress update
    return {
      action: 'continue',
      encouragement: this.generateADHDEncouragement(),
      progress_indicator: `You're doing well. About ${this.microSessionMaxMinutes - Math.floor(timeElapsed / 60)} minutes left in this exercise.`
    };
  }

  private assessUserEnergy(userResponse: string): 'low' | 'medium' | 'high' {
    const responseLower = userResponse.toLowerCase();
    
    const highEnergyIndicators = ['yes!', "let's do it", 'ready', 'excited', 'motivated'];
    const lowEnergyIndicators = ['tired', 'exhausted', "can't", 'barely', 'drained', 'weak'];
    
    if (highEnergyIndicators.some(indicator => responseLower.includes(indicator))) {
      return 'high';
    } else if (lowEnergyIndicators.some(indicator => responseLower.includes(indicator))) {
      return 'low';
    }
    return 'medium';
  }

  private generateADHDEncouragement(): string {
    const encouragements = [
      "Your ADHD brain is working hard right now - that takes courage.",
      "It's normal for this to feel challenging. You're building important skills.",
      "Every moment you spend on this is you taking care of yourself.",
      "Your attention might wander - that's okay, just gently come back.",
      "You're doing something really important for your wellbeing right now."
    ];
    
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  private getRuptureRepairStrategy(ruptureType: string): any {
    const repairStrategies = {
      resistance: {
        approach: 'validation_and_choice',
        message: "I hear that this doesn't feel right for you right now. That's totally okay. What would feel more helpful?",
        options: ['Try something different', 'Take a break', 'Just talk', 'End for now']
      },
      overwhelm: {
        approach: 'simplify_and_slow',
        message: "You're right, that was too much at once. Let's slow way down. Just focus on breathing for a moment.",
        action: 'reduce_to_breathing_only'
      },
      disconnection: {
        approach: 'empathy_and_repair',
        message: "You're absolutely right - I can't fully understand what you're going through. Your experience is unique, especially with ADHD. I'm here to support you in whatever way feels helpful.",
        validation: 'acknowledge_their_expertise_in_their_own_experience'
      },
      shame: {
        approach: 'compassion_and_normalization',
        message: "Whoa, hold on. You're not broken, and you're not terrible at this. ADHD brains work differently, and that comes with both challenges AND strengths. Right now, you're taking care of yourself, and that's what matters.",
        redirect: 'focus_on_self_compassion'
      }
    };
    
    return repairStrategies[ruptureType as keyof typeof repairStrategies] || repairStrategies.resistance;
  }
}

/**
 * Adaptive Session Manager for ADHD attention patterns
 */
export class AdaptiveSessionManager {
  private readonly sessionChunks = {
    micro: 2,    // 2 minutes for high distress/low attention
    short: 5,    // 5 minutes for moderate engagement
    standard: 8  // 8 minutes for high engagement
  };

  private readonly breakTypes = {
    breathing: 'Take three deep breaths and notice you\'re doing something good for yourself.',
    movement: 'Stretch your arms up high, roll your shoulders, or wiggle your fingers.',
    grounding: 'Look around and notice three things you can see right now.',
    self_compassion: 'Put your hand on your heart and remember: you\'re being brave right now.'
  };

  /**
   * Determine appropriate session length based on user state
   */
  determineSessionLength(context: ConversationContext, currentIntervention: string): SessionPlan {
    // Analyze recent engagement
    const recentEngagement = context.conversation_history.length >= 3 ? 
      this.analyzeEngagementPattern(context) : 'unknown';

    // Factor in crisis level - higher crisis = shorter initial sessions
    const crisisFactors = {
      [CrisisLevel.IMMINENT]: 'micro',
      [CrisisLevel.SEVERE]: 'micro',
      [CrisisLevel.MODERATE]: 'short',
      [CrisisLevel.MILD]: 'short',
      [CrisisLevel.NONE]: 'standard'
    };

    const crisisRecommendation = crisisFactors[context.crisis_level] || 'short';

    // Combine factors
    let recommendedLength: keyof typeof this.sessionChunks;
    if (recentEngagement === 'low' || crisisRecommendation === 'micro') {
      recommendedLength = 'micro';
    } else if (recentEngagement === 'high' && crisisRecommendation !== 'micro') {
      recommendedLength = 'standard';
    } else {
      recommendedLength = 'short';
    }

    return {
      session_type: recommendedLength,
      duration_minutes: this.sessionChunks[recommendedLength],
      reasoning: `Based on ${recentEngagement} engagement and ${context.crisis_level} crisis level`,
      break_scheduled: ['short', 'standard'].includes(recommendedLength),
      break_type: this.chooseBreakType()
    };
  }

  private analyzeEngagementPattern(context: ConversationContext): string {
    const recentTurns = context.conversation_history.slice(-3);
    
    const highEngagement = ['yes', 'that helps', "let's try", 'okay', 'good', 'better'];
    const mediumEngagement = ['maybe', 'i guess', 'sure', 'ok'];
    const lowEngagement = ['no', 'not really', 'whatever', "i don't know"];
    
    const engagementScores = recentTurns.map(turn => {
      const userInput = turn.text.toLowerCase();
      if (highEngagement.some(phrase => userInput.includes(phrase))) return 3;
      if (mediumEngagement.some(phrase => userInput.includes(phrase))) return 2;
      if (lowEngagement.some(phrase => userInput.includes(phrase))) return 1;
      return 2; // neutral
    });

    const avgEngagement = engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length;
    
    if (avgEngagement >= 2.5) return 'high';
    if (avgEngagement >= 1.5) return 'medium';
    return 'low';
  }

  private chooseBreakType(): string {
    const breakKeys = Object.keys(this.breakTypes);
    return breakKeys[Math.floor(Math.random() * breakKeys.length)];
  }
}

// Export instances for use in other services
export const orchestrator = new CrisisConversationOrchestrator();
export const sessionManager = new AdaptiveSessionManager();

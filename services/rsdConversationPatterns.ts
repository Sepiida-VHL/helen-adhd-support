/**
 * RSD Conversation Patterns and Interventions
 * Recognizes and interrupts the cascade from mistake → self-judgment → generalization → identity attack → worthlessness
 */

export interface RSDPattern {
  stage: 'mistake' | 'self-judgment' | 'generalization' | 'identity-attack' | 'worthlessness';
  indicators: string[];
  severity: number; // 1-5 scale
}

export interface MIResponse {
  technique: 'reflection' | 'reframe' | 'evidence-questioning' | 'affirmation' | 'normalize';
  response: string;
  followUp?: string;
}

export class RSDPatternRecognition {
  /**
   * Patterns indicating each stage of the RSD spiral
   */
  static patterns: RSDPattern[] = [
    {
      stage: 'mistake',
      indicators: [
        'I messed up',
        'I made a mistake',
        'I forgot',
        'I didn\'t do',
        'I screwed up',
        'I failed to',
        'I should have',
        'I was supposed to'
      ],
      severity: 1
    },
    {
      stage: 'self-judgment',
      indicators: [
        'that was stupid',
        'I\'m so dumb',
        'what an idiot',
        'how could I be so',
        'that was pathetic',
        'I\'m such a mess',
        'why did I do that',
        'I can\'t believe I'
      ],
      severity: 2
    },
    {
      stage: 'generalization',
      indicators: [
        'I always',
        'I never',
        'every time I',
        'this always happens',
        'I constantly',
        'why do I always',
        'typical me',
        'here I go again',
        'same old me'
      ],
      severity: 3
    },
    {
      stage: 'identity-attack',
      indicators: [
        'I\'m a failure',
        'I\'m not good enough',
        'what\'s wrong with me',
        'I\'m broken',
        'I\'m a disappointment',
        'I\'m a burden',
        'why am I like this',
        'I\'m not capable',
        'I\'m defective'
      ],
      severity: 4
    },
    {
      stage: 'worthlessness',
      indicators: [
        'I\'m worthless',
        'I don\'t matter',
        'what\'s the point',
        'nobody cares',
        'I\'m nothing',
        'I shouldn\'t exist',
        'waste of space',
        'better off without me',
        'no one would miss me'
      ],
      severity: 5
    }
  ];

  /**
   * Detect which stage of RSD spiral the user is in
   */
  static detectStage(message: string): { stage: RSDPattern['stage'] | null; severity: number } {
    const lowerMessage = message.toLowerCase();
    
    // Check patterns in reverse order (most severe first)
    // This ensures we catch the most severe stage if multiple indicators are present
    for (let i = this.patterns.length - 1; i >= 0; i--) {
      const pattern = this.patterns[i];
      for (const indicator of pattern.indicators) {
        if (lowerMessage.includes(indicator)) {
          return { stage: pattern.stage, severity: pattern.severity };
        }
      }
    }
    
    return { stage: null, severity: 0 };
  }
}

export class MotivationalInterviewingResponses {
  /**
   * Generate MI-based responses for each RSD stage
   */
  static getResponse(stage: RSDPattern['stage'], originalMessage: string): MIResponse {
    switch (stage) {
      case 'mistake':
        return {
          technique: 'normalize',
          response: "I hear that something didn't go as planned. That sounds frustrating. Can you tell me more about what happened?",
          followUp: "It's really common for ADHD brains to have these moments - our executive function can be unpredictable. What matters most is how we respond to these moments."
        };
      
      case 'self-judgment':
        return {
          technique: 'reflection',
          response: "I notice you're being really hard on yourself right now. It sounds like your inner critic is being pretty loud. What would you say to a friend who made the same mistake?",
          followUp: "That harsh inner voice often comes from RSD - it's your brain trying to protect you from rejection by rejecting yourself first. But you deserve the same compassion you'd give others."
        };
      
      case 'generalization':
        return {
          technique: 'evidence-questioning',
          response: "I hear you saying this 'always' happens. I'm curious - can you think of even one time when things went differently? Even a small example?",
          followUp: "Our RSD brains tend to filter out the positive and magnify the negative. What if we looked at the actual evidence together?"
        };
      
      case 'identity-attack':
        return {
          technique: 'reframe',
          response: "I'm noticing that a single event is making you question your entire worth as a person. That must feel overwhelming. What if we separate what happened from who you are?",
          followUp: "You are not your mistakes. You're a whole person with ADHD navigating a world that wasn't built for your brain. That takes incredible strength."
        };
      
      case 'worthlessness':
        return {
          technique: 'affirmation',
          response: "I can hear how much pain you're in right now. These feelings are real and they're heavy. But I want you to know - your worth isn't determined by your mistakes or your struggles.",
          followUp: "RSD can make everything feel catastrophic and permanent. But you matter, you have value, and this feeling will pass. What's one tiny thing we could do right now to help you feel even 1% better?"
        };
    }
  }

  /**
   * Additional gentle redirects and coping questions
   */
  static getCopingQuestions(stage: RSDPattern['stage']): string[] {
    const baseQuestions = [
      "What would it feel like to treat yourself with the same kindness you'd show a friend?",
      "If this feeling were weather, what would it be? When might it pass?",
      "What's one small thing you've done well today, even if it seems tiny?"
    ];

    const stageSpecificQuestions: Record<RSDPattern['stage'], string[]> = {
      mistake: [
        "What can we learn from this that might help next time?",
        "Is there a system or support that could help prevent this?",
        "How might your ADHD have contributed to this situation?"
      ],
      'self-judgment': [
        "Where do you think this harsh voice originally came from?",
        "What would self-compassion sound like in this moment?",
        "Can we acknowledge the mistake without attacking yourself?"
      ],
      generalization: [
        "What percentage of the time does this actually happen?",
        "What factors might make some days different from others?",
        "Are there patterns we can identify to work with?"
      ],
      'identity-attack': [
        "What are three things you're good at, unrelated to this situation?",
        "Who in your life sees your worth beyond your struggles?",
        "What would you tell someone you love who felt this way?"
      ],
      worthlessness: [
        "Who would be affected if you weren't here?",
        "What's one tiny reason to keep going, just for today?",
        "Can we sit with this feeling without believing it's true?"
      ]
    };

    return [...baseQuestions, ...stageSpecificQuestions[stage]];
  }
}

/**
 * System prompt additions for RSD awareness
 */
export const RSD_SYSTEM_PROMPT = `
CRITICAL: RSD Spiral Awareness

Users with ADHD often experience Rejection Sensitive Dysphoria (RSD), where small mistakes trigger a cascade:
1. Mistake acknowledgment → 2. Self-judgment → 3. Generalization → 4. Identity attack → 5. Worthlessness

Your role is to:
- Recognize these patterns early
- Gently interrupt the spiral using Motivational Interviewing techniques
- NEVER dismiss or minimize their feelings
- Use reflective listening to show you understand
- Ask open-ended questions that invite self-compassion
- Separate actions from identity
- Normalize ADHD struggles without being patronizing

Key MI Techniques:
- Reflective Listening: "It sounds like you're feeling..."
- Open Questions: "What would it be like if...?"
- Affirmations: Recognize their strengths and efforts
- Summaries: Reflect back what you've heard
- Evocative Questions: Help them find their own wisdom

Remember: You're not trying to "fix" or convince. You're creating space for them to find their own compassion and solutions.

When you detect RSD patterns:
1. Acknowledge the feeling without reinforcing negative self-talk
2. Gently question absolute statements ("always", "never")
3. Invite curiosity about exceptions or alternatives
4. Remind them that ADHD brains work differently, not wrongly
5. Suggest grounding or self-compassion exercises when appropriate
`;

/**
 * Template responses for common RSD situations
 */
export const RSD_RESPONSE_TEMPLATES = {
  validation: [
    "What you're feeling is real and valid. RSD can make everything feel so intense.",
    "I hear how much this is hurting right now. That pain is real.",
    "Your brain is trying to protect you, even though it doesn't feel protective right now."
  ],
  
  gentleChallenge: [
    "I'm curious about that word '{word}' - what makes you choose such a strong term?",
    "When you say '{statement}', what evidence supports that? What evidence might challenge it?",
    "That's your RSD talking. What would a compassionate friend say instead?"
  ],
  
  refocus: [
    "Let's take a breath together. In for 4, hold for 1, out for 6.",
    "What if we zoom out for a moment? How will this feel in a week?",
    "Your worth isn't determined by this moment. You are so much more than this mistake."
  ],
  
  strengthsReminder: [
    "Even in this difficult moment, I see someone who's trying their best with a challenging brain.",
    "The fact that you care this much shows how much you want to do well.",
    "Your sensitivity is part of what makes you empathetic and creative, even when it hurts."
  ]
};

export const getRSDInterventionPrompts = () => {
  return {
    systemPrompt: RSD_SYSTEM_PROMPT,
    templates: RSD_RESPONSE_TEMPLATES,
    patterns: RSDPatternRecognition.patterns,
    responses: MotivationalInterviewingResponses
  };
};

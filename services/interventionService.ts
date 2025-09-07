import { 
  BreathingTechnique, 
  GroundingTechnique, 
  ACTTechnique, 
  TIPPTechnique, 
  RAINMethod,
  DistressToleranceOption,
  CrisisLevel 
} from '../types';

/**
 * Acceptance and Commitment Therapy techniques for digital delivery
 */
export class ACTInterventions {
  static stopCrisisProtocol(): ACTTechnique {
    return {
      name: 'S.T.O.P. Crisis Protocol',
      type: 'ACT',
      duration: '8 minutes',
      description: 'Structured crisis intervention using ACT principles',
      steps: [
        {
          phase: 'Slow',
          duration: 1,
          instruction: "Let's start by slowing your breathing. Take a deep breath in through your nose for 4 counts... hold for 4... out through your mouth for 6. Let's do this together."
        },
        {
          phase: 'Take Note',
          duration: 1,
          instruction: "Now, take note of what's happening right now. Notice any thoughts swirling in your mind, any feelings in your body, without trying to change them."
        },
        {
          phase: 'Open Up',
          duration: 2,
          instruction: "Let's open up space for these difficult feelings. Imagine your thoughts and emotions are like clouds passing through the sky of your mind."
        },
        {
          phase: 'Pursue Values',
          duration: 4,
          instruction: 'What do you want to stand for in this crisis? What kind of person do you want to be, even in this difficult moment?'
        }
      ],
      adhdAdapted: true,
      crisisLevel: [CrisisLevel.MODERATE, CrisisLevel.SEVERE]
    };
  }

  static noticeAndNameDefusion(thought: string): ACTTechnique {
    return {
      name: 'Notice and Name',
      type: 'Cognitive Defusion',
      duration: '3 minutes',
      description: 'Create distance from difficult thoughts',
      thought,
      details: {
        technique: `Instead of: "${thought}"\nTry: "I'm noticing the thought that ${thought.toLowerCase()}"\nOr: "My mind is telling me that ${thought.toLowerCase()}"`,
        followUp: 'How does it feel different when you relate to the thought this way?'
      },
      adhdAdapted: true
    };
  }

  static observerSelfTechnique(): ACTTechnique {
    return {
      name: 'Observer Self',
      type: 'Perspective Taking',
      duration: '5 minutes',
      description: 'Create distance through observer perspective',
      visualization_steps: [
        'Imagine floating up above where you are right now...',
        'Float higher, seeing your neighborhood from above...',
        'Higher still, seeing your city, your state, your country...',
        'Now you\'re looking down at Earth from space...',
        'From this cosmic perspective, notice how your problems look...',
        'You\'re the same person who can observe from this distance.'
      ],
      adhdAdapted: true
    };
  }

  static wordRepetitionDefusion(painfulWord: string): ACTTechnique {
    return {
      name: 'Word Repetition Defusion',
      type: 'Cognitive Defusion',
      duration: '2 minutes',
      description: 'Reduce emotional impact through repetition',
      thought: painfulWord,
      details: {
        instructions: [
          `We're going to repeat the word "${painfulWord}" quickly for 30 seconds.`,
          'This might feel strange, but it helps the word lose its emotional punch.',
          'Ready? Say it with me as fast as you can...',
          `"${painfulWord}" "${painfulWord}" "${painfulWord}"...`,
          'Keep going until I say stop...'
        ],
        timerSeconds: 30,
        followUp: `Notice how "${painfulWord}" feels different now? Like just a sound rather than something heavy?`
      },
      adhdAdapted: true
    };
  }

  static thoughtTrainVisualization(): ACTTechnique {
    return {
      name: 'Thought Train Station',
      type: 'Metaphor',
      duration: '3 minutes',
      description: 'Interactive train metaphor for thought observation',
      visualization_steps: [
        'Imagine you\'re standing on a train platform...',
        'Different trains pull into the station - these are your thoughts.',
        'Some trains have "Worry" written on the side, others say "Fear" or "Anger"...',
        'You can watch the trains, but you don\'t have to get on them.',
        'Notice a difficult thought-train pulling in right now...',
        'What does it look like? What\'s written on the side?',
        'Watch it slow down, stop, then pull away again...',
        'You\'re still standing safely on the platform.'
      ],
      interactive_prompts: [
        'What thought-train do you see right now?',
        'What color is this thought-train?',
        'Are you tempted to get on it?',
        'Can you wave goodbye as it leaves the station?'
      ],
      adhdAdapted: true
    };
  }

  static thankingYourMindTechnique(thought: string): ACTTechnique {
    return {
      name: 'Thank Your Mind',
      type: 'Cognitive Defusion',
      duration: '1 minute',
      description: 'Appreciation approach to difficult thoughts',
      thought,
      details: {
        responses: [
          `Thank you, mind, for the thought "${thought}"`,
          'Thank you for trying to protect me, even though this isn\'t helpful right now',
          'I see you\'re working hard, mind, but I\'ve got this handled',
          'Thanks for the warning, but I\'m going to choose my response'
        ],
        tone: 'gentle and appreciative, like talking to a well-meaning but anxious friend',
        followUp: 'Notice how it feels different to thank your mind rather than fight with it?'
      },
      adhdAdapted: true
    };
  }
}

/**
 * DBT Crisis Skills and Advanced Interventions
 */
export class AdvancedCrisisInterventions {
  static tippTechnique(): TIPPTechnique {
    return {
      name: 'TIPP for Crisis',
      purpose: 'Rapidly change body chemistry in severe distress',
      duration_minutes: 5,
      components: [
        {
          component: 'Temperature',
          instruction: 'Hold an ice cube, splash cold water on your face, or hold your breath and put your face in cold water for 30 seconds',
          purpose: 'Activates dive response, slows heart rate quickly'
        },
        {
          component: 'Intense Exercise',
          instruction: 'Do jumping jacks, run in place, or do push-ups for 10 minutes',
          purpose: 'Burns off stress hormones and adrenaline'
        },
        {
          component: 'Paced Breathing',
          instruction: 'Breathe out longer than you breathe in. Try 4 counts in, 6 counts out',
          purpose: 'Activates parasympathetic nervous system'
        },
        {
          component: 'Paired Muscle Relaxation',
          instruction: 'Tense all your muscles for 5 seconds, then release completely',
          purpose: 'Releases physical tension holding the emotional intensity'
        }
      ],
      crisis_level: 'severe',
      note: 'Use when emotions feel completely overwhelming and out of control'
    };
  }

  static radicalAcceptanceSteps(): any {
    return {
      name: 'Radical Acceptance in Crisis',
      type: 'DBT',
      duration: '3 minutes',
      description: 'Brief radical acceptance for crisis moments',
      steps: [
        {
          step: 1,
          instruction: 'Notice what you\'re fighting against right now',
          prompt: 'What situation or feeling are you trying to push away?'
        },
        {
          step: 2,
          instruction: 'Acknowledge: "This is what\'s happening right now"',
          prompt: 'Can you say: "This pain/situation/feeling is here right now"?'
        },
        {
          step: 3,
          instruction: 'Notice any resistance in your body - tension, clenching',
          prompt: 'Where are you holding the fight in your body?'
        },
        {
          step: 4,
          instruction: 'Soften that resistance, like unclenching a fist',
          prompt: 'Can you let your body relax, even while the pain is here?'
        },
        {
          step: 5,
          instruction: 'Remember: accepting doesn\'t mean approving or giving up',
          prompt: 'You\'re just stopping the extra pain of fighting reality'
        }
      ],
      mantra: 'This is what\'s here right now. I can handle what\'s actually here.'
    };
  }

  static rainMethodADHD(): RAINMethod {
    return {
      name: 'R.A.I.N. for ADHD Emotions',
      duration_minutes: 4,
      adapted_for: 'ADHD emotional intensity and rejection sensitive dysphoria',
      steps: [
        {
          letter: 'R - Recognize',
          duration: 1,
          instruction: 'Name what\'s happening: "I\'m noticing intense [emotion]"',
          adhd_note: 'ADHD emotions come fast and big - naming helps slow them down'
        },
        {
          letter: 'A - Allow',
          duration: 1,
          instruction: 'Let the feeling be here without trying to fix it immediately',
          adhd_note: 'Resist the ADHD urge to DO something right now'
        },
        {
          letter: 'I - Investigate',
          duration: 1,
          instruction: 'Where do you feel this in your body? What triggered it?',
          adhd_note: 'Look for rejection sensitivity triggers or overwhelm patterns'
        },
        {
          letter: 'N - Nurture',
          duration: 1,
          instruction: 'Put your hand on your heart. What would you say to a friend feeling this?',
          adhd_note: 'ADHD brains need extra self-compassion - be gentle with your intense emotions'
        }
      ],
      adhd_reminders: [
        'ADHD emotions are temporary but intense - this will pass',
        'Your emotional intensity is not a character flaw',
        'You feel things deeply, and that\'s also a strength'
      ]
    };
  }

  static distressToleranceMenu(): DistressToleranceOption[] {
    return [
      {
        category: 'Body-Based (Fast)',
        techniques: [
          { name: 'Ice cube hold', time: '30 seconds' },
          { name: 'Intense exercise', time: '2 minutes' },
          { name: 'Progressive muscle release', time: '3 minutes' }
        ]
      },
      {
        category: 'Mind-Based (Medium)',
        techniques: [
          { name: 'Count backwards from 100 by 7s', time: '2-3 minutes' },
          { name: 'Name everything blue in the room', time: '1 minute' },
          { name: 'Alphabet categories (animals A-Z)', time: '3-5 minutes' }
        ]
      },
      {
        category: 'Emotion-Based (Longer)',
        techniques: [
          { name: 'RAIN method', time: '4 minutes' },
          { name: 'Radical acceptance', time: '3 minutes' },
          { name: 'Self-compassion break', time: '2 minutes' }
        ]
      }
    ];
  }
}

/**
 * Evidence-based breathing techniques
 */
export class BreathingInterventions {
  static fourSevenEightBreathing(): BreathingTechnique {
    return {
      name: '4-7-8 Breathing',
      type: 'Breathing',
      duration: '5 minutes',
      description: 'Reduce anxiety and promote calm',
      purpose: 'Reduce anxiety and promote calm',
      instructions: [
        'Exhale completely through your mouth',
        'Close your mouth, inhale through nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through mouth for 8 counts with a whoosh sound',
        'This completes one cycle. Repeat 3-4 times.'
      ],
      cycles: 4,
      adhdAdapted: true,
      crisisLevel: [CrisisLevel.MILD, CrisisLevel.MODERATE],
      attentionRequired: 'medium'
    };
  }

  static boxBreathing(): BreathingTechnique {
    return {
      name: 'Box Breathing',
      type: 'Breathing',
      duration: '4 minutes',
      description: 'Manage acute stress and anger',
      purpose: 'Manage acute stress and anger',
      pattern: '4-4-4-4',
      instructions: [
        'Inhale for 4 counts',
        'Hold for 4 counts',
        'Exhale for 4 counts',
        'Hold empty for 4 counts'
      ],
      cycles: 8,
      adhdAdapted: true,
      crisisLevel: [CrisisLevel.MODERATE, CrisisLevel.SEVERE],
      attentionRequired: 'low'
    };
  }

  static cyclicSighing(): BreathingTechnique {
    return {
      name: 'Cyclic Sighing',
      type: 'Breathing',
      duration: '5 minutes',
      description: 'Daily mood improvement',
      purpose: 'Daily mood improvement',
      instructions: [
        'Take a normal breath in through your nose',
        'Take a second, smaller breath in on top of the first',
        'Long, slow exhale through your mouth',
        'Repeat for 5 minutes'
      ],
      adhdAdapted: true,
      crisisLevel: [CrisisLevel.NONE, CrisisLevel.MILD],
      attentionRequired: 'low'
    };
  }
}

/**
 * Somatic and grounding techniques for crisis stabilization
 */
export class GroundingTechniques {
  static fiveFourThreeTwoOne(): GroundingTechnique {
    return {
      name: '5-4-3-2-1 Grounding',
      type: 'Grounding',
      duration: '3 minutes',
      description: 'Immediate crisis stabilization using all senses',
      steps: [
        {
          sense: 'sight',
          instruction: 'Name 5 things you can see around you',
          count: 5
        },
        {
          sense: 'touch',
          instruction: 'Name 4 things you can touch or feel',
          count: 4
        },
        {
          sense: 'hearing',
          instruction: 'Name 3 things you can hear',
          count: 3
        },
        {
          sense: 'smell',
          instruction: 'Name 2 things you can smell',
          count: 2
        },
        {
          sense: 'taste',
          instruction: 'Name 1 thing you can taste',
          count: 1
        }
      ],
      adhdAdapted: true,
      crisisLevel: [CrisisLevel.MODERATE, CrisisLevel.SEVERE],
      attentionRequired: 'medium'
    };
  }

  static containmentSelfTouch(): GroundingTechnique {
    return {
      name: 'Containment with Self-Touch',
      type: 'Grounding',
      duration: '2 minutes',
      description: 'Self-soothing through proprioceptive input',
      steps: [
        {
          instruction: 'Cross your arms over your chest, hands on opposite shoulders'
        },
        {
          instruction: 'Gently squeeze yourself in a self-hug'
        },
        {
          instruction: 'Notice the feeling of containment and support'
        },
        {
          instruction: 'Breathe slowly while maintaining this position'
        },
        {
          instruction: 'Feel your feet on the ground, supported and stable'
        }
      ],
      adhdAdapted: true,
      crisisLevel: [CrisisLevel.MILD, CrisisLevel.MODERATE],
      attentionRequired: 'low'
    };
  }

  static physicalGrounding(): GroundingTechnique {
    return {
      name: 'Physical Environment',
      type: 'Grounding',
      duration: '2 minutes',
      description: 'Feel your connection to the ground and surfaces around you',
      steps: [
        {
          instruction: 'Feel your feet on the floor - really notice the contact'
        },
        {
          instruction: 'Put your hands on a solid surface and feel its texture'
        },
        {
          instruction: 'Notice how your back feels against your chair'
        },
        {
          instruction: 'Press your palms together and feel the warmth and pressure'
        }
      ],
      adhdAdapted: true,
      crisisLevel: [CrisisLevel.MILD, CrisisLevel.MODERATE, CrisisLevel.SEVERE],
      attentionRequired: 'low'
    };
  }
}

// Export instances for easy use
export const actInterventions = new ACTInterventions();
export const crisisInterventions = new AdvancedCrisisInterventions();
export const breathingInterventions = new BreathingInterventions();
export const groundingTechniques = new GroundingTechniques();

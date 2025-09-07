// RSD-Specific Interventions from Neurodivergent Insights
// Evidence-based techniques for managing Rejection Sensitive Dysphoria

import { 
  InterventionTechnique,
  ACTTechnique,
  GroundingTechnique,
  BreathingTechnique 
} from '../types';

export class RSDInterventions {
  /**
   * Catching the Narrative - Recognizing negative thought patterns
   * Based on cognitive defusion techniques
   */
  static catchingTheNarrative(): ACTTechnique {
    return {
      name: 'Catching the Narrative',
      type: 'Cognitive Defusion',
      duration: '5 minutes',
      description: 'Notice and name negative thought patterns as they unfold',
      steps: [
        {
          phase: 'Recognize',
          duration: 1,
          instruction: "Take a moment to breathe. Notice the story your mind is telling you right now. What narrative is playing? Is it the 'rejection script,' the 'bad friend' story, or something else?"
        },
        {
          phase: 'Name It',
          duration: 1,
          instruction: "Give this narrative a name. Maybe it's 'The Not Good Enough Story' or 'The Everyone Hates Me Script.' By naming it, you create distance from it."
        },
        {
          phase: 'Observe Without Judgment',
          duration: 2,
          instruction: "Watch this story like you're watching a movie. Notice how it unfolds without getting pulled into it. Remember: you are not your thoughts."
        },
        {
          phase: 'Return to Present',
          duration: 1,
          instruction: "Gently bring your attention back to this moment. The story may still be playing, but you don't have to follow its script."
        }
      ],
      adhdAdapted: true,
      details: {
        followUp: "Over time, you'll get better at catching these narratives early. They're just mental constructs, not unchangeable truths.",
        commonNarratives: [
          "I'm incompetent",
          "Nobody likes me",
          "I'm not worthy of recognition",
          "I always mess things up",
          "They're just being nice, they don't really mean it"
        ]
      }
    };
  }

  /**
   * Emotional Acceptance Practice
   * Acknowledge emotions without resistance
   */
  static emotionalAcceptance(): ACTTechnique {
    return {
      name: 'Emotional Acceptance',
      type: 'Acceptance',
      duration: '4 minutes',
      description: 'Practice accepting difficult emotions without judgment',
      steps: [
        {
          phase: 'Locate the Feeling',
          duration: 1,
          instruction: "Where do you feel the rejection in your body? Is it a tightness in your chest? A knot in your stomach? Just notice where it lives."
        },
        {
          phase: 'Allow It to Be',
          duration: 1,
          instruction: "Instead of pushing the feeling away, try saying: 'This feeling is here. It's okay that it's here. I don't have to fix it right now.'"
        },
        {
          phase: 'Breathe With It',
          duration: 1,
          instruction: "Breathe gently, imagining your breath flowing around this feeling, giving it space. You're not trying to breathe it away, just acknowledging its presence."
        },
        {
          phase: 'Self-Compassion',
          duration: 1,
          instruction: "Place a hand on your heart. Remind yourself: 'This is a moment of suffering. Suffering is part of being human. May I be kind to myself in this moment.'"
        }
      ],
      adhdAdapted: true,
      details: {
        note: "Emotional acceptance is especially significant for neurodivergent individuals who tend to have emotionally avoidant coping patterns.",
        challenges: [
          "Alexithymia (difficulty identifying emotions)",
          "Societal stigma around emotional expression",
          "Past trauma or invalidation"
        ]
      }
    };
  }

  /**
   * Emotional Distancing - Observer Perspective
   * View rejection from an external standpoint
   */
  static emotionalDistancing(): ACTTechnique {
    return {
      name: 'Emotional Distancing',
      type: 'Perspective Taking',
      duration: '3 minutes',
      description: 'View your experience from an observer perspective',
      visualization_steps: [
        'Imagine you\'re watching yourself on a movie screen...',
        'You\'re in the audience, observing yourself experiencing these feelings.',
        'Notice how the "you" on screen is reacting to rejection.',
        'What would you tell that person if they were your friend?',
        'Now zoom out further - you\'re watching from a satellite view.',
        'From this distance, how significant does this rejection feel?',
        'Gently return to yourself, carrying this broader perspective.'
      ],
      adhdAdapted: true,
      details: {
        technique: 'This external perspective can expedite the fading of negative emotions (Ayduk & Kross, 2010)',
        alternative: 'If visualization is difficult, try describing your experience in third person: "Sarah is feeling rejected right now..."'
      }
    };
  }

  /**
   * 4-6 Breathing for RSD
   * Extended exhale for nervous system regulation
   */
  static rsdBreathing(): BreathingTechnique {
    return {
      name: 'RSD Relief Breathing',
      steps: [
        { label: 'Breathe In', duration: 4 },
        { label: 'Hold', duration: 1 },
        { label: 'Slow Exhale', duration: 6 }
      ],
      description: 'Extended exhale breathing specifically for rejection sensitivity',
      purpose: 'When we experience rejection, our bodies perceive it as a threat. This breathing pattern signals safety to your nervous system.',
      instructions: [
        'Inhale deeply through your nose for 4 counts',
        'Hold for 1-2 seconds',
        'Slowly exhale through your mouth for 6 counts',
        'The extended exhale is crucial for triggering the relaxation response',
        'Repeat for 5-10 cycles or until you feel calmer'
      ],
      adhdTips: [
        'Count on your fingers to stay focused',
        'Visualize breathing in calm, breathing out tension',
        'It\'s okay if your mind wanders - just gently return to counting'
      ]
    };
  }

  /**
   * Progressive Muscle Relaxation adapted for RSD
   */
  static muscleRelaxationForRSD(): GroundingTechnique {
    return {
      name: 'Body Scan for Rejection Relief',
      description: 'Release physical tension from emotional rejection',
      steps: [
        'Start by noticing where rejection lives in your body',
        'Begin with your face and jaw - rejection often causes tension here',
        'Gently tense these muscles for 5 seconds',
        'Release completely, feeling the difference',
        'Move to your shoulders - lift them to your ears, hold, then drop',
        'Continue through your chest (where hurt often sits)',
        'Your stomach (where anxiety lives)',
        'Finally, your hands - make fists, then release',
        'End by wiggling your whole body gently'
      ],
      duration: 300, // 5 minutes
      adhdAdaptations: [
        'Move through body parts quickly if attention fades',
        'It\'s okay to skip areas that feel uncomfortable',
        'Try doing this to music with a steady beat'
      ]
    };
  }

  /**
   * Sensory Grounding for RSD Episodes
   */
  static sensoryGroundingRSD(): GroundingTechnique {
    return {
      name: 'Sensory Anchoring for Rejection',
      description: 'Use your senses to ground when rejection feels overwhelming',
      steps: [
        'First, acknowledge: "I\'m feeling rejected and that\'s really painful"',
        'Now find 5 things you can see (look for calming colors)',
        'Touch 4 different textures around you',
        'Listen for 3 sounds (even your own breathing counts)',
        'Identify 2 scents (or remember favorite smells)',
        'Notice 1 taste (or sip some water mindfully)',
        'End by placing both feet firmly on the ground'
      ],
      duration: 180, // 3 minutes
      adhdAdaptations: [
        'Keep a sensory kit ready: soft fabric, essential oil, mints',
        'Use movement - touch objects while walking around',
        'Make it a game - find items of specific colors'
      ],
      materials: [
        'Soft fabric or stress ball',
        'Essential oils or scented lotion',
        'Mints or gum',
        'Textured objects',
        'Calming visuals or photos'
      ]
    };
  }

  /**
   * Temperature Grounding for Intense RSD
   */
  static temperatureGrounding(): GroundingTechnique {
    return {
      name: 'Temperature Reset',
      description: 'Use temperature changes to interrupt rejection spirals',
      steps: [
        'Get an ice cube or very cold object',
        'Hold it in your hand, focusing entirely on the sensation',
        'Notice how the cold feels - sharp? numbing? intense?',
        'As it melts, notice the changing sensations',
        'Switch hands if needed',
        'Alternative: splash cold water on your face',
        'Or hold a warm mug of tea, focusing on the warmth',
        'End by rubbing your hands together, creating your own warmth'
      ],
      duration: 120, // 2 minutes
      adhdAdaptations: [
        'Keep ice packs in freezer for quick access',
        'Try alternating hot and cold sensations',
        'Use strong temperature contrasts for better focus'
      ],
      safetyNote: 'Never use extreme temperatures that could harm your skin'
    };
  }

  /**
   * Self-Compassion Practice for RSD
   */
  static selfCompassionForRSD(): ACTTechnique {
    return {
      name: 'Self-Compassion for Rejection',
      type: 'Self-Compassion',
      duration: '4 minutes',
      description: 'Treat yourself with the kindness you\'d show a friend',
      steps: [
        {
          phase: 'Acknowledge the Pain',
          duration: 1,
          instruction: "Say to yourself: 'This really hurts. Rejection is one of the most painful human experiences.'"
        },
        {
          phase: 'Common Humanity',
          duration: 1,
          instruction: "Remember: 'Everyone experiences rejection. I'm not alone in this. This is part of being human, especially with a sensitive nervous system.'"
        },
        {
          phase: 'Kind Words',
          duration: 1,
          instruction: "What would you say to your best friend feeling this way? Now say those same words to yourself. Maybe: 'You're doing your best. This feeling will pass.'"
        },
        {
          phase: 'Soothing Touch',
          duration: 1,
          instruction: "Place both hands on your heart, give yourself a hug, or gently stroke your arm. Let your body know you're here for yourself."
        }
      ],
      adhdAdapted: true,
      phrases: [
        "This is really hard right now",
        "May I be kind to myself",
        "May I give myself compassion",
        "May I remember I'm not alone",
        "May I be strong and patient"
      ]
    };
  }

  /**
   * Journaling Prompts for RSD
   */
  static journalingPromptsRSD(): string[] {
    return [
      "What story is my rejection-sensitive brain telling me right now?",
      "If I zoom out, what are the actual facts of what happened?",
      "What would I tell my best friend if they were experiencing this?",
      "What evidence do I have that contradicts this rejection narrative?",
      "How has my ADHD brain misinterpreted social cues before?",
      "What are three possible alternative explanations for what happened?",
      "What would accepting this feeling (without believing the story) look like?",
      "What small act of self-care can I do right now?",
      "Who in my life has shown me genuine acceptance?",
      "What would 'good enough' look like in this situation?",
      "If this feeling were a weather pattern, what would it be? When will it pass?",
      "What have I survived before that felt this intense?"
    ];
  }

  /**
   * Quick RSD Relief Menu
   */
  static quickReliefMenu(): InterventionTechnique[] {
    return [
      {
        name: 'Splash of Cold',
        description: 'Splash cold water on face or hold an ice cube',
        duration: '30 seconds',
        category: 'grounding'
      },
      {
        name: 'Name the Feeling',
        description: 'Say out loud: "I\'m experiencing RSD and it will pass"',
        duration: '1 minute',
        category: 'acceptance'
      },
      {
        name: 'Move Your Body',
        description: 'Do 20 jumping jacks or dance to one song',
        duration: '2 minutes',
        category: 'movement'
      },
      {
        name: 'Call it Out',
        description: 'Text a friend: "RSD is lying to me right now"',
        duration: '1 minute',
        category: 'connection'
      },
      {
        name: 'Bilateral Stimulation',
        description: 'Cross-lateral marching or butterfly hug for 2 minutes',
        duration: '2 minutes',
        category: 'regulation'
      }
    ];
  }
}

// Export all RSD interventions grouped by type
export const getRSDInterventions = () => {
  return {
    cognitive: [
      RSDInterventions.catchingTheNarrative(),
      RSDInterventions.emotionalDistancing(),
      RSDInterventions.selfCompassionForRSD()
    ],
    somatic: [
      RSDInterventions.rsdBreathing(),
      RSDInterventions.muscleRelaxationForRSD(),
      RSDInterventions.sensoryGroundingRSD(),
      RSDInterventions.temperatureGrounding()
    ],
    quick: RSDInterventions.quickReliefMenu(),
    journaling: RSDInterventions.journalingPromptsRSD()
  };
};

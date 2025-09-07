import { CrisisLevel, AttentionStatus, InterventionTechnique } from '../types';

export interface DeescalationPhase {
  name: string;
  description: string;
  duration: number; // minutes
  techniques: InterventionTechnique[];
  successCriteria: string[];
  escalationTriggers: string[];
}

export interface DeescalationStep {
  id: string;
  phase: string;
  prompt: string;
  expectedResponse: string;
  followUpQuestions: string[];
  validationMessages: string[];
  adhdAdaptations: string[];
  safetyChecks: string[];
}

export interface DeescalationProgress {
  currentPhase: string;
  currentStep: string;
  phaseStartTime: Date;
  totalProgress: number; // 0-100
  stressLevel: number; // 1-10 scale
  engagementLevel: number; // 1-10 scale
  completedTechniques: InterventionTechnique[];
  breakthroughMoments: string[];
}

export class DeescalationConversationService {
  private phases: Map<string, DeescalationPhase> = new Map();
  private steps: Map<string, DeescalationStep[]> = new Map();

  constructor() {
    this.initializePhases();
    this.initializeSteps();
  }

  private initializePhases() {
    // Phase 1: Immediate Safety & Stabilization
    this.phases.set('safety', {
      name: 'Safety & Stabilization',
      description: 'Ensure immediate safety and begin physiological calm',
      duration: 3,
      techniques: [InterventionTechnique.BREATHING, InterventionTechnique.GROUNDING],
      successCriteria: [
        'User confirms physical safety',
        'Breathing rate normalizes',
        'User can focus on conversation'
      ],
      escalationTriggers: [
        'Self-harm ideation expressed',
        'Substance use mentioned',
        'Inability to respond coherently'
      ]
    });

    // Phase 2: Emotional Validation & Connection
    this.phases.set('validation', {
      name: 'Validation & Connection',
      description: 'Build therapeutic rapport and validate experience',
      duration: 5,
      techniques: [InterventionTechnique.ACT_DEFUSION, InterventionTechnique.RAIN],
      successCriteria: [
        'User feels heard and understood',
        'Emotional intensity decreases',
        'User shares more context'
      ],
      escalationTriggers: [
        'Increased agitation or anger',
        'Withdrawal from conversation',
        'Crisis level increases'
      ]
    });

    // Phase 3: Cognitive Restructuring
    this.phases.set('cognitive', {
      name: 'Cognitive Restructuring',
      description: 'Address thought patterns and provide perspective',
      duration: 7,
      techniques: [
        InterventionTechnique.ACT_DEFUSION,
        InterventionTechnique.ACT_VALUES,
        InterventionTechnique.DBT_DISTRESS_TOLERANCE
      ],
      successCriteria: [
        'User identifies cognitive distortions',
        'Alternative perspectives considered',
        'Reduced catastrophic thinking'
      ],
      escalationTriggers: [
        'Rigid thinking patterns persist',
        'Increased self-blame',
        'Dissociation indicators'
      ]
    });

    // Phase 4: Skill Building & Coping
    this.phases.set('skills', {
      name: 'Skill Building & Coping',
      description: 'Teach and practice concrete coping strategies',
      duration: 8,
      techniques: [
        InterventionTechnique.DBT_TIPP,
        InterventionTechnique.ACT_MINDFULNESS,
        InterventionTechnique.GROUNDING
      ],
      successCriteria: [
        'User learns new coping skill',
        'Successful skill practice',
        'Increased confidence'
      ],
      escalationTriggers: [
        'Skill practice causes frustration',
        'Attention span decreases significantly',
        'User becomes overwhelmed'
      ]
    });

    // Phase 5: Future Planning & Resources
    this.phases.set('planning', {
      name: 'Planning & Resources',
      description: 'Create action plan and connect to ongoing support',
      duration: 5,
      techniques: [InterventionTechnique.ACT_VALUES, InterventionTechnique.ACT_COMMITMENT],
      successCriteria: [
        'Concrete next steps identified',
        'Support resources connected',
        'Safety plan updated'
      ],
      escalationTriggers: [
        'Inability to make plans',
        'Hopelessness about future',
        'Rejection of all support options'
      ]
    });
  }

  private initializeSteps() {
    // Safety Phase Steps
    this.steps.set('safety', [
      {
        id: 'safety-1',
        phase: 'safety',
        prompt: "I can hear that you're really struggling right now, and I want you to know that reaching out was incredibly brave. Let's start by making sure you're physically safe. Are you in a safe place right now?",
        expectedResponse: "Safety confirmation or concerns",
        followUpQuestions: [
          "Can you tell me where you are right now?",
          "Is there anyone with you, or would you like someone to be with you?",
          "Do you have access to anything that might harm you?"
        ],
        validationMessages: [
          "Thank you for being honest with me about your situation.",
          "It takes real courage to reach out when you're feeling this way.",
          "You're taking exactly the right steps by prioritizing your safety."
        ],
        adhdAdaptations: [
          "I'll keep my questions simple and clear.",
          "We can take breaks whenever you need them.",
          "There's no pressure to get everything 'right' - just be honest."
        ],
        safetyChecks: [
          "Assess immediate physical safety",
          "Identify potential self-harm means",
          "Determine if emergency services needed"
        ]
      },
      {
        id: 'safety-2',
        phase: 'safety',
        prompt: "I notice your breathing might be a bit quick right now - that's completely normal when we're stressed. Would you be willing to try some slow breathing with me? It can help your body feel a bit calmer while we talk.",
        expectedResponse: "Willingness to try breathing or resistance",
        followUpQuestions: [
          "How does that breathing feel in your body?",
          "Can you notice any small changes as we breathe together?",
          "Would you like to try a different breathing pattern?"
        ],
        validationMessages: [
          "You're doing great - there's no perfect way to breathe.",
          "Even trying this shows real strength and self-care.",
          "Your body is learning to calm down, and that takes time."
        ],
        adhdAdaptations: [
          "Short breathing exercises (30-60 seconds max)",
          "Visual or counting cues provided",
          "Permission to stop if it feels overwhelming"
        ],
        safetyChecks: [
          "Monitor for hyperventilation",
          "Watch for increased distress",
          "Assess grounding in present moment"
        ]
      }
    ]);

    // Validation Phase Steps
    this.steps.set('validation', [
      {
        id: 'validation-1',
        phase: 'validation',
        prompt: "What you're experiencing right now sounds incredibly overwhelming. With ADHD, intense emotions can feel like they're taking over everything - and that's not your fault. Can you help me understand what's been the hardest part for you today?",
        expectedResponse: "Emotional expression or situation description",
        followUpQuestions: [
          "How long have you been feeling this intensity?",
          "What happened that made things feel more difficult?",
          "Have you been dealing with this kind of overwhelm lately?"
        ],
        validationMessages: [
          "What you're feeling makes complete sense given what you're going through.",
          "ADHD brains experience emotions more intensely - you're not overreacting.",
          "Thank you for trusting me with something so personal and painful."
        ],
        adhdAdaptations: [
          "Normalize ADHD emotional intensity",
          "Avoid rushing to solutions",
          "Reflect back their exact words"
        ],
        safetyChecks: [
          "Listen for suicidal ideation",
          "Assess crisis level changes",
          "Monitor emotional regulation"
        ]
      },
      {
        id: 'validation-2',
        phase: 'validation',
        prompt: "It sounds like you're carrying so much right now. ADHD can make us feel like we're failing when we're actually doing our best under really difficult circumstances. What would you say to a friend who was going through exactly what you're experiencing?",
        expectedResponse: "Self-compassion or continued self-criticism",
        followUpQuestions: [
          "What makes it harder to give yourself that same kindness?",
          "Have you always been this hard on yourself?",
          "What would it feel like to treat yourself as gently as you'd treat that friend?"
        ],
        validationMessages: [
          "The kindness you'd show others is exactly what you deserve too.",
          "Being hard on yourself when you're struggling only adds to the pain.",
          "You're human, and humans struggle sometimes - that's not a failure."
        ],
        adhdAdaptations: [
          "Use concrete, relatable examples",
          "Challenge black-and-white thinking gently",
          "Connect to ADHD-specific struggles"
        ],
        safetyChecks: [
          "Monitor self-harm risk factors",
          "Assess shame and self-blame levels",
          "Watch for therapeutic rupture signs"
        ]
      }
    ]);

    // Cognitive Phase Steps
    this.steps.set('cognitive', [
      {
        id: 'cognitive-1',
        phase: 'cognitive',
        prompt: "I'm noticing some really harsh thoughts you're having about yourself. With ADHD, our brains can get stuck in these thought loops that feel totally true but might not be the whole picture. What if we looked at one of these thoughts like we're curious scientists instead of judges?",
        expectedResponse: "Engagement with thought examination or resistance",
        followUpQuestions: [
          "What evidence supports this thought? What evidence challenges it?",
          "If your best friend had this thought, what would you tell them?",
          "What would this situation look like from someone else's perspective?"
        ],
        validationMessages: [
          "It takes real courage to question thoughts that feel so real and powerful.",
          "You're not trying to convince yourself everything is fine - just getting the full picture.",
          "This kind of thinking flexibility is a skill that gets stronger with practice."
        ],
        adhdAdaptations: [
          "Focus on one thought at a time",
          "Use concrete examples rather than abstract concepts",
          "Provide structure with specific questions"
        ],
        safetyChecks: [
          "Monitor for increased hopelessness",
          "Assess reality testing",
          "Watch for cognitive rigidity"
        ]
      }
    ]);

    // Skills Phase Steps
    this.steps.set('skills', [
      {
        id: 'skills-1',
        phase: 'skills',
        prompt: "You've been doing such hard work in our conversation. Now I want to give you something concrete you can use - a tool that fits with how ADHD brains work best. Would you like to learn a quick technique that can help when emotions feel too big?",
        expectedResponse: "Interest in learning or hesitation",
        followUpQuestions: [
          "What kinds of coping strategies have helped you before?",
          "Do you prefer techniques that are more physical or more mental?",
          "How long can you usually focus on something when you're upset?"
        ],
        validationMessages: [
          "Learning new skills when you're struggling shows incredible strength.",
          "It's okay if techniques don't work perfectly the first time - that's normal.",
          "You're building a toolkit that will be there whenever you need it."
        ],
        adhdAdaptations: [
          "Keep techniques simple and short",
          "Provide multiple options to choose from",
          "Allow for movement-based strategies"
        ],
        safetyChecks: [
          "Ensure techniques don't increase distress",
          "Monitor attention and engagement",
          "Assess skill comprehension"
        ]
      }
    ]);

    // Planning Phase Steps
    this.steps.set('planning', [
      {
        id: 'planning-1',
        phase: 'planning',
        prompt: "You've shown so much strength and insight in our conversation today. Before we wrap up, I want to help you think about the next few hours and days. What's one small thing that usually helps you feel a little more stable or grounded?",
        expectedResponse: "Identification of helpful activities or uncertainty",
        followUpQuestions: [
          "How can you make that more likely to happen?",
          "Who in your life could support you with this?",
          "What might get in the way, and how could we plan for that?"
        ],
        validationMessages: [
          "You know yourself better than anyone - trust those instincts.",
          "Small steps are still steps forward, especially with ADHD.",
          "Having a plan doesn't mean everything will be perfect - it just gives you a place to start."
        ],
        adhdAdaptations: [
          "Focus on very specific, concrete next steps",
          "Plan for ADHD-related obstacles",
          "Include self-compassion in the plan"
        ],
        safetyChecks: [
          "Ensure realistic and achievable plans",
          "Confirm safety resources are accessible",
          "Schedule follow-up if needed"
        ]
      }
    ]);
  }

  getPhaseByName(phaseName: string): DeescalationPhase | undefined {
    return this.phases.get(phaseName);
  }

  getStepsForPhase(phaseName: string): DeescalationStep[] {
    return this.steps.get(phaseName) || [];
  }

  determineNextPhase(currentPhase: string, progress: DeescalationProgress, crisisLevel: CrisisLevel): string {
    // Safety first - always return to safety if crisis escalates
    if (crisisLevel === CrisisLevel.SEVERE) {
      return 'safety';
    }

    // Normal progression
    const phaseOrder = ['safety', 'validation', 'cognitive', 'skills', 'planning'];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    
    // Check if current phase success criteria are met
    const currentPhaseData = this.phases.get(currentPhase);
    if (currentPhaseData && this.isPhaseComplete(progress, currentPhaseData)) {
      if (currentIndex < phaseOrder.length - 1) {
        return phaseOrder[currentIndex + 1];
      }
    }

    // Stay in current phase if not complete or if it's the last phase
    return currentPhase;
  }

  private isPhaseComplete(progress: DeescalationProgress, phase: DeescalationPhase): boolean {
    // Simple heuristic - in real implementation, this would be more sophisticated
    return progress.engagementLevel >= 6 && progress.stressLevel <= 5;
  }

  generateContextualPrompt(
    step: DeescalationStep,
    userResponse: string,
    progress: DeescalationProgress,
    attentionStatus: AttentionStatus
  ): string {
    let prompt = step.prompt;

    // Add ADHD-specific adaptations based on attention status
    if (attentionStatus === AttentionStatus.FADING) {
      prompt += "\n\n*I can sense your attention might be shifting - that's completely normal with ADHD. Would you like to take a quick break or try something different?*";
    } else if (attentionStatus === AttentionStatus.HYPERFOCUSED) {
      prompt += "\n\n*I appreciate how engaged you are. Remember, we can take this at whatever pace feels right for you.*";
    }

    // Add validation if user seems disconnected
    if (progress.engagementLevel < 4) {
      const validation = step.validationMessages[Math.floor(Math.random() * step.validationMessages.length)];
      prompt = validation + "\n\n" + prompt;
    }

    return prompt;
  }

  assessStepEffectiveness(
    userResponse: string,
    step: DeescalationStep,
    previousProgress: DeescalationProgress
  ): number {
    // Simple scoring system - in real implementation, this would use NLP
    let score = 5; // baseline

    // Positive indicators
    if (userResponse.toLowerCase().includes('better') || 
        userResponse.toLowerCase().includes('helps') ||
        userResponse.toLowerCase().includes('thank')) {
      score += 2;
    }

    // Engagement indicators
    if (userResponse.length > 50) score += 1;
    if (userResponse.includes('?')) score += 1; // asking questions

    // Negative indicators
    if (userResponse.toLowerCase().includes('worse') ||
        userResponse.toLowerCase().includes('angry') ||
        userResponse.toLowerCase().includes('pointless')) {
      score -= 2;
    }

    return Math.max(1, Math.min(10, score));
  }

  createProgressUpdate(
    currentProgress: DeescalationProgress,
    stepEffectiveness: number,
    userEngagement: number,
    currentStressLevel: number
  ): DeescalationProgress {
    return {
      ...currentProgress,
      totalProgress: Math.min(100, currentProgress.totalProgress + (stepEffectiveness * 2)),
      stressLevel: Math.max(1, currentStressLevel),
      engagementLevel: Math.max(1, Math.min(10, userEngagement)),
      breakthroughMoments: stepEffectiveness >= 8 
        ? [...currentProgress.breakthroughMoments, `Breakthrough at ${new Date().toISOString()}`]
        : currentProgress.breakthroughMoments
    };
  }
}

export const deescalationService = new DeescalationConversationService();

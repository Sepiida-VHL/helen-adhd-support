/**
 * RSD-Aware Gemini Configuration
 * Enhances the AI responses with RSD pattern recognition and Motivational Interviewing
 */

import { Message, Sender, GeminiResponse } from '../types';
import { 
  RSDPatternRecognition, 
  MotivationalInterviewingResponses, 
  RSD_SYSTEM_PROMPT, 
  RSD_RESPONSE_TEMPLATES,
  getRSDInterventionPrompts 
} from './rsdConversationPatterns';

export interface RSDAnalysis {
  stage: 'mistake' | 'self-judgment' | 'generalization' | 'identity-attack' | 'worthlessness' | null;
  severity: number;
  miResponse?: {
    technique: string;
    response: string;
    followUp?: string;
  };
  copingQuestions?: string[];
  contextPrompt?: string;
}

/**
 * Analyze message for RSD patterns and generate appropriate MI response
 */
export function analyzeRSDPatterns(message: string): RSDAnalysis {
  const detection = RSDPatternRecognition.detectStage(message);
  
  if (!detection.stage) {
    return { stage: null, severity: 0 };
  }
  
  const miResponse = MotivationalInterviewingResponses.getResponse(detection.stage, message);
  const copingQuestions = MotivationalInterviewingResponses.getCopingQuestions(detection.stage);
  
  // Generate context prompt for the AI
  const contextPrompt = `
RSD ALERT: User is experiencing ${detection.stage} (severity: ${detection.severity}/5)

CRITICAL: Apply Motivational Interviewing techniques:
- Technique: ${miResponse.technique}
- Core response theme: ${miResponse.response}
- Follow-up theme: ${miResponse.followUp || 'Continue with compassionate presence'}

Suggested coping questions (use 1-2 naturally):
${copingQuestions.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join('\n')}

Remember:
1. Don't make it obvious you're following a script
2. Integrate these suggestions naturally into your response
3. Maintain warmth and genuine curiosity
4. Separate their actions from their identity
5. Use "I notice..." or "It sounds like..." language
6. Ask no more than one question per response
7. If severity is 4-5, prioritize safety and stabilization

The user said: "${message}"
`;
  
  return {
    stage: detection.stage,
    severity: detection.severity,
    miResponse,
    copingQuestions,
    contextPrompt
  };
}

/**
 * Generate RSD-aware system instruction
 */
export function getRSDAwareSystemInstruction(baseInstruction: string, previousActivity?: string | null): string {
  const rsdPrompts = getRSDInterventionPrompts();
  
  return `${baseInstruction}

${rsdPrompts.systemPrompt}

${previousActivity ? `
CONTEXT: User completed ${previousActivity} before this chat.
- They've already done self-regulation work
- Acknowledge this briefly and warmly
- Focus on deeper exploration rather than crisis assessment
` : ''}

RSD Response Templates for Reference:
${JSON.stringify(rsdPrompts.templates, null, 2)}

Critical Reminders:
- RSD makes rejection feel like physical pain
- Small mistakes can trigger identity-level attacks
- Your gentle curiosity can interrupt the spiral
- Questions should invite self-compassion, not analysis
- Normalize without minimizing
- Validate the feeling while gently questioning the narrative
`;
}

/**
 * Enhance response with RSD-specific interventions if needed
 */
export function enhanceResponseWithRSDInterventions(
  baseResponse: GeminiResponse,
  rsdAnalysis: RSDAnalysis
): GeminiResponse {
  // Only suggest RSD interventions for moderate to severe stages
  if (!rsdAnalysis.stage || rsdAnalysis.severity < 3) {
    return baseResponse;
  }
  
  // Add RSD-specific intervention to suggestions
  const rsdInterventions = [
    {
      name: 'Catching the Narrative',
      description: 'Notice and name the story your mind is telling',
      duration: '3-5 minutes',
      category: 'cognitive'
    },
    {
      name: 'Self-Compassion Break',
      description: 'Treat yourself with the kindness you\'d show a friend',
      duration: '3 minutes',
      category: 'emotional'
    },
    {
      name: 'RSD Relief Breathing',
      description: 'Extended exhale breathing for rejection sensitivity',
      duration: '2-5 minutes',
      category: 'somatic'
    },
    {
      name: 'Quick Temperature Reset',
      description: 'Use cold water or ice to interrupt the spiral',
      duration: '30 seconds',
      category: 'grounding'
    }
  ];
  
  // Select appropriate intervention based on stage
  let selectedIntervention;
  switch (rsdAnalysis.stage) {
    case 'mistake':
    case 'self-judgment':
      selectedIntervention = rsdInterventions[0]; // Catching the Narrative
      break;
    case 'generalization':
    case 'identity-attack':
      selectedIntervention = rsdInterventions[1]; // Self-Compassion
      break;
    case 'worthlessness':
      selectedIntervention = rsdInterventions[3]; // Quick grounding
      break;
    default:
      selectedIntervention = rsdInterventions[2]; // Breathing
  }
  
  return {
    ...baseResponse,
    suggestedInterventions: [
      selectedIntervention,
      ...baseResponse.suggestedInterventions.slice(0, 2)
    ].slice(0, 3) // Max 3 interventions
  };
}

/**
 * Process message through RSD-aware pipeline
 */
export function processRSDAwareMessage(
  messages: Message[],
  previousActivity?: string | null
): { 
  rsdAnalysis: RSDAnalysis;
  enhancedPrompt?: string;
  shouldPrioritizeRSD: boolean;
} {
  const latestUserMessage = messages.filter(m => m.sender === Sender.User).pop();
  
  if (!latestUserMessage) {
    return {
      rsdAnalysis: { stage: null, severity: 0 },
      shouldPrioritizeRSD: false
    };
  }
  
  const rsdAnalysis = analyzeRSDPatterns(latestUserMessage.text);
  
  // Determine if RSD should be prioritized
  const shouldPrioritizeRSD = rsdAnalysis.severity >= 2;
  
  return {
    rsdAnalysis,
    enhancedPrompt: rsdAnalysis.contextPrompt,
    shouldPrioritizeRSD
  };
}

/**
 * Generate ADHD validation specific to RSD
 */
export function generateRSDValidation(stage: string | null, severity: number): string | null {
  if (!stage) return null;
  
  const validations: Record<string, string[]> = {
    'mistake': [
      "ADHD brains process mistakes more intensely - that's neurological, not a character flaw.",
      "Your executive function hiccup doesn't define your worth.",
      "Mistakes feel bigger with ADHD. This feeling will pass."
    ],
    'self-judgment': [
      "That harsh inner critic often comes from years of ADHD struggles. You deserve kindness.",
      "RSD is making this feel catastrophic. Your brain is trying to protect you.",
      "Self-judgment is often how ADHD brains try to prevent future rejection."
    ],
    'generalization': [
      "ADHD can make patterns feel permanent when they're not.",
      "Your brain is good at finding patterns - sometimes too good. Let's check the evidence.",
      "Black-and-white thinking is common with ADHD, especially under stress."
    ],
    'identity-attack': [
      "You are not your ADHD struggles. You're a whole person dealing with a challenging brain.",
      "RSD makes everything feel like it's about your worth. It's not.",
      "Living with ADHD in a neurotypical world is exhausting. Be gentle with yourself."
    ],
    'worthlessness': [
      "RSD lies. Your worth isn't determined by your neurodivergence or your struggles.",
      "This crushing feeling is temporary, even though it feels permanent right now.",
      "Your sensitive brain also brings gifts - creativity, empathy, passion. You matter."
    ]
  };
  
  const options = validations[stage] || [];
  return options[Math.floor(Math.random() * options.length)] || null;
}

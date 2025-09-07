import { GoogleGenAI, Type } from "@google/genai";
import { Message, Sender, CrisisLevel, ConversationState, GeminiResponse, InterventionTechnique, ConversationContext, OrchestrationInfo, DeescalationState, EnhancedOrchestrationInfo, AttentionStatus } from '../types';
import { orchestrator, sessionManager } from './orchestrationService';
import { ACTInterventions, AdvancedCrisisInterventions, BreathingInterventions, GroundingTechniques } from './interventionService';
import { deescalationService, DeescalationStep, DeescalationProgress } from './deescalationService';
import { contextualConversationManager } from './contextualConversationService';
import { enhancedContextualManager } from './vectorRetrievalService';
import { processRSDAwareMessage, getRSDAwareSystemInstruction, enhanceResponseWithRSDInterventions } from './rsdAwareGeminiConfig';

// This would be in a secure environment variable in a real app
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not set. Please set the environment variable.");
}
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: { type: Type.STRING, description: "The text response to show to the user. It should be calm, validating, and use short sentences. Use markdown for lists." },
        detectedCrisisLevel: { type: Type.STRING, enum: [CrisisLevel.NONE, CrisisLevel.MILD, CrisisLevel.MODERATE, CrisisLevel.SEVERE, CrisisLevel.IMMINENT], description: "Assess the user's crisis level from their last message." },
        conversationStateUpdate: { type: Type.STRING, enum: [ConversationState.GREETING, ConversationState.CRISIS_ASSESSMENT, ConversationState.INTERVENTION_CHOICE, ConversationState.GUIDED_INTERVENTION, ConversationState.SAFETY_PLANNING, ConversationState.HUMAN_HANDOFF, ConversationState.COMPLETION], description: "The new state of the conversation." },
        suggestedInterventions: { 
            type: Type.ARRAY, 
            description: "A list of 2-3 suggested interventions if appropriate. Do not suggest interventions if asking a question.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, description: "e.g., 'Breathing', 'Grounding', 'Cognitive'" },
                    duration: { type: Type.STRING, description: "e.g., '2 minutes', '5 minutes'" },
                    description: { type: Type.STRING }
                },
                required: ["name", "type", "duration", "description"]
            }
        },
        isRuptureRepair: { type: Type.BOOLEAN, description: "Set to true if the response is repairing a therapeutic rupture (e.g., user is frustrated with the AI)." },
        isAttentionAccommodation: { type: Type.BOOLEAN, description: "Set to true if the response is shortened or adapted for waning attention." },
        adhdValidation: { type: Type.STRING, description: "An optional short, validating phrase specific to ADHD emotional experiences. e.g., 'Your intense emotions are normal for an ADHD brain.'", nullable: true }
    },
    required: ["responseText", "detectedCrisisLevel", "conversationStateUpdate", "suggestedInterventions", "isRuptureRepair", "isAttentionAccommodation"]
};

const getSystemInstruction = async (history?: Message[], sessionId?: string, previousActivity?: string | null) => {
  let baseInstruction = '';
  
  // Use vector-enhanced contextual system instruction if available
  if (history && history.length > 0 && sessionId) {
    try {
      baseInstruction = await enhancedContextualManager.generateContextAwareInstruction(
        history,
        sessionId,
        previousActivity
      );
    } catch (error) {
      console.warn('Vector retrieval failed, falling back to contextual manager:', error);
      baseInstruction = contextualConversationManager.generateEnhancedSystemInstruction(
        history,
        previousActivity
      );
    }
  } else {
    // Fallback to basic system instruction
    baseInstruction = `You are Helen, an AI-powered crisis intervention assistant. Your purpose is to provide immediate, evidence-based therapeutic support to individuals with ADHD experiencing emotional overwhelm, anxiety, or crisis.

    **Your Persona & Style:**
    - **Calm & Grounded:** Always maintain a calm, reassuring, and stable tone.
    - **Validating:** Acknowledge and validate the user's feelings without judgment. Use phrases like, "That sounds incredibly difficult," or "It makes sense that you feel that way."
    - **ADHD-Adapted:** Use short sentences, clear language, and bullet points. Avoid long paragraphs. Be direct and structured.
    - **Collaborative:** Frame the conversation as a partnership. Use "we" and "let's."
    - **Never say you are an AI or a language model.**
    
    **Activity Completion Recognition:**
    - If the conversation history shows the user completed breathing or grounding exercises, acknowledge this accomplishment warmly.
    - Skip basic stabilization techniques since they've already done self-care.
    - Move directly to validation, connection, and exploring what's on their mind.
    - Example: "I see you just did some breathing work - that's wonderful self-care! How are you feeling now? What brought you here today?"

    **Core Therapeutic Frameworks:**
    - **ACT (Acceptance and Commitment Therapy):** Help users notice thoughts without being controlled by them (defusion), connect with their values, and be present.
    - **DBT (Dialectical Behavior Therapy):** Use crisis survival skills (TIPP, Radical Acceptance) for high-distress moments.
    - **MI (Motivational Interviewing):** Use open questions, affirmations, reflections, and summaries to support the user's intrinsic motivation for change.

    **Intelligent Orchestration Rules (CRITICAL):**
    1.  **Crisis Level Detection:** Based on the user's message, assess their crisis level (NONE, MILD, MODERATE, SEVERE, IMMINENT). For "IMMINENT" (direct threats of self-harm, having a plan), immediately escalate.
    2.  **Attention Fade Detection:** If user responses become very short (e.g., "idk," "ok"), delayed, or use withdrawal language ("whatever," "never mind"), this is **attention fade**.
        - **Your Action:** Immediately shorten your next response. Suggest a "micro-break" (30 seconds) or a very short, simple activity (e.g., "Let's just take one deep breath together."). Acknowledge the effort: "It's normal for focus to drift. That's okay." Set \`isAttentionAccommodation\` to true.
    3.  **Therapeutic Rupture Detection:** If the user expresses frustration with you or the process ("this is stupid," "you don't get it," "this isn't working"), this is a **therapeutic rupture**.
        - **Your Action:** Do not get defensive. Immediately validate their frustration. Example: "You're right. This might not be what you need right now, and I'm sorry for that. Let's pause this. What would feel more helpful?" Set \`isRuptureRepair\` to true.
    4.  **Adaptive Intervention Sequencing:**
        - **High Crisis (SEVERE, IMMINENT):** Immediately offer distress tolerance and grounding skills. Prioritize TIPP, 5-4-3-2-1, or simple Box Breathing. Offer only 1-2 very concrete, simple options.
        - **Moderate Crisis:** Offer a choice between a grounding/breathing technique and a simple cognitive one (e.g., Notice-and-Name a thought).
        - **Mild/No Crisis:** Can offer more reflective options like values exploration.
        - **NEVER** offer more than 3 intervention choices at a time.
    5.  **ADHD-Specific Validation:** Regularly include phrases that normalize the ADHD experience, e.g., "ADHD emotions can be incredibly intense. This is temporary, and you can get through it," or "Your brain is just processing a lot right now. Let's slow things down."

    **Safety Protocol:**
    - If \`CrisisLevel\` is \`IMMINENT\` (e.g., user mentions a plan to self-harm, has means), your *only* \`responseText\` must be: "It sounds like you are in immediate danger, and your safety is the most important thing. Please call or text 988 in the US and Canada, or your local emergency number, to speak with someone who can help you right away. They are available 24/7." Set \`conversationStateUpdate\` to \`HUMAN_HANDOFF\`. Do not suggest any other interventions.

    You MUST always respond with a JSON object that strictly adheres to the provided schema. Do not output any text outside of the JSON object.`;
  }
  
  // Enhance with RSD awareness
  return getRSDAwareSystemInstruction(baseInstruction, previousActivity);
};


/**
 * Enhanced AI response with orchestration and intervention intelligence
 */
export const getEnhancedAIResponse = async (
  history: Message[], 
  sessionId: string
): Promise<GeminiResponse> => {
  // Create conversation context from history
  const context = createContextFromHistory(history, sessionId);
  
  // Run orchestration checks
  const orchestrationInfo = runOrchestrationChecks(context);
  
  // Handle therapeutic ruptures first
  if (orchestrationInfo.rupture_detected.rupture_detected) {
    return handleTherapeuticRupture(orchestrationInfo.rupture_detected, context);
  }
  
  // Handle attention fade
  if (orchestrationInfo.attention_status.attention_fading) {
    return handleAttentionFade(orchestrationInfo.attention_status, context);
  }
  
  // Get AI response with orchestration context
  const baseResponse = await getAIResponse(history);
  
  // Enhance response with orchestration data
  const enhancedResponse: GeminiResponse = {
    ...baseResponse,
    orchestrationInfo,
    sessionPlan: orchestrationInfo.session_adaptations,
    interventionPlan: orchestrator.planInterventionSequence(
      baseResponse.detectedCrisisLevel,
      history[history.length - 1]?.text || '',
      context
    )
  };
  
  return enhancedResponse;
};

/**
 * Enhanced contextual AI response that leverages full layered context system
 */
export const getContextualAIResponse = async (
  history: Message[], 
  sessionId: string,
  previousActivity?: string | null
): Promise<GeminiResponse> => {
  if (!ai) {
    return getFallbackResponse();
  }
  
  const model = "gemini-2.5-flash";
  
  // Process RSD awareness
  const { rsdAnalysis, enhancedPrompt, shouldPrioritizeRSD } = processRSDAwareMessage(history, previousActivity);
  
  // Get vector-enhanced system instruction with fallback
  let enhancedSystemInstruction = '';
  try {
    enhancedSystemInstruction = await enhancedContextualManager.generateContextAwareInstruction(
      history,
      sessionId,
      previousActivity
    );
  } catch (error) {
    console.warn('Vector service unavailable, using basic instruction');
    enhancedSystemInstruction = await getSystemInstruction(history, sessionId, previousActivity);
  }
  
  // Add RSD-specific prompt if needed
  if (enhancedPrompt && shouldPrioritizeRSD) {
    enhancedSystemInstruction += '\n\n' + enhancedPrompt;
  }
  
  // Store conversation turn for future context
  const lastUserMessage = history.filter(m => m.sender === Sender.User).pop();
  if (lastUserMessage && history.length > 1) {
    const lastAiMessage = history.filter(m => m.sender === Sender.AI).pop();
    if (lastAiMessage) {
      await enhancedContextualManager.storeConversationTurn(
        lastUserMessage.text,
        lastAiMessage.text,
        sessionId,
        {
          previousActivity,
          crisisLevel: history.length > 0 ? assessCrisisLevel(lastUserMessage.text) : CrisisLevel.NONE,
          attentionStatus: history.length > 0 ? determineAttentionStatus(lastUserMessage.text, 5) : AttentionStatus.FOCUSED,
          emotionalState: 'neutral'
        }
      );
    }
  }
  
  // Format history for Gemini
  const contents = history.map(msg => ({
    role: msg.sender === Sender.User ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
            systemInstruction: enhancedSystemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText) as GeminiResponse;
    
    // Post-process response with ADHD-friendly formatting
    const formattedResponse = {
      ...parsedResponse,
      responseText: contextualConversationManager.formatADHDFriendlyResponse(
        parsedResponse.responseText,
        !parsedResponse.responseText.includes('?')
      )
    };
    
    // Enhance with RSD-specific interventions if needed
    const rsdEnhancedResponse = enhanceResponseWithRSDInterventions(formattedResponse, rsdAnalysis);
    
    // Add RSD-specific validation if appropriate
    if (rsdAnalysis.stage && rsdAnalysis.severity >= 2) {
      rsdEnhancedResponse.adhdValidation = rsdEnhancedResponse.adhdValidation || 
        `Your emotional intensity is real and valid. ADHD brains feel rejection more deeply - this is neurological, not a character flaw.`;
    }
    
    return rsdEnhancedResponse;

  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    return getFallbackResponse();
  }
};

/**
 * Original Gemini API call for baseline responses
 */
export const getAIResponse = async (history: Message[]): Promise<GeminiResponse> => {
  if (!ai) {
    return getFallbackResponse();
  }
  
  const model = "gemini-2.5-flash";
  
  // Format history for Gemini
  const contents = history.map(msg => ({
    role: msg.sender === Sender.User ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
            systemInstruction: getSystemInstruction(),
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText) as GeminiResponse;
    return parsedResponse;

  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    return getFallbackResponse();
  }
};

/**
 * Create conversation context from message history
 */
function createContextFromHistory(history: Message[], sessionId: string, previousActivity?: 'breathing' | 'grounding' | 'chat' | null): ConversationContext {
  const now = new Date();
  const sessionStart = history.length > 0 ? new Date(history[0].timestamp) : now;
  
  return {
    session_id: sessionId,
    current_state: ConversationState.GREETING,
    crisis_level: CrisisLevel.NONE,
    conversation_history: history,
    last_interaction: now,
    intervention_progress: {},
    adhd_adaptations: {
      attention_aware: true,
      micro_sessions: true,
      break_scheduled: false,
      simplified: false,
      immediate_feedback: true,
      progress_indicators: true
    },
    attention_status: 'focused',
    engagement_level: 'medium',
    session_start: sessionStart,
    total_session_time: (now.getTime() - sessionStart.getTime()) / 1000,
    previous_activity: previousActivity || null
  };
}

/**
 * Run orchestration checks on conversation context
 */
function runOrchestrationChecks(context: ConversationContext): OrchestrationInfo {
  const attentionStatus = orchestrator.detectAttentionFade(context);
  const ruptureStatus = orchestrator.detectTherapeuticRupture(
    context.conversation_history.map(msg => msg.text)
  );
  const sessionPlan = sessionManager.determineSessionLength(context, 'general');
  
  return {
    attention_status: attentionStatus,
    rupture_detected: ruptureStatus,
    session_adaptations: sessionPlan,
    micro_break_needed: attentionStatus.attention_fading && attentionStatus.severity === 'high',
    encouragement: orchestrator['generateADHDEncouragement'] ? 
      orchestrator['generateADHDEncouragement']() : undefined
  };
}

/**
 * Handle therapeutic rupture with specific repair strategies
 */
function handleTherapeuticRupture(
  rupture: { rupture_detected: boolean; types: string[]; repair_strategy?: any; severity: 'medium' | 'high' },
  context: ConversationContext
): GeminiResponse {
  const repairStrategy = rupture.repair_strategy;
  
  if (!repairStrategy) {
    return getFallbackResponse();
  }
  
  const response: GeminiResponse = {
    responseText: repairStrategy.message,
    detectedCrisisLevel: context.crisis_level,
    conversationStateUpdate: ConversationState.CRISIS_ASSESSMENT,
    suggestedInterventions: repairStrategy.options ? 
      repairStrategy.options.map((option: string) => ({
        name: option,
        type: 'Support',
        duration: '1 minute',
        description: 'A way to feel more supported right now'
      })) : [],
    isRuptureRepair: true,
    isAttentionAccommodation: false
  };
  
  return response;
}

/**
 * Handle attention fade with ADHD-appropriate responses
 */
function handleAttentionFade(
  attentionStatus: { attention_fading: boolean; indicators: string[]; severity: 'low' | 'medium' | 'high' },
  context: ConversationContext
): GeminiResponse {
  if (attentionStatus.severity === 'high') {
    return {
      responseText: "I can tell your attention might be wandering - that's totally normal with ADHD! Let's take a quick break or try something really short. What sounds better?",
      detectedCrisisLevel: context.crisis_level,
      conversationStateUpdate: ConversationState.MICRO_BREAK,
      suggestedInterventions: [
        {
          name: '30-second breathing break',
          type: 'Breathing',
          duration: '30 seconds',
          description: 'Just three deep breaths'
        },
        {
          name: '1-minute grounding',
          type: 'Grounding',
          duration: '1 minute',
          description: 'Quick sensory check-in'
        },
        {
          name: 'Just chat',
          type: 'Conversation',
          duration: 'Open',
          description: 'No structure, just talk'
        }
      ],
      isRuptureRepair: false,
      isAttentionAccommodation: true,
      adhdValidation: "Your ADHD brain has been working hard. It's okay to need a break."
    };
  }
  
  return {
    responseText: "You're doing great! I notice we've been going for a bit. Would you like to keep going or take a quick break?",
    detectedCrisisLevel: context.crisis_level,
    conversationStateUpdate: ConversationState.INTERVENTION_CHOICE,
    suggestedInterventions: [
      {
        name: 'Keep going',
        type: 'Continue',
        duration: 'Ongoing',
        description: 'Continue with current approach'
      },
      {
        name: 'Quick break',
        type: 'Break',
        duration: '1 minute',
        description: 'Short pause to recharge'
      }
    ],
    isRuptureRepair: false,
    isAttentionAccommodation: true
  };
}

/**
 * Main de-escalation conversation function - provides structured crisis intervention
 */
export const getDeescalationResponse = async (
  history: Message[], 
  sessionId: string,
  deescalationState?: DeescalationState
): Promise<GeminiResponse & { deescalationState: DeescalationState }> => {
  const context = createContextFromHistory(history, sessionId);
  const userMessage = history[history.length - 1]?.text || '';
  
  // Initialize or continue de-escalation state
  const currentState = deescalationState || initializeDeescalationState();
  
  // Get current step
  const currentSteps = deescalationService.getStepsForPhase(currentState.currentPhase);
  const currentStep = currentSteps.find(step => step.id === currentState.currentStepId) || currentSteps[0];
  
  if (!currentStep) {
    return {
      ...getFallbackResponse(),
      deescalationState: currentState
    };
  }
  
  // Assess step effectiveness based on user response
  let stepEffectiveness = 5; // baseline
  let userEngagement = 5;
  let currentStressLevel = currentState.stressLevel;
  
  if (history.length > 1) {
    stepEffectiveness = deescalationService.assessStepEffectiveness(
      userMessage, 
      currentStep, 
      currentState
    );
    
    // Update engagement and stress based on response
    userEngagement = assessUserEngagement(userMessage, history);
    currentStressLevel = assessStressLevel(userMessage, currentState.stressLevel);
  }
  
  // Update progress
  const updatedProgress = deescalationService.createProgressUpdate(
    currentState,
    stepEffectiveness,
    userEngagement,
    currentStressLevel
  );
  
  // Determine attention status for adaptations
  const attentionStatus = determineAttentionStatus(userMessage, userEngagement);
  
  // Generate contextual prompt
  const prompt = deescalationService.generateContextualPrompt(
    currentStep,
    userMessage,
    updatedProgress,
    attentionStatus
  );
  
  // Determine next phase if needed
  const nextPhase = deescalationService.determineNextPhase(
    currentState.currentPhase,
    updatedProgress,
    assessCrisisLevel(userMessage)
  );
  
  // Prepare next step or phase transition
  let nextStepId = currentState.currentStepId;
  if (nextPhase !== currentState.currentPhase) {
    const nextPhaseSteps = deescalationService.getStepsForPhase(nextPhase);
    nextStepId = nextPhaseSteps[0]?.id || currentState.currentStepId;
  } else {
    // Progress within current phase
    const currentStepIndex = currentSteps.findIndex(step => step.id === currentState.currentStepId);
    if (stepEffectiveness >= 7 && currentStepIndex < currentSteps.length - 1) {
      nextStepId = currentSteps[currentStepIndex + 1].id;
    }
  }
  
  // Create updated de-escalation state
  const newDeescalationState: DeescalationState = {
    ...updatedProgress,
    currentPhase: nextPhase,
    currentStepId: nextStepId,
    phaseStartTime: nextPhase !== currentState.currentPhase ? new Date() : currentState.phaseStartTime,
    conversationFlow: {
      stepHistory: [...currentState.conversationFlow.stepHistory, currentState.currentStepId],
      effectivenessScores: [...currentState.conversationFlow.effectivenessScores, stepEffectiveness],
      adaptationsMade: attentionStatus === AttentionStatus.FADING ? 
        [...currentState.conversationFlow.adaptationsMade, 'attention_fade_adaptation'] :
        currentState.conversationFlow.adaptationsMade
    }
  };
  
  // Generate suggested interventions based on current phase
  const suggestedInterventions = generatePhaseAppropriateInterventions(
    nextPhase, 
    assessCrisisLevel(userMessage),
    attentionStatus
  );
  
  // Build response
  const response: GeminiResponse = {
    responseText: prompt,
    detectedCrisisLevel: assessCrisisLevel(userMessage),
    conversationStateUpdate: mapPhaseToConversationState(nextPhase),
    suggestedInterventions,
    isRuptureRepair: stepEffectiveness < 4,
    isAttentionAccommodation: attentionStatus === AttentionStatus.FADING,
    adhdValidation: generateADHDValidation(currentStep, updatedProgress),
    orchestrationInfo: createEnhancedOrchestrationInfo(newDeescalationState, currentStep)
  };
  
  return {
    ...response,
    deescalationState: newDeescalationState
  };
};

/**
 * Initialize a new de-escalation state
 */
function initializeDeescalationState(): DeescalationState {
  return {
    isActive: true,
    currentPhase: 'safety',
    currentStepId: 'safety-1',
    phaseStartTime: new Date(),
    totalProgress: 0,
    stressLevel: 8, // Start with high stress assumption
    engagementLevel: 5,
    completedTechniques: [],
    breakthroughMoments: [],
    conversationFlow: {
      stepHistory: [],
      effectivenessScores: [],
      adaptationsMade: []
    }
  };
}

/**
 * Assess user engagement from their message
 */
function assessUserEngagement(message: string, history: Message[]): number {
  let engagement = 5;
  
  // Length indicators
  if (message.length < 10) engagement -= 2;
  else if (message.length > 50) engagement += 1;
  
  // Content indicators
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('thanks') || lowerMessage.includes('help')) engagement += 2;
  if (lowerMessage.includes('yeah') || lowerMessage.includes('ok') || lowerMessage.includes('idk')) engagement -= 1;
  if (lowerMessage.includes('whatever') || lowerMessage.includes('fine')) engagement -= 3;
  
  // Question indicators (shows engagement)
  if (message.includes('?')) engagement += 1;
  
  return Math.max(1, Math.min(10, engagement));
}

/**
 * Assess stress level from user message
 */
function assessStressLevel(message: string, previousLevel: number): number {
  const lowerMessage = message.toLowerCase();
  let adjustment = 0;
  
  // Positive indicators (stress decreasing)
  if (lowerMessage.includes('better') || lowerMessage.includes('calmer') || lowerMessage.includes('helps')) {
    adjustment = -1;
  }
  
  // Negative indicators (stress increasing)
  if (lowerMessage.includes('worse') || lowerMessage.includes('can\'t') || lowerMessage.includes('overwhelming')) {
    adjustment = 1;
  }
  
  // Crisis indicators
  if (lowerMessage.includes('hurt') || lowerMessage.includes('end') || lowerMessage.includes('pointless')) {
    adjustment = 2;
  }
  
  return Math.max(1, Math.min(10, previousLevel + adjustment));
}

/**
 * Determine attention status from user engagement
 */
function determineAttentionStatus(message: string, engagement: number): AttentionStatus {
  if (engagement <= 3 || message.length < 5) {
    return AttentionStatus.FADING;
  }
  if (engagement >= 8 && message.length > 100) {
    return AttentionStatus.HYPERFOCUSED;
  }
  return AttentionStatus.FOCUSED;
}

/**
 * Assess crisis level from message content
 */
function assessCrisisLevel(message: string): CrisisLevel {
  const lowerMessage = message.toLowerCase();
  
  // Imminent risk indicators
  if (lowerMessage.includes('kill myself') || lowerMessage.includes('end it') || 
      lowerMessage.includes('not worth living') || lowerMessage.includes('plan to')) {
    return CrisisLevel.IMMINENT;
  }
  
  // Severe crisis indicators
  if (lowerMessage.includes('hurt myself') || lowerMessage.includes('can\'t go on') ||
      lowerMessage.includes('no point') || lowerMessage.includes('hopeless')) {
    return CrisisLevel.SEVERE;
  }
  
  // Moderate crisis indicators
  if (lowerMessage.includes('overwhelming') || lowerMessage.includes('can\'t handle') ||
      lowerMessage.includes('breaking down') || lowerMessage.includes('too much')) {
    return CrisisLevel.MODERATE;
  }
  
  // Mild crisis indicators
  if (lowerMessage.includes('stressed') || lowerMessage.includes('anxious') ||
      lowerMessage.includes('struggling') || lowerMessage.includes('difficult')) {
    return CrisisLevel.MILD;
  }
  
  return CrisisLevel.NONE;
}

/**
 * Generate interventions appropriate for current phase
 */
function generatePhaseAppropriateInterventions(
  phase: string, 
  crisisLevel: CrisisLevel,
  attentionStatus: AttentionStatus
): any[] {
  const interventions = [];
  
  switch (phase) {
    case 'safety':
      interventions.push(
        {
          name: 'Safety check-in',
          type: 'Safety',
          duration: '1 minute',
          description: 'Confirm you\'re in a safe space'
        },
        {
          name: 'Simple breathing',
          type: 'Breathing',
          duration: '30 seconds',
          description: 'Three slow, deep breaths'
        }
      );
      break;
      
    case 'validation':
      interventions.push(
        {
          name: 'Feeling validation',
          type: 'Emotional',
          duration: '2 minutes',
          description: 'Acknowledge what you\'re experiencing'
        },
        {
          name: 'ADHD normalization',
          type: 'Educational',
          duration: '1 minute',
          description: 'Understanding ADHD emotional intensity'
        }
      );
      break;
      
    case 'cognitive':
      interventions.push(
        {
          name: 'Thought observation',
          type: 'Cognitive',
          duration: '3 minutes',
          description: 'Notice thoughts without judgment'
        },
        {
          name: 'Perspective taking',
          type: 'Cognitive',
          duration: '2 minutes',
          description: 'Consider alternative viewpoints'
        }
      );
      break;
      
    case 'skills':
      if (attentionStatus === AttentionStatus.FADING) {
        interventions.push(
          {
            name: 'Quick grounding',
            type: 'Grounding',
            duration: '1 minute',
            description: '5-4-3-2-1 sensory technique'
          }
        );
      } else {
        interventions.push(
          {
            name: 'TIPP technique',
            type: 'DBT',
            duration: '5 minutes',
            description: 'Temperature, Intense exercise, Paced breathing, Paired muscle relaxation'
          },
          {
            name: 'RAIN method',
            type: 'Mindfulness',
            duration: '4 minutes',
            description: 'Recognize, Allow, Investigate, Natural awareness'
          }
        );
      }
      break;
      
    case 'planning':
      interventions.push(
        {
          name: 'Next steps planning',
          type: 'Planning',
          duration: '5 minutes',
          description: 'Create concrete action steps'
        },
        {
          name: 'Resource connections',
          type: 'Support',
          duration: '3 minutes',
          description: 'Identify support people and resources'
        }
      );
      break;
  }
  
  return interventions;
}

/**
 * Map de-escalation phase to conversation state
 */
function mapPhaseToConversationState(phase: string): ConversationState {
  switch (phase) {
    case 'safety':
      return ConversationState.CRISIS_ASSESSMENT;
    case 'validation':
      return ConversationState.CRISIS_ASSESSMENT;
    case 'cognitive':
      return ConversationState.GUIDED_INTERVENTION;
    case 'skills':
      return ConversationState.GUIDED_INTERVENTION;
    case 'planning':
      return ConversationState.SAFETY_PLANNING;
    default:
      return ConversationState.CRISIS_ASSESSMENT;
  }
}

/**
 * Generate ADHD-specific validation message
 */
function generateADHDValidation(step: DeescalationStep, progress: DeescalationProgress): string {
  const validations = [
    "ADHD brains feel emotions more intensely - what you're experiencing is real and valid.",
    "Your ADHD brain is working extra hard right now. You're doing the best you can.",
    "Emotional overwhelm with ADHD is exhausting. You're showing real strength by reaching out.",
    "ADHD makes everything feel more urgent and intense. Let's slow this down together.",
    "Your ADHD brain processes things differently, and that includes stress. This will pass."
  ];
  
  return validations[Math.floor(Math.random() * validations.length)];
}

/**
 * Create enhanced orchestration info with de-escalation data
 */
function createEnhancedOrchestrationInfo(
  deescalationState: DeescalationState,
  currentStep: DeescalationStep
): EnhancedOrchestrationInfo {
  return {
    attention_status: {
      attention_fading: deescalationState.engagementLevel < 4,
      indicators: ['Low engagement detected'],
      severity: deescalationState.engagementLevel < 3 ? 'high' : 'low'
    },
    rupture_detected: {
      rupture_detected: deescalationState.conversationFlow.effectivenessScores.slice(-2).every(score => score < 4),
      types: ['Low effectiveness'],
      severity: 'medium'
    },
    session_adaptations: {
      session_type: deescalationState.engagementLevel < 4 ? 'micro' : 'short',
      duration_minutes: deescalationState.engagementLevel < 4 ? 3 : 8,
      reasoning: 'Adapted for current engagement and attention levels',
      break_scheduled: deescalationState.engagementLevel < 4
    },
    micro_break_needed: deescalationState.engagementLevel < 3,
    encouragement: `You're in the ${deescalationState.currentPhase} phase and making progress.`,
    
    // De-escalation specific fields
    deescalationPhase: deescalationState.currentPhase,
    currentStep: deescalationState.currentStepId,
    phaseProgress: deescalationState.totalProgress,
    stressLevel: deescalationState.stressLevel,
    engagementLevel: deescalationState.engagementLevel,
    conversationQuality: {
      therapeuticRapport: Math.max(1, deescalationState.engagementLevel),
      userSafety: Math.max(1, 11 - deescalationState.stressLevel),
      progressTowardStability: Math.min(10, deescalationState.totalProgress / 10)
    }
  };
}

/**
 * Get fallback response for error cases
 */
function getFallbackResponse(): GeminiResponse {
  return {
    responseText: "I'm having a little trouble connecting right now. Please know your well-being is important. If you are in a crisis, please call or text 988 immediately.",
    detectedCrisisLevel: CrisisLevel.NONE,
    conversationStateUpdate: ConversationState.COMPLETION,
    suggestedInterventions: [],
    isRuptureRepair: false,
    isAttentionAccommodation: false
  };
}

import { GoogleGenAI, Type } from "@google/genai";
import { Message, Sender } from '../types';

// RSD Structured Chat Service - handles structured RSD conversations
// Only engages LLM for summarization, uses predefined flows otherwise

// @ts-ignore - Vite environment variables
const API_KEY = import.meta.env?.VITE_GEMINI_API_KEY;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export interface RSDStage {
  id: string;
  name: string;
  description: string;
  questions: string[];
  responses: string[];
  nextStage?: string | null;
}

export interface RSDConversationState {
  currentStage: string;
  stageProgress: number;
  completedStages: string[];
  userResponses: { [stageId: string]: string[] };
  detectedTriggers: string[];
  intensity: number; // 1-10
  needsSummary: boolean;
}

// Structured RSD conversation flow
const RSD_STAGES: { [key: string]: RSDStage } = {
  trigger_identification: {
    id: 'trigger_identification',
    name: 'Understanding the Trigger',
    description: 'Let\'s identify what triggered this RSD response',
    questions: [
      "What happened right before you started feeling this way?",
      "Was there a specific interaction, message, or situation?",
      "On a scale of 1-10, how intense does this feel right now?"
    ],
    responses: [
      "I hear you. RSD can make any perceived rejection feel overwhelming.",
      "That sounds really difficult. Your feelings are completely valid.",
      "Thank you for sharing that with me. Let's work through this together."
    ],
    nextStage: 'reality_check'
  },
  
  reality_check: {
    id: 'reality_check',
    name: 'Gentle Reality Check',
    description: 'Examining the situation with ADHD brain awareness',
    questions: [
      "If a close friend told you this exact situation, what would you tell them?",
      "What are some other possible explanations for what happened?",
      "Is this feeling familiar? Have you felt this way before in similar situations?"
    ],
    responses: [
      "ADHD brains are wired to notice rejection more intensely. This isn't a flaw.",
      "Your brain is trying to protect you, even if it's being a bit overprotective right now.",
      "It's okay to question these intense feelings. That takes real courage."
    ],
    nextStage: 'self_compassion'
  },
  
  self_compassion: {
    id: 'self_compassion',
    name: 'Self-Compassion & Validation',
    description: 'Building self-compassion for the ADHD experience',
    questions: [
      "What would you say to comfort a friend going through this exact same thing?",
      "Can you acknowledge that your ADHD brain experiences rejection differently?",
      "What's one kind thing you can tell yourself right now?"
    ],
    responses: [
      "You deserve the same kindness you'd give a friend.",
      "Your sensitivity isn't weakness - it's part of how your brain works.",
      "You're being so brave by working through this with me."
    ],
    nextStage: 'action_planning'
  },
  
  action_planning: {
    id: 'action_planning',
    name: 'Moving Forward',
    description: 'Creating a concrete plan for next steps',
    questions: [
      "What's one small thing you can do to take care of yourself right now?",
      "Is there anything you want to clarify or address about the original situation?",
      "How will you remind yourself of what we talked about when this feeling comes up again?"
    ],
    responses: [
      "Having a plan can help your ADHD brain feel more in control.",
      "You've done the hard work of examining this feeling. That's huge.",
      "Remember, you can always come back and talk through RSD episodes."
    ],
    nextStage: null
  }
};

const summarySchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief, compassionate summary of the user's RSD episode and progress through the structured conversation" },
    keyInsights: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "2-3 key insights or breakthroughs from the conversation"
    },
    suggestedReminders: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "1-2 gentle reminders the user can reference later"
    },
    intensityChange: { type: Type.STRING, description: "How the emotional intensity changed during the conversation" }
  },
  required: ["summary", "keyInsights", "suggestedReminders", "intensityChange"]
};

export class StructuredRSDChat {
  
  static initializeRSDConversation(): RSDConversationState {
    return {
      currentStage: 'trigger_identification',
      stageProgress: 0,
      completedStages: [],
      userResponses: {},
      detectedTriggers: [],
      intensity: 8, // Start high as RSD is typically intense
      needsSummary: false
    };
  }
  
  static getStagePrompt(state: RSDConversationState): Message {
    const stage = RSD_STAGES[state.currentStage];
    const questionIndex = state.stageProgress;
    
    if (!stage || questionIndex >= stage.questions.length) {
      return {
        id: crypto.randomUUID(),
        sender: Sender.AI,
        text: "I think we've covered everything for this stage. Let me summarize what we've discussed.",
        timestamp: new Date().toISOString()
      };
    }
    
    const question = stage.questions[questionIndex];
    const stageInfo = questionIndex === 0 ? `\n\n*${stage.name}: ${stage.description}*` : '';
    
    return {
      id: crypto.randomUUID(),
      sender: Sender.AI,
      text: `${question}${stageInfo}`,
      timestamp: new Date().toISOString()
    };
  }
  
  static processUserResponse(userMessage: string, state: RSDConversationState): {
    updatedState: RSDConversationState;
    aiResponse: Message;
    needsLLMSummary: boolean;
  } {
    const stage = RSD_STAGES[state.currentStage];
    
    if (!stage) {
      return {
        updatedState: state,
        aiResponse: {
          id: crypto.randomUUID(),
          sender: Sender.AI,
          text: "Let me summarize our conversation.",
          timestamp: new Date().toISOString()
        },
        needsLLMSummary: true
      };
    }
    
    // Store user response
    const updatedResponses = { ...state.userResponses };
    if (!updatedResponses[state.currentStage]) {
      updatedResponses[state.currentStage] = [];
    }
    updatedResponses[state.currentStage].push(userMessage);
    
    // Get appropriate response
    const responseIndex = Math.min(state.stageProgress, stage.responses.length - 1);
    const response = stage.responses[responseIndex];
    
    // Progress to next question or stage
    let newStageProgress = state.stageProgress + 1;
    let newCurrentStage = state.currentStage;
    let newCompletedStages = state.completedStages;
    let needsLLMSummary = false;
    
    if (newStageProgress >= stage.questions.length) {
      // Completed this stage
      newCompletedStages = [...state.completedStages, state.currentStage];
      
      if (stage.nextStage) {
        newCurrentStage = stage.nextStage;
        newStageProgress = 0;
      } else {
        // Completed all stages - need summary
        needsLLMSummary = true;
      }
    }
    
    const updatedState: RSDConversationState = {
      ...state,
      currentStage: newCurrentStage,
      stageProgress: newStageProgress,
      completedStages: newCompletedStages,
      userResponses: updatedResponses,
      needsSummary: needsLLMSummary
    };
    
    const aiResponse: Message = {
      id: crypto.randomUUID(),
      sender: Sender.AI,
      text: response,
      timestamp: new Date().toISOString()
    };
    
    return {
      updatedState,
      aiResponse,
      needsLLMSummary
    };
  }
  
  static async generateSummary(state: RSDConversationState): Promise<Message> {
    if (!ai) {
      return {
        id: crypto.randomUUID(),
        sender: Sender.AI,
        text: "Thank you for working through this RSD episode with me. You showed real courage in examining these intense feelings. Remember, your ADHD brain experiences rejection differently, and that's not a flaw - it's just how you're wired. You have tools now to work through these moments.",
        timestamp: new Date().toISOString()
      };
    }
    
    // Compile conversation for summary
    const conversationText = Object.entries(state.userResponses)
      .map(([stageId, responses]) => {
        const stage = RSD_STAGES[stageId];
        return `${stage.name}:\n${responses.join('\n')}`;
      })
      .join('\n\n');
    
    const systemInstruction = `You are Helen, providing a compassionate summary of an RSD (Rejection Sensitive Dysphoria) conversation. The user just completed a structured conversation about an RSD episode. Your job is to:

1. Provide a brief, validating summary
2. Highlight key insights or breakthroughs
3. Offer gentle reminders they can use later
4. Acknowledge their courage in working through this

Be warm, validating, and ADHD-aware. Focus on their strengths and progress.`;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          role: 'user',
          parts: [{ text: `Please summarize this RSD conversation:\n\n${conversationText}` }]
        }],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: summarySchema
        }
      });
      
      const jsonText = response.text.trim();
      const summary = JSON.parse(jsonText);
      
      const summaryText = [
        summary.summary,
        '',
        '**Key Insights:**',
        ...summary.keyInsights.map((insight: string) => `• ${insight}`),
        '',
        '**Gentle Reminders:**',
        ...summary.suggestedReminders.map((reminder: string) => `• ${reminder}`),
        '',
        `**Progress:** ${summary.intensityChange}`
      ].join('\n');
      
      return {
        id: crypto.randomUUID(),
        sender: Sender.AI,
        text: summaryText,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error generating RSD summary:', error);
      return {
        id: crypto.randomUUID(),
        sender: Sender.AI,
        text: "Thank you for working through this RSD episode with me. You showed real courage in examining these intense feelings and questioning the stories your brain was telling you. Remember: your ADHD brain experiences rejection more intensely, and that's neurological, not a character flaw. You have the tools now to recognize and work through these episodes. I'm proud of the work you did today.",
        timestamp: new Date().toISOString()
      };
    }
  }
  
  static getNextPrompt(state: RSDConversationState): Message | null {
    if (state.needsSummary) {
      return null; // Summary should be generated
    }
    
    return this.getStagePrompt(state);
  }
  
  static isRSDConversationComplete(state: RSDConversationState): boolean {
    return state.needsSummary || state.completedStages.length === Object.keys(RSD_STAGES).length;
  }
}
/**
 * Vector Retrieval Service
 * TypeScript client for interfacing with Supabase pgvector
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Message, ConversationContext, CrisisLevel, AttentionStatus } from '../types';

export interface VectorQuery {
  query_text: string;
  collection_name?: string;
  n_results?: number;
  filters?: Record<string, any>;
}

export interface VectorDocument {
  documents: string[];
  metadatas?: Record<string, any>[];
  ids?: string[];
  collection_name?: string;
}

export interface RetrievalResult {
  documents: string[];
  ids: string[];
  distances: number[];
  metadatas: Record<string, any>[];
  query_context: Record<string, any>;
}

export interface ConversationStorage {
  user_message: string;
  ai_response: string;
  session_id: string;
  previous_activity?: string | null;
  crisis_level?: string;
  attention_status?: string;
  emotional_state?: string;
  timestamp?: string;
}

export interface ADHDContextRetrieval {
  query: string;
  retrieved_contexts: Record<string, {
    documents: string[];
    metadatas: Record<string, any>[];
    distances: number[];
  }>;
  synthesis: {
    total_contexts_found: number;
    best_match_collection: string | null;
    attention_adaptations_needed: boolean;
    crisis_context_available: boolean;
    timestamp: string;
  };
}

export class VectorRetrievalService {
  private supabase: SupabaseClient | null = null;
  private isServiceHealthy: boolean = false;

  constructor() {
    this.initializeSupabase();
  }

  private initializeSupabase() {
    const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
    const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
      this.isServiceHealthy = true;
    } else {
      console.warn('Supabase credentials not found. Vector search will be disabled.');
      this.isServiceHealthy = false;
    }
  }

  /**
   * Check if the retrieval service is healthy
   */
  async checkHealth(): Promise<boolean> {
    if (!this.supabase) {
      return false;
    }
    
    try {
      // Simple health check by querying supabase
      const { error } = await this.supabase.from('conversations').select('count').limit(1);
      this.isServiceHealthy = !error;
      return this.isServiceHealthy;
    } catch (error) {
      console.warn('Supabase vector service not available:', error);
      this.isServiceHealthy = false;
      return false;
    }
  }

  /**
   * Retrieve semantically similar contexts using Supabase pgvector
   */
  async retrieveContext(query: VectorQuery): Promise<RetrievalResult | null> {
    if (!this.isServiceHealthy || !this.supabase) {
      console.warn('Supabase vector service unavailable, skipping retrieval');
      return null;
    }

    try {
      // Use Supabase Edge Function for similarity search
      const { data, error } = await this.supabase.functions.invoke('vector-search', {
        body: {
          query_text: query.query_text,
          collection_name: query.collection_name || 'conversations',
          match_count: query.n_results || 5,
          filters: query.filters
        }
      });

      if (error) {
        throw error;
      }

      // Transform response to match expected format
      return {
        documents: data?.documents || [],
        ids: data?.ids || [],
        distances: data?.distances || [],
        metadatas: data?.metadatas || [],
        query_context: data?.query_context || {}
      };
    } catch (error) {
      console.error('Supabase vector retrieval error:', error);
      return null;
    }
  }

  /**
   * Add new context to the vector store using Supabase
   */
  async addContext(document: VectorDocument): Promise<boolean> {
    if (!this.isServiceHealthy || !this.supabase) {
      console.warn('Supabase vector service unavailable, skipping storage');
      return false;
    }

    try {
      // Use Supabase Edge Function to add context with automatic embedding
      const { error } = await this.supabase.functions.invoke('add-context', {
        body: {
          documents: document.documents,
          metadatas: document.metadatas,
          ids: document.ids,
          collection_name: document.collection_name || 'therapeutic_knowledge'
        }
      });

      return !error;
    } catch (error) {
      console.error('Supabase context storage error:', error);
      return false;
    }
  }

  /**
   * Store a conversation turn for future retrieval
   */
  async storeConversation(context: ConversationStorage): Promise<boolean> {
    if (!this.isServiceHealthy || !this.supabase) {
      return false;
    }

    try {
      const { error } = await this.supabase
        .from('conversations')
        .insert({
          user_message: context.user_message,
          ai_response: context.ai_response,
          session_id: context.session_id,
          previous_activity: context.previous_activity,
          crisis_level: context.crisis_level,
          attention_status: context.attention_status,
          emotional_state: context.emotional_state,
          created_at: context.timestamp || new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Supabase conversation storage error:', error);
      return false;
    }
  }

  /**
   * Specialized ADHD context retrieval using Supabase
   */
  async retrieveADHDContext(
    queryText: string,
    userPatterns?: Record<string, any>,
    sessionContext?: Record<string, any>
  ): Promise<ADHDContextRetrieval | null> {
    if (!this.isServiceHealthy || !this.supabase) {
      return null;
    }

    try {
      // Use Supabase Edge Function for ADHD-specific context retrieval
      const { data, error } = await this.supabase.functions.invoke('adhd-context-search', {
        body: {
          query_text: queryText,
          user_patterns: userPatterns,
          session_context: sessionContext
        }
      });

      if (error) {
        throw error;
      }

      return data as ADHDContextRetrieval;
    } catch (error) {
      console.error('Supabase ADHD context retrieval error:', error);
      return null;
    }
  }

  /**
   * Get available collections and their stats from Supabase
   */
  async getCollections(): Promise<any> {
    if (!this.isServiceHealthy || !this.supabase) {
      return { collections: [] };
    }

    try {
      // Query the conversations table to get collection stats
      const { data, error } = await this.supabase
        .from('conversations')
        .select('session_id, crisis_level, attention_status')
        .limit(100);
        
      if (error) {
        throw error;
      }
      
      return {
        collections: [
          {
            name: 'conversations',
            count: data?.length || 0,
            description: 'Stored therapeutic conversations'
          }
        ]
      };
    } catch (error) {
      console.error('Supabase collections fetch error:', error);
      return { collections: [] };
    }
  }
}

/**
 * Enhanced Contextual Conversation Manager with Vector Retrieval
 */
export class EnhancedContextualManager {
  private vectorService: VectorRetrievalService;

  constructor() {
    this.vectorService = new VectorRetrievalService();
  }

  /**
   * Generate contextually-aware system instruction using vector retrieval
   */
  async generateContextAwareInstruction(
    history: Message[],
    sessionId: string,
    previousActivity?: string | null
  ): Promise<string> {
    if (history.length === 0) {
      return this.getBaseSystemInstruction();
    }

    const lastUserMessage = history.filter(m => m.sender === 'user').pop();
    if (!lastUserMessage) {
      return this.getBaseSystemInstruction();
    }

    // Retrieve relevant contexts
    const userPatterns = this.extractUserPatterns(history);
    const adhdContext = await this.vectorService.retrieveADHDContext(
      lastUserMessage.text,
      userPatterns,
      { session_id: sessionId, previous_activity: previousActivity }
    );

    // Build enhanced instruction with retrieved context
    let instruction = this.getBaseSystemInstruction();

    if (adhdContext && adhdContext.synthesis.total_contexts_found > 0) {
      instruction += this.buildContextualEnhancements(adhdContext, userPatterns, previousActivity);
    }

    return instruction;
  }

  /**
   * Store conversation turn in vector database
   */
  async storeConversationTurn(
    userMessage: string,
    aiResponse: string,
    sessionId: string,
    context: {
      previousActivity?: string | null;
      crisisLevel?: CrisisLevel;
      attentionStatus?: AttentionStatus;
      emotionalState?: string;
    }
  ): Promise<void> {
    const conversationData: ConversationStorage = {
      user_message: userMessage,
      ai_response: aiResponse,
      session_id: sessionId,
      previous_activity: context.previousActivity,
      crisis_level: context.crisisLevel || 'none',
      attention_status: context.attentionStatus || 'focused',
      emotional_state: context.emotionalState || 'neutral',
      timestamp: new Date().toISOString(),
    };

    await this.vectorService.storeConversation(conversationData);
  }

  /**
   * Retrieve relevant therapeutic responses for current context
   */
  async getTherapeuticContext(
    userMessage: string,
    currentState: {
      crisisLevel: CrisisLevel;
      attentionStatus: AttentionStatus;
      emotionalState: string;
    }
  ): Promise<string[]> {
    const context = await this.vectorService.retrieveContext({
      query_text: userMessage,
      collection_name: 'therapeutic_responses',
      n_results: 3,
      filters: {
        crisis_level: currentState.crisisLevel,
        attention_status: currentState.attentionStatus,
      },
    });

    return context?.documents || [];
  }

  /**
   * Get relevant intervention suggestions using Supabase
   */
  async getInterventionSuggestions(
    userMessage: string,
    userPatterns: Record<string, any>
  ): Promise<string[]> {
    const context = await this.vectorService.retrieveContext({
      query_text: userMessage,
      collection_name: 'intervention_library',
      n_results: 5,
      filters: {
        attention_status: userPatterns.attention_status,
        crisis_level: userPatterns.crisis_level,
      },
    });

    return context?.documents || [];
  }

  /**
   * Extract user patterns from conversation history
   */
  private extractUserPatterns(history: Message[]): Record<string, any> {
    const recentMessages = history.slice(-5);
    const userMessages = recentMessages.filter(m => m.sender === 'user');
    
    if (userMessages.length === 0) {
      return {};
    }

    const avgLength = userMessages.reduce((sum, m) => sum + m.text.length, 0) / userMessages.length;
    const lastMessage = userMessages[userMessages.length - 1];
    
    // Analyze patterns
    const patterns = {
      attention_status: this.detectAttentionStatus(userMessages),
      crisis_level: this.detectCrisisLevel(lastMessage.text),
      emotional_state: this.detectEmotionalState(lastMessage.text),
      engagement_level: avgLength > 50 ? 'high' : avgLength > 20 ? 'medium' : 'low',
      message_frequency: userMessages.length,
      avg_message_length: avgLength,
    };

    return patterns;
  }

  private detectAttentionStatus(messages: Message[]): string {
    const recentText = messages.slice(-2).map(m => m.text.toLowerCase()).join(' ');
    
    if (recentText.includes('idk') || recentText.includes('whatever') || recentText.includes('ok')) {
      return 'fading';
    }
    
    const lengths = messages.map(m => m.text.length);
    if (lengths.length > 1 && lengths.every(l => l < 5)) {
      return 'lost';
    }
    
    return 'focused';
  }

  private detectCrisisLevel(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Crisis level detection logic
    if (lowerMessage.includes('kill myself') || lowerMessage.includes('end it')) {
      return 'imminent';
    }
    if (lowerMessage.includes('hurt myself') || lowerMessage.includes('hopeless')) {
      return 'severe';
    }
    if (lowerMessage.includes('overwhelming') || lowerMessage.includes('can\'t handle')) {
      return 'moderate';
    }
    if (lowerMessage.includes('stressed') || lowerMessage.includes('anxious')) {
      return 'mild';
    }
    
    return 'none';
  }

  private detectEmotionalState(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('overwhelmed') || lowerMessage.includes('too much')) {
      return 'overwhelmed';
    }
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
      return 'anxious';
    }
    if (lowerMessage.includes('calm') || lowerMessage.includes('better')) {
      return 'calm';
    }
    
    return 'neutral';
  }

  private buildContextualEnhancements(
    adhdContext: ADHDContextRetrieval,
    userPatterns: Record<string, any>,
    previousActivity?: string | null
  ): string {
    let enhancements = '\n\n**CONTEXTUAL INTELLIGENCE:**\n';
    
    // Previous activity context
    if (previousActivity) {
      enhancements += `✅ User completed ${previousActivity} activity - acknowledge warmly and skip basic stabilization\n`;
    }
    
    // Attention adaptations
    if (userPatterns.attention_status === 'fading') {
      enhancements += '⚠️ Attention fading detected - use shorter responses and micro-breaks\n';
    }
    
    // Crisis context
    if (adhdContext.synthesis.crisis_context_available) {
      enhancements += '🚨 Crisis context available in memory - be extra attentive to safety\n';
    }
    
    // Retrieved contexts summary
    if (adhdContext.synthesis.total_contexts_found > 0) {
      enhancements += `🔍 Found ${adhdContext.synthesis.total_contexts_found} relevant contexts from previous interactions\n`;
      enhancements += `📚 Best matches from: ${adhdContext.synthesis.best_match_collection}\n`;
    }
    
    // Add specific context snippets
    const contextSnippets = this.extractRelevantSnippets(adhdContext);
    if (contextSnippets.length > 0) {
      enhancements += '\n**RELEVANT CONTEXT SNIPPETS:**\n';
      contextSnippets.forEach((snippet, index) => {
        enhancements += `${index + 1}. ${snippet}\n`;
      });
    }
    
    return enhancements;
  }

  private extractRelevantSnippets(adhdContext: ADHDContextRetrieval): string[] {
    const snippets: string[] = [];
    
    // Extract key snippets from each collection
    Object.entries(adhdContext.retrieved_contexts).forEach(([collectionName, results]) => {
      if (results.documents.length > 0) {
        // Take the most relevant document from each collection
        const topDoc = results.documents[0];
        if (topDoc && topDoc.length < 200) { // Keep snippets reasonably short
          snippets.push(`From ${collectionName}: "${topDoc.substring(0, 150)}..."`);
        }
      }
    });
    
    return snippets.slice(0, 3); // Limit to 3 most relevant snippets
  }

  private getBaseSystemInstruction(): string {
    return `You are Helen, a calm, steady companion designed to support users managing ADHD. Your tone is neutral, your goal is clarity and grounding, and your value lies in making the next step feel possible—never perfect.

**Core Approach:**
- Use short sentences under 15 words
- Structure responses with numbered steps, bullets, emojis for clarity  
- Check in frequently: "Would you like to pause or keep going?"
- When overwhelmed: "Let's slow this way down"
- Maximum 2 actionable steps per response

**ADHD-Specific Validation:**
- "ADHD brains feel emotions more intensely - what you're experiencing is real and valid"  
- "Your ADHD brain is working extra hard right now. You're doing the best you can"
- "ADHD makes everything feel more urgent and intense. Let's slow this down together"

**Response Format:**
🧭 Let's break that down:
1. [Reflection of their feeling/situation]
2. [One small, specific next step]

📌 Would it help to start with this, or talk through what's making it hard?

Always respond with structured JSON matching the required schema.`;
  }
}

// Export singleton instance with lazy initialization
let _vectorRetrievalService: VectorRetrievalService | null = null;
let _enhancedContextualManager: EnhancedContextualManager | null = null;

export const vectorRetrievalService = (() => {
  if (!_vectorRetrievalService) {
    _vectorRetrievalService = new VectorRetrievalService();
  }
  return _vectorRetrievalService;
})();

export const enhancedContextualManager = (() => {
  if (!_enhancedContextualManager) {
    _enhancedContextualManager = new EnhancedContextualManager();
  }
  return _enhancedContextualManager;
})();

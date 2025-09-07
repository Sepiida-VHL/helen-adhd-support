/**
 * Memory Storage Service
 * Handles secure local storage of user memories with privacy in mind
 */

import { Memory, UserProfile, MemoryStats, GrowthPattern } from '../types/memory.types';

const MEMORY_STORAGE_KEY = 'helen_memories';
const USER_PROFILE_KEY = 'helen_user_profile';
const DAILY_MEMORY_LIMIT = 1;

// Simple encryption for local storage (in production, use a proper encryption library)
const encrypt = (text: string): string => {
  // This is a placeholder - in production, use SubtleCrypto API
  return btoa(encodeURIComponent(text));
};

const decrypt = (encrypted: string): string => {
  // This is a placeholder - in production, use SubtleCrypto API
  return decodeURIComponent(atob(encrypted));
};

export class MemoryService {
  /**
   * Create a new memory entry
   */
  static async createMemory(memory: Omit<Memory, 'id' | 'timestamp'>): Promise<Memory | { error: string }> {
    // Check daily limit
    const todaysMemories = await this.getTodaysMemories(memory.userId);
    if (todaysMemories.length >= DAILY_MEMORY_LIMIT) {
      return { error: 'You\'ve already created a reflection today. Taking time between reflections helps insights deepen. 💙' };
    }

    const newMemory: Memory = {
      ...memory,
      id: this.generateId(),
      timestamp: Date.now()
    };

    const memories = await this.getAllMemories();
    memories.push(newMemory);
    
    // Encrypt sensitive content
    const encryptedMemories = memories.map(m => ({
      ...m,
      initialThought: encrypt(m.initialThought),
      reframedThought: encrypt(m.reframedThought),
      insights: m.insights.map(encrypt)
    }));

    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(encryptedMemories));
    return newMemory;
  }

  /**
   * Get all memories for a user
   */
  static async getUserMemories(userId: string): Promise<Memory[]> {
    const memories = await this.getAllMemories();
    return memories
      .filter(m => m.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get memories from today
   */
  static async getTodaysMemories(userId: string): Promise<Memory[]> {
    const memories = await this.getUserMemories(userId);
    const today = new Date().toDateString();
    
    return memories.filter(m => {
      const memoryDate = new Date(m.date).toDateString();
      return memoryDate === today;
    });
  }

  /**
   * Get memory statistics for user
   */
  static async getUserStats(userId: string): Promise<MemoryStats> {
    const memories = await this.getUserMemories(userId);
    
    if (memories.length === 0) {
      return {
        totalMemories: 0,
        averageMoodImprovement: 0,
        mostCommonTriggers: [],
        mostHelpfulStrategies: [],
        growthPatterns: []
      };
    }

    // Calculate average mood improvement
    const moodImprovements = memories.map(m => 
      m.reframedMood.value - m.initialMood.value
    );
    const averageMoodImprovement = moodImprovements.reduce((a, b) => a + b, 0) / moodImprovements.length;

    // Find most common triggers (from tags)
    const triggerCounts = new Map<string, number>();
    memories.forEach(m => {
      m.tags.forEach(tag => {
        triggerCounts.set(tag, (triggerCounts.get(tag) || 0) + 1);
      });
    });
    const mostCommonTriggers = Array.from(triggerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trigger]) => trigger);

    // Find most helpful strategies
    const strategyCounts = new Map<string, number>();
    memories.forEach(m => {
      m.copingStrategiesUsed.forEach(strategy => {
        strategyCounts.set(strategy, (strategyCounts.get(strategy) || 0) + 1);
      });
    });
    const mostHelpfulStrategies = Array.from(strategyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([strategy]) => strategy);

    // Detect growth patterns
    const growthPatterns = this.detectGrowthPatterns(memories);

    return {
      totalMemories: memories.length,
      averageMoodImprovement,
      mostCommonTriggers,
      mostHelpfulStrategies,
      growthPatterns
    };
  }

  /**
   * Update an existing memory
   */
  static async updateMemory(memoryId: string, updates: Partial<Memory>): Promise<Memory | null> {
    const memories = await this.getAllMemories();
    const index = memories.findIndex(m => m.id === memoryId);
    
    if (index === -1) return null;

    memories[index] = { ...memories[index], ...updates };
    
    const encryptedMemories = memories.map(m => ({
      ...m,
      initialThought: encrypt(m.initialThought),
      reframedThought: encrypt(m.reframedThought),
      insights: m.insights.map(encrypt)
    }));

    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(encryptedMemories));
    return memories[index];
  }

  /**
   * Delete a memory
   */
  static async deleteMemory(memoryId: string): Promise<boolean> {
    const memories = await this.getAllMemories();
    const filtered = memories.filter(m => m.id !== memoryId);
    
    if (filtered.length === memories.length) return false;

    const encryptedMemories = filtered.map(m => ({
      ...m,
      initialThought: encrypt(m.initialThought),
      reframedThought: encrypt(m.reframedThought),
      insights: m.insights.map(encrypt)
    }));

    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(encryptedMemories));
    return true;
  }

  /**
   * Get user profile
   */
  static async getUserProfile(): Promise<UserProfile | null> {
    const profileStr = localStorage.getItem(USER_PROFILE_KEY);
    if (!profileStr) return null;

    try {
      const encrypted = JSON.parse(profileStr);
      return {
        ...encrypted,
        name: decrypt(encrypted.name)
      };
    } catch {
      return null;
    }
  }

  /**
   * Save user profile
   */
  static async saveUserProfile(profile: UserProfile): Promise<void> {
    const encrypted = {
      ...profile,
      name: encrypt(profile.name)
    };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(encrypted));
  }

  /**
   * Private helper methods
   */
  private static async getAllMemories(): Promise<Memory[]> {
    const memoriesStr = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!memoriesStr) return [];

    try {
      const encrypted = JSON.parse(memoriesStr);
      return encrypted.map((m: any) => ({
        ...m,
        initialThought: decrypt(m.initialThought),
        reframedThought: decrypt(m.reframedThought),
        insights: m.insights.map(decrypt)
      }));
    } catch {
      return [];
    }
  }

  private static generateId(): string {
    return `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static detectGrowthPatterns(memories: Memory[]): GrowthPattern[] {
    const patterns: GrowthPattern[] = [];

    // Pattern: Increasing self-compassion
    const selfCompassionMemories = memories.filter(m => 
      m.insights.some(i => 
        i.toLowerCase().includes('self-compassion') ||
        i.toLowerCase().includes('kind to myself') ||
        i.toLowerCase().includes('not my fault')
      )
    );
    if (selfCompassionMemories.length >= 3) {
      patterns.push({
        pattern: 'Growing self-compassion',
        frequency: selfCompassionMemories.length,
        timeline: selfCompassionMemories.map(m => m.date)
      });
    }

    // Pattern: Better emotional regulation
    const regulationMemories = memories.filter(m => 
      m.reframedMood.value - m.initialMood.value >= 3
    );
    if (regulationMemories.length >= 3) {
      patterns.push({
        pattern: 'Improving emotional regulation',
        frequency: regulationMemories.length,
        timeline: regulationMemories.map(m => m.date)
      });
    }

    // Pattern: Catching spirals earlier
    const earlyCatchMemories = memories.filter(m => 
      m.initialRSDStage && ['mistake', 'self-judgment'].includes(m.initialRSDStage)
    );
    const totalRSDMemories = memories.filter(m => m.initialRSDStage && m.initialRSDStage !== 'none');
    
    if (totalRSDMemories.length > 0) {
      const catchRate = earlyCatchMemories.length / totalRSDMemories.length;
      if (catchRate > 0.5) {
        patterns.push({
          pattern: 'Catching RSD spirals earlier',
          frequency: earlyCatchMemories.length,
          timeline: earlyCatchMemories.map(m => m.date)
        });
      }
    }

    return patterns;
  }

  /**
   * Export all user data (for privacy/portability)
   */
  static async exportUserData(userId: string): Promise<string> {
    const memories = await this.getUserMemories(userId);
    const profile = await this.getUserProfile();
    
    const exportData = {
      profile,
      memories,
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Clear all data (with confirmation)
   */
  static async clearAllData(): Promise<void> {
    localStorage.removeItem(MEMORY_STORAGE_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
  }
}

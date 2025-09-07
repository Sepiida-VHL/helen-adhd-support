import React, { useState } from 'react';
import { Memory, MOOD_PRESETS, COMMON_TRIGGERS, COPING_STRATEGIES, MoodRating } from '../types/memory.types';
import { MemoryService } from '../services/memoryService';
import '../styles/MemoryCreation.css';

interface MemoryCreationProps {
  userId: string;
  userName: string;
  suggestedInitial?: string;
  suggestedReframe?: string;
  detectedInsights?: string[];
  rsdStage?: string;
  onComplete: (memory: Memory | null) => void;
  onCancel: () => void;
}

export const MemoryCreation: React.FC<MemoryCreationProps> = ({
  userId,
  userName,
  suggestedInitial = '',
  suggestedReframe = '',
  detectedInsights = [],
  rsdStage,
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [initialThought, setInitialThought] = useState(suggestedInitial);
  const [initialMood, setInitialMood] = useState<MoodRating>(MOOD_PRESETS[3]);
  const [reframedThought, setReframedThought] = useState(suggestedReframe);
  const [reframedMood, setReframedMood] = useState<MoodRating>(MOOD_PRESETS[7]);
  const [insights, setInsights] = useState<string[]>(detectedInsights);
  const [newInsight, setNewInsight] = useState('');
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!initialThought.trim() || !reframedThought.trim()) {
      setError('Please fill in both your initial thought and reframe');
      return;
    }

    setIsSaving(true);
    setError('');

    const memory = {
      userId,
      userName,
      date: new Date().toISOString(),
      initialThought: initialThought.trim(),
      initialMood,
      initialRSDStage: rsdStage as any || 'none',
      reframedThought: reframedThought.trim(),
      reframedMood,
      insights: insights.filter(i => i.trim()),
      copingStrategiesUsed: selectedStrategies,
      conversationLength: 0, // Could track actual conversation time
      isPrivate,
      tags: selectedTriggers
    };

    const result = await MemoryService.createMemory(memory);
    
    if ('error' in result) {
      setError(result.error);
      setIsSaving(false);
    } else {
      onComplete(result);
    }
  };

  const addInsight = () => {
    if (newInsight.trim()) {
      setInsights([...insights, newInsight.trim()]);
      setNewInsight('');
    }
  };

  const removeInsight = (index: number) => {
    setInsights(insights.filter((_, i) => i !== index));
  };

  const toggleStrategy = (strategy: string) => {
    setSelectedStrategies(prev =>
      prev.includes(strategy)
        ? prev.filter(s => s !== strategy)
        : [...prev, strategy]
    );
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  return (
    <div className="memory-creation">
      <div className="memory-creation-header">
        <h2>Create a Reflection 🌱</h2>
        <p>Let's capture your journey from struggle to strength</p>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      {error && (
        <div className="error-message gentle-error">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="memory-step">
          <h3>How did you feel at the start? 💭</h3>
          <p className="step-description">
            What was the thought or situation that brought you here?
          </p>
          
          <textarea
            className="memory-input"
            placeholder="I shouted at my children..."
            value={initialThought}
            onChange={(e) => setInitialThought(e.target.value)}
            rows={3}
          />

          <div className="mood-selection">
            <p>My mood was:</p>
            <div className="mood-grid">
              {MOOD_PRESETS.map((mood) => (
                <button
                  key={mood.value}
                  className={`mood-button ${initialMood.value === mood.value ? 'selected' : ''}`}
                  style={{ 
                    backgroundColor: initialMood.value === mood.value ? mood.color : 'transparent',
                    borderColor: mood.color 
                  }}
                  onClick={() => setInitialMood(mood)}
                >
                  <span className="mood-value">{mood.value}</span>
                  <span className="mood-label">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="trigger-selection">
            <p>What triggered this? (optional)</p>
            <div className="trigger-chips">
              {COMMON_TRIGGERS.map((trigger) => (
                <button
                  key={trigger}
                  className={`chip ${selectedTriggers.includes(trigger) ? 'selected' : ''}`}
                  onClick={() => toggleTrigger(trigger)}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={onCancel}>
              Maybe later
            </button>
            <button 
              className="btn-primary" 
              onClick={() => setStep(2)}
              disabled={!initialThought.trim()}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="memory-step">
          <h3>How do you see it now? 🌈</h3>
          <p className="step-description">
            After our conversation, how has your perspective shifted?
          </p>
          
          <textarea
            className="memory-input"
            placeholder="It was a normal reaction to a lot of stress..."
            value={reframedThought}
            onChange={(e) => setReframedThought(e.target.value)}
            rows={3}
          />

          <div className="mood-selection">
            <p>My mood now:</p>
            <div className="mood-grid">
              {MOOD_PRESETS.map((mood) => (
                <button
                  key={mood.value}
                  className={`mood-button ${reframedMood.value === mood.value ? 'selected' : ''}`}
                  style={{ 
                    backgroundColor: reframedMood.value === mood.value ? mood.color : 'transparent',
                    borderColor: mood.color 
                  }}
                  onClick={() => setReframedMood(mood)}
                >
                  <span className="mood-value">{mood.value}</span>
                  <span className="mood-label">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {reframedMood.value > initialMood.value && (
            <div className="mood-improvement">
              ✨ Your mood improved by {reframedMood.value - initialMood.value} points! That's growth!
            </div>
          )}

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button 
              className="btn-primary" 
              onClick={() => setStep(3)}
              disabled={!reframedThought.trim()}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="memory-step">
          <h3>What helped you? 💝</h3>
          <p className="step-description">
            Let's remember what strategies worked for you
          </p>

          <div className="strategy-selection">
            <p>Which coping strategies helped?</p>
            <div className="strategy-chips">
              {COPING_STRATEGIES.map((strategy) => (
                <button
                  key={strategy}
                  className={`chip ${selectedStrategies.includes(strategy) ? 'selected' : ''}`}
                  onClick={() => toggleStrategy(strategy)}
                >
                  {strategy}
                </button>
              ))}
            </div>
          </div>

          <div className="insights-section">
            <p>Any insights or realizations?</p>
            {insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <span>{insight}</span>
                <button 
                  className="remove-insight" 
                  onClick={() => removeInsight(index)}
                  aria-label="Remove insight"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="add-insight">
              <input
                type="text"
                placeholder="Add an insight..."
                value={newInsight}
                onChange={(e) => setNewInsight(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInsight()}
              />
              <button onClick={addInsight} disabled={!newInsight.trim()}>
                Add
              </button>
            </div>
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              ← Back
            </button>
            <button className="btn-primary" onClick={() => setStep(4)}>
              Almost done →
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="memory-step final-step">
          <h3>Beautiful reflection, {userName} 🌟</h3>
          
          <div className="memory-preview">
            <div className="journey-visualization">
              <div className="journey-start">
                <div className="mood-indicator" style={{ backgroundColor: initialMood.color }}>
                  {initialMood.value}
                </div>
                <p>"{initialThought}"</p>
              </div>
              
              <div className="journey-arrow">→</div>
              
              <div className="journey-end">
                <div className="mood-indicator" style={{ backgroundColor: reframedMood.color }}>
                  {reframedMood.value}
                </div>
                <p>"{reframedThought}"</p>
              </div>
            </div>

            {insights.length > 0 && (
              <div className="preview-insights">
                <strong>Insights gained:</strong>
                <ul>
                  {insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="privacy-option">
            <label>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <span>Keep this reflection extra private 🔒</span>
            </label>
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(3)}>
              ← Back
            </button>
            <button 
              className="btn-primary save-button" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Reflection ✨'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

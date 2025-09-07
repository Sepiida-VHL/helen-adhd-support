import React, { useState } from 'react';
import { UserProfile, UserPreferences, MemorySettings } from '../types/memory.types';
import { MemoryService } from '../services/memoryService';
import '../styles/UserOnboarding.css';

interface UserOnboardingProps {
  onComplete: (profile: UserProfile) => void;
  isFirstTime?: boolean;
}

export const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete, isFirstTime = true }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [primaryConcerns, setPrimaryConcerns] = useState<string[]>([]);
  const [preferredInterventions, setPreferredInterventions] = useState<string[]>([]);
  const [communicationStyle, setCommunicationStyle] = useState<'gentle' | 'direct' | 'encouraging'>('gentle');
  const [memorySettings, setMemorySettings] = useState<MemorySettings>({
    dailyReflectionReminder: false,
    reminderTime: '20:00',
    autoSuggestMemoryCreation: true,
    privacyLevel: 'high'
  });
  const [isSaving, setIsSaving] = useState(false);

  const concernOptions = [
    { id: 'rsd', label: 'Rejection Sensitivity (RSD)', emoji: '💔' },
    { id: 'time-blindness', label: 'Time Blindness', emoji: '⏰' },
    { id: 'executive-dysfunction', label: 'Executive Dysfunction', emoji: '🧩' },
    { id: 'emotional-dysregulation', label: 'Emotional Dysregulation', emoji: '🌊' },
    { id: 'hyperfocus', label: 'Hyperfocus Issues', emoji: '🎯' },
    { id: 'sensory-overload', label: 'Sensory Overload', emoji: '🔊' },
    { id: 'impulsivity', label: 'Impulsivity', emoji: '⚡' },
    { id: 'perfectionism', label: 'Perfectionism', emoji: '✨' }
  ];

  const interventionOptions = [
    { id: 'breathing', label: 'Breathing Exercises', emoji: '🌬️' },
    { id: 'grounding', label: 'Grounding Techniques', emoji: '🌍' },
    { id: 'movement', label: 'Movement/Stimming', emoji: '🏃' },
    { id: 'journaling', label: 'Journaling/Reflection', emoji: '📝' },
    { id: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
    { id: 'self-talk', label: 'Self-Compassion Talk', emoji: '💬' },
    { id: 'distraction', label: 'Healthy Distraction', emoji: '🎮' },
    { id: 'temperature', label: 'Temperature Change', emoji: '❄️' }
  ];

  const toggleConcern = (concernId: string) => {
    setPrimaryConcerns(prev =>
      prev.includes(concernId)
        ? prev.filter(c => c !== concernId)
        : [...prev, concernId]
    );
  };

  const toggleIntervention = (interventionId: string) => {
    setPreferredInterventions(prev =>
      prev.includes(interventionId)
        ? prev.filter(i => i !== interventionId)
        : [...prev, interventionId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    const profile: UserProfile = {
      id: crypto.randomUUID(),
      name: name.trim(),
      pronouns: pronouns.trim() || undefined,
      createdAt: new Date().toISOString(),
      preferences: {
        primaryConcerns,
        preferredInterventions,
        communicationStyle
      },
      memorySettings
    };

    await MemoryService.saveUserProfile(profile);
    onComplete(profile);
  };

  return (
    <div className="user-onboarding">
      <div className="onboarding-header">
        <h1>{isFirstTime ? 'Welcome to Helen 🌟' : 'Update Your Profile'}</h1>
        <p className="subtitle">Let's personalize your experience</p>
      </div>

      <div className="progress-indicator">
        <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}>2</div>
        <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
        <div className={`progress-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        <div className={`progress-line ${step >= 4 ? 'active' : ''}`}></div>
        <div className={`progress-dot ${step >= 4 ? 'active' : ''}`}>4</div>
      </div>

      {step === 1 && (
        <div className="onboarding-step">
          <h2>What should I call you? 💜</h2>
          <p className="step-info">This helps make our conversations feel more personal</p>
          
          <input
            type="text"
            className="name-input"
            placeholder="Your first name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
          
          <input
            type="text"
            className="pronouns-input"
            placeholder="Pronouns (optional, e.g., they/them)"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            maxLength={20}
          />
          
          <button 
            className="continue-btn"
            onClick={() => setStep(2)}
            disabled={!name.trim()}
          >
            Continue →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding-step">
          <h2>What brings you here? 🌈</h2>
          <p className="step-info">Select any that resonate (you can change these later)</p>
          
          <div className="concern-grid">
            {concernOptions.map(concern => (
              <button
                key={concern.id}
                className={`concern-option ${primaryConcerns.includes(concern.id) ? 'selected' : ''}`}
                onClick={() => toggleConcern(concern.id)}
              >
                <span className="concern-emoji">{concern.emoji}</span>
                <span className="concern-label">{concern.label}</span>
              </button>
            ))}
          </div>
          
          <div className="step-actions">
            <button className="back-btn" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button 
              className="continue-btn"
              onClick={() => setStep(3)}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="onboarding-step">
          <h2>What helps you most? 🛠️</h2>
          <p className="step-info">I'll prioritize suggesting these techniques</p>
          
          <div className="intervention-grid">
            {interventionOptions.map(intervention => (
              <button
                key={intervention.id}
                className={`intervention-option ${preferredInterventions.includes(intervention.id) ? 'selected' : ''}`}
                onClick={() => toggleIntervention(intervention.id)}
              >
                <span className="intervention-emoji">{intervention.emoji}</span>
                <span className="intervention-label">{intervention.label}</span>
              </button>
            ))}
          </div>
          
          <div className="step-actions">
            <button className="back-btn" onClick={() => setStep(2)}>
              ← Back
            </button>
            <button 
              className="continue-btn"
              onClick={() => setStep(4)}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="onboarding-step final-step">
          <h2>How would you like me to communicate? 💬</h2>
          <p className="step-info">I can adjust my style to what works best for you</p>
          
          <div className="communication-options">
            <label className={`comm-option ${communicationStyle === 'gentle' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="commStyle"
                value="gentle"
                checked={communicationStyle === 'gentle'}
                onChange={(e) => setCommunicationStyle(e.target.value as any)}
              />
              <div className="option-content">
                <h3>Gentle & Soothing 🕊️</h3>
                <p>Soft, calming language with extra validation</p>
              </div>
            </label>
            
            <label className={`comm-option ${communicationStyle === 'direct' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="commStyle"
                value="direct"
                checked={communicationStyle === 'direct'}
                onChange={(e) => setCommunicationStyle(e.target.value as any)}
              />
              <div className="option-content">
                <h3>Clear & Direct 🎯</h3>
                <p>Straightforward, no fluff, get to the point</p>
              </div>
            </label>
            
            <label className={`comm-option ${communicationStyle === 'encouraging' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="commStyle"
                value="encouraging"
                checked={communicationStyle === 'encouraging'}
                onChange={(e) => setCommunicationStyle(e.target.value as any)}
              />
              <div className="option-content">
                <h3>Warm & Encouraging 🌻</h3>
                <p>Positive, supportive with gentle cheerleading</p>
              </div>
            </label>
          </div>
          
          <div className="memory-settings">
            <h3>Reflection Settings 📝</h3>
            <label className="setting-option">
              <input
                type="checkbox"
                checked={memorySettings.autoSuggestMemoryCreation}
                onChange={(e) => setMemorySettings({
                  ...memorySettings,
                  autoSuggestMemoryCreation: e.target.checked
                })}
              />
              <span>Suggest creating reflections after breakthroughs</span>
            </label>
          </div>
          
          <div className="step-actions">
            <button className="back-btn" onClick={() => setStep(3)}>
              ← Back
            </button>
            <button 
              className="save-btn"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : `${isFirstTime ? 'Start My Journey' : 'Save Changes'} ✨`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

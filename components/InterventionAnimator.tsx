import React, { useState, useEffect } from 'react';
import { ACTTechnique, GroundingTechnique, RAINMethod } from '../types';

interface InterventionAnimatorProps {
  technique: ACTTechnique | GroundingTechnique | RAINMethod;
  onComplete: () => void;
  onSkip?: () => void;
  adhdAdaptations?: {
    showProgress: boolean;
    allowSkip: boolean;
    encouragement: boolean;
  };
}

const InterventionAnimator: React.FC<InterventionAnimatorProps> = ({ 
  technique, 
  onComplete, 
  onSkip,
  adhdAdaptations = { showProgress: true, allowSkip: true, encouragement: true }
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const steps = getStepsFromTechnique(technique);
  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isPlaying || !currentStepData) return;

    const stepDuration = getStepDuration(currentStepData);
    setCountdown(stepDuration);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleNextStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [currentStep, isPlaying, currentStepData]);

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center z-50 text-white p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-cyan-300 mb-2">{technique.name}</h2>
          <p className="text-lg text-gray-300">{technique.description}</p>
          {adhdAdaptations.showProgress && (
            <div className="mt-4">
              <div className="flex justify-center items-center gap-2 mb-2">
                <span className="text-sm text-gray-400">Step {currentStep + 1} of {totalSteps}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-6 min-h-[300px] flex flex-col justify-center">
          {renderStepContent(currentStepData, technique, countdown)}
        </div>

        {/* ADHD Encouragement */}
        {adhdAdaptations.encouragement && (
          <div className="text-center mb-6">
            <p className="text-sm text-cyan-200 italic">
              ✨ You're doing great! Your ADHD brain is learning valuable skills right now.
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
          >
            Previous
          </button>
          
          <button
            onClick={togglePlayPause}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300"
          >
            {isPlaying ? 'Pause' : 'Resume'}
          </button>
          
          <button
            onClick={handleNextStep}
            disabled={currentStep === totalSteps - 1}
            className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
          >
            {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
          </button>
        </div>

        {/* Skip Option */}
        {adhdAdaptations.allowSkip && (
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-300 text-sm underline"
            >
              Skip this exercise
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function getStepsFromTechnique(technique: any): any[] {
  if ('steps' in technique && Array.isArray(technique.steps)) {
    return technique.steps;
  }
  if ('visualization_steps' in technique) {
    return technique.visualization_steps.map((step: string, index: number) => ({
      instruction: step,
      duration: 30 // Default 30 seconds per visualization step
    }));
  }
  return [];
}

function getStepDuration(step: any): number {
  if (step.duration) return step.duration;
  if (step.count) return Math.max(step.count * 5, 15); // 5 seconds per item, minimum 15 seconds
  return 30; // Default 30 seconds
}

function renderStepContent(stepData: any, technique: any, countdown: number) {
  if (!stepData) return null;

  // Handle different technique types
  if (typeof stepData === 'object' && stepData !== null && 'sense' in stepData) {
    // Grounding technique
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">
          {getSenseEmoji(stepData.sense)}
        </div>
        <h3 className="text-2xl font-bold text-cyan-300 mb-4">
          {stepData.sense ? `Using your ${stepData.sense}` : 'Ground Yourself'}
        </h3>
        <p className="text-xl text-gray-200 mb-6">
          {stepData.instruction}
        </p>
        {stepData.count && (
          <div className="text-lg text-cyan-200">
            Find {stepData.count} things
          </div>
        )}
        {countdown > 0 && (
          <div className="text-4xl font-bold text-pink-400 mt-4">
            {countdown}s
          </div>
        )}
      </div>
    );
  }

  if (typeof stepData === 'object' && stepData !== null && 'letter' in stepData) {
    // RAIN method
    return (
      <div className="text-center">
        <div className="text-8xl font-bold text-cyan-400 mb-4">
          {stepData.letter.charAt(0)}
        </div>
        <h3 className="text-2xl font-bold text-cyan-300 mb-4">
          {stepData.letter}
        </h3>
        <p className="text-xl text-gray-200 mb-4">
          {stepData.instruction}
        </p>
        <p className="text-sm text-pink-200 italic">
          💡 {stepData.adhd_note}
        </p>
        {countdown > 0 && (
          <div className="text-3xl font-bold text-pink-400 mt-6">
            {countdown}s remaining
          </div>
        )}
      </div>
    );
  }

  if (typeof stepData === 'object' && stepData !== null && 'phase' in stepData) {
    // ACT technique
    return (
      <div className="text-center">
        <h3 className="text-3xl font-bold text-cyan-300 mb-6">
          {stepData.phase}
        </h3>
        <p className="text-xl text-gray-200 leading-relaxed">
          {stepData.instruction}
        </p>
        {countdown > 0 && (
          <div className="text-3xl font-bold text-pink-400 mt-8">
            {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>
    );
  }

  // Default rendering
  return (
    <div className="text-center">
      <p className="text-xl text-gray-200 leading-relaxed">
        {stepData.instruction || stepData}
      </p>
      {countdown > 0 && (
        <div className="text-3xl font-bold text-pink-400 mt-6">
          {countdown}s
        </div>
      )}
    </div>
  );
}

function getSenseEmoji(sense: string): string {
  const emojiMap: Record<string, string> = {
    sight: '👀',
    touch: '✋',
    hearing: '👂',
    smell: '👃',
    taste: '👅'
  };
  return emojiMap[sense] || '🌟';
}

export default InterventionAnimator;

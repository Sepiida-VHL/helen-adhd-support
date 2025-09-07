import React, { useState, useEffect, useRef, useCallback } from 'react';

interface BreathingStep {
  label: string;
  duration: number;
}

interface BreathingAnimatorProps {
  pattern: {
    name: string;
    steps: BreathingStep[];
  };
  onComplete: () => void;
  cycles: number;
  guidedVoice?: boolean;
  vibrationEnabled?: boolean;
}

const BreathingAnimator: React.FC<BreathingAnimatorProps> = ({ 
  pattern, 
  onComplete, 
  cycles, 
  guidedVoice = false,
  vibrationEnabled = false 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [orbScale, setOrbScale] = useState(1);
  const [orbOpacity, setOrbOpacity] = useState(0.8);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Smooth animation loop for orb scaling and progress
  const animate = useCallback(() => {
    if (!isPlaying) return;
    
    const currentStep = pattern.steps[currentStepIndex];
    const stepDuration = currentStep.duration * 1000; // Convert to milliseconds
    const elapsed = Date.now() - startTimeRef.current;
    const stepProgress = Math.min(elapsed / stepDuration, 1);
    
    setProgress(stepProgress);
    
    // Calculate orb scale and opacity based on breathing step
    let targetScale = 1;
    let targetOpacity = 0.8;
    
    const stepLabel = currentStep.label.toLowerCase();
    
    if (stepLabel.includes('in') || stepLabel.includes('inhale')) {
      // Breathe in: expand orb
      targetScale = 1 + (stepProgress * 0.5); // Scale from 1 to 1.5
      targetOpacity = 0.6 + (stepProgress * 0.3); // Opacity from 0.6 to 0.9
    } else if (stepLabel.includes('out') || stepLabel.includes('exhale')) {
      // Breathe out: contract orb
      targetScale = 1.5 - (stepProgress * 0.3); // Scale from 1.5 to 1.2
      targetOpacity = 0.9 - (stepProgress * 0.2); // Opacity from 0.9 to 0.7
    } else if (stepLabel.includes('hold')) {
      // Hold: gentle pulsing
      const pulseIntensity = Math.sin(elapsed * 0.003) * 0.05;
      targetScale = 1.3 + pulseIntensity;
      targetOpacity = 0.8 + (Math.sin(elapsed * 0.002) * 0.1);
    }
    
    // Smooth interpolation for natural movement
    setOrbScale(prevScale => prevScale + (targetScale - prevScale) * 0.1);
    setOrbOpacity(prevOpacity => prevOpacity + (targetOpacity - prevOpacity) * 0.1);
    
    animationRef.current = requestAnimationFrame(animate);
  }, [currentStepIndex, pattern.steps, isPlaying]);
  
  // Voice guidance function
  const speakInstruction = useCallback((instruction: string) => {
    if (!guidedVoice || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(instruction);
    utterance.rate = 0.8;
    utterance.pitch = 0.9;
    utterance.volume = 0.7;
    window.speechSynthesis.speak(utterance);
  }, [guidedVoice]);
  
  // Vibration feedback
  const triggerVibration = useCallback((pattern: number[]) => {
    if (!vibrationEnabled || !('navigator' in window) || !navigator.vibrate) return;
    navigator.vibrate(pattern);
  }, [vibrationEnabled]);

  // Main step progression logic
  useEffect(() => {
    if (cycleCount >= cycles) {
      setIsPlaying(false);
      onComplete();
      return;
    }

    if (!isPlaying) return;

    const currentStep = pattern.steps[currentStepIndex];
    startTimeRef.current = Date.now();
    
    // Voice guidance
    speakInstruction(currentStep.label);
    
    // Vibration feedback for step transitions
    if (currentStep.label.toLowerCase().includes('in')) {
      triggerVibration([100]); // Short vibration for inhale
    } else if (currentStep.label.toLowerCase().includes('out')) {
      triggerVibration([150]); // Slightly longer for exhale
    }

    const stepTimeout = setTimeout(() => {
      const nextStepIndex = (currentStepIndex + 1) % pattern.steps.length;
      setCurrentStepIndex(nextStepIndex);
      
      if (nextStepIndex === 0) {
        setCycleCount((prev) => prev + 1);
        triggerVibration([50, 50, 50]); // Triple vibration for cycle completion
      }
    }, currentStep.duration * 1000);

    return () => {
      clearTimeout(stepTimeout);
    };
  }, [currentStepIndex, cycleCount, cycles, isPlaying, onComplete, pattern.steps, speakInstruction, triggerVibration]);
  
  // Start animation loop
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, isPlaying]);
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (guidedVoice && !isPlaying) {
      speakInstruction('Resuming');
    } else if (guidedVoice && isPlaying) {
      speakInstruction('Paused');
    }
  };
  
  const currentStep = pattern.steps[currentStepIndex];
  const totalCycles = cycles;
  const completedCycles = cycleCount;
  const remainingCycles = totalCycles - completedCycles;
  const overallProgress = (completedCycles + (currentStepIndex / pattern.steps.length)) / totalCycles;
  
  // Dynamic colors based on breathing step
  const getOrbColors = () => {
    const stepLabel = currentStep.label.toLowerCase();
    if (stepLabel.includes('in')) {
      return {
        primary: 'from-cyan-400 to-blue-500',
        secondary: 'from-cyan-300/30 to-blue-400/30',
        glow: 'shadow-cyan-400/50'
      };
    } else if (stepLabel.includes('out')) {
      return {
        primary: 'from-purple-400 to-pink-500',
        secondary: 'from-purple-300/30 to-pink-400/30',
        glow: 'shadow-purple-400/50'
      };
    } else {
      return {
        primary: 'from-emerald-400 to-teal-500',
        secondary: 'from-emerald-300/30 to-teal-400/30',
        glow: 'shadow-emerald-400/50'
      };
    }
  };
  
  const colors = getOrbColors();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 flex flex-col items-center justify-center z-50 text-white p-4 text-center overflow-hidden">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-pink-500/8 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {pattern.name}
          </h2>
          <p className="text-lg text-gray-300">
            Cycle {completedCycles + 1} of {totalCycles}
          </p>
        </div>
        
        {/* Main breathing orb */}
        <div className="relative w-80 h-80 flex items-center justify-center mx-auto mb-8">
          {/* Outer glow ring */}
          <div 
            className={`absolute w-full h-full rounded-full bg-gradient-to-r ${colors.secondary} blur-sm ${colors.glow}`}
            style={{
              transform: `scale(${orbScale * 1.1})`,
              opacity: orbOpacity * 0.6,
              transition: 'none'
            }}
          ></div>
          
          {/* Main orb */}
          <div 
            className={`absolute w-72 h-72 rounded-full bg-gradient-to-r ${colors.primary} shadow-2xl ${colors.glow}`}
            style={{
              transform: `scale(${orbScale})`,
              opacity: orbOpacity,
              transition: 'none',
              boxShadow: `0 0 60px ${orbOpacity * 50}px currentColor`
            }}
          ></div>
          
          {/* Inner shine */}
          <div 
            className="absolute w-32 h-32 rounded-full bg-white/20 blur-xl"
            style={{
              transform: `scale(${orbScale}) translate(-25%, -25%)`,
              opacity: orbOpacity * 0.8
            }}
          ></div>
          
          {/* Step instruction */}
          <div className="relative z-20 text-center">
            <p className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {currentStep.label}
            </p>
            <div className="w-16 h-1 bg-white/50 rounded-full mx-auto">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Overall progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(overallProgress * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-500 ease-out"
              style={{ width: `${overallProgress * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={togglePlayPause}
            className="flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          
          <button
            onClick={onComplete}
            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            Complete Session
          </button>
        </div>
        
        {/* Settings indicators */}
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-400">
          {guidedVoice && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              <span>Voice guided</span>
            </div>
          )}
          {vibrationEnabled && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M0 15h2V9H0v6zm3 2h2V7H3v10zm19-8v6h2V9h-2zm-3 8h2V7h-2v10zM16 3H8v18h8V3z"/>
              </svg>
              <span>Vibration</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreathingAnimator;

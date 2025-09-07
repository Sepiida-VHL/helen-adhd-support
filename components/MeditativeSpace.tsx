import React, { useState, useRef, useEffect } from 'react';

interface MeditativeSpaceProps {
  isVisible: boolean;
  onClose: () => void;
}

const MeditativeSpace: React.FC<MeditativeSpaceProps> = ({ isVisible, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedAmbient, setSelectedAmbient] = useState('pink-noise');
  const [opacity, setOpacity] = useState(1);
  const [centerOpacity, setCenterOpacity] = useState(1);
  const [transition, setTransition] = useState('');
  const [duration, setDuration] = useState(10); // minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();

  const ambientOptions = [
    { id: 'pink-noise', name: 'Pink Noise', description: 'Gentle static for focus' },
    { id: 'rain', name: 'Rain', description: 'Soft rainfall sounds' },
    { id: 'forest', name: 'Forest', description: 'Nature sounds' },
    { id: 'waves', name: 'Ocean Waves', description: 'Calming wave sounds' },
    { id: 'wind', name: 'Wind', description: 'Gentle breeze' }
  ];

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleStop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, timeRemaining]);

  const handlePlay = () => {
    if (!isPlaying) {
      setTimeRemaining(duration * 60);
      setIsPlaying(true);
      // Start fade out after 3 seconds
      setOpacity(0.3);
      setCenterOpacity(0.7);
      setTransition('opacity 3s ease-out');
    } else {
      handlePause();
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    setOpacity(1);
    setCenterOpacity(1);
    setTransition('opacity 0.5s ease-in');
  };

  const handleStop = () => {
    setIsPlaying(false);
    setTimeRemaining(0);
    setOpacity(1);
    setCenterOpacity(1);
    setTransition('opacity 0.5s ease-in');
  };

  const handleMouseMove = () => {
    if (isPlaying) {
      setOpacity(1);
      setCenterOpacity(1);
      setTransition('opacity 0.3s ease-in');
      
      // Clear existing timeout
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      
      // Set new timeout to fade out
      fadeTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setOpacity(0.3);
          setCenterOpacity(0.7);
          setTransition('opacity 3s ease-out');
        }
      }, 3000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fadeStyles = {
    opacity: opacity,
    transition: transition,
  };

  const centerFadeStyles = {
    opacity: centerOpacity,
    transition: transition,
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800"
      onMouseMove={handleMouseMove}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all duration-300"
        style={fadeStyles}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        
        {/* Header */}
        <div className="text-center mb-12" style={fadeStyles}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Meditative Space
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Find your calm with gentle ambient sounds</p>
          <p className="text-xs text-gray-500 mt-2">by SepiidAI</p>
        </div>

        {/* Ambient sound selector */}
        <div className="mb-8" style={fadeStyles}>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
            {ambientOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedAmbient(option.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedAmbient === option.id
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-600/50'
                }`}
              >
                <div className="text-center">
                  <div>{option.name}</div>
                  <div className="text-xs opacity-75">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Timer controls */}
        <div className="mb-8" style={fadeStyles}>
          <div className="flex items-center gap-4 bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/50">
            <label className="text-gray-300 text-sm">Duration:</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => !isPlaying && setDuration(mins)}
                  disabled={isPlaying}
                  className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                    duration === mins
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 disabled:opacity-50'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Central play controls */}
        <div className="relative mb-8" style={centerFadeStyles}>
          {/* Progress ring */}
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(107, 114, 128, 0.3)"
                strokeWidth="2"
              />
              {timeRemaining > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(timeRemaining / (duration * 60)) * 283} 283`}
                  className="transition-all duration-1000"
                />
              )}
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Play button */}
            <button
              onClick={handlePlay}
              className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center"
              style={{
                boxShadow: '0 8px 25px rgba(168, 85, 247, 0.4)'
              }}
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Timer display */}
        <div className="text-center mb-8" style={centerFadeStyles}>
          <div className="text-4xl font-mono font-bold text-white mb-2">
            {formatTime(timeRemaining)}
          </div>
          {isPlaying && (
            <div className="text-sm text-gray-400">
              {ambientOptions.find(opt => opt.id === selectedAmbient)?.name} playing
            </div>
          )}
        </div>

        {/* Volume and controls */}
        <div className="flex items-center gap-6" style={fadeStyles}>
          {/* Stop button */}
          <button
            onClick={handleStop}
            disabled={!isPlaying && timeRemaining === 0}
            className="p-3 rounded-full bg-gray-800/60 hover:bg-gray-700/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-gray-600/50"
          >
            <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>

          {/* Volume control */}
          <div className="flex items-center gap-3 bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/50">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                {isMuted || volume === 0 ? (
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                ) : (
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                )}
              </svg>
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVolume = parseInt(e.target.value);
                setVolume(newVolume);
                if (newVolume > 0) setIsMuted(false);
              }}
              className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${isMuted ? 0 : volume}%, #4b5563 ${isMuted ? 0 : volume}%, #4b5563 100%)`
              }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-12 max-w-md" style={fadeStyles}>
          <p className="text-gray-400 text-sm leading-relaxed">
            Close your eyes, breathe deeply, and let the gentle sounds wash over you. 
            The interface will fade to help you focus on your meditation.
          </p>
        </div>
      </div>

      {/* Hidden audio element - will be replaced with actual audio files */}
      <audio
        ref={audioRef}
        loop
        volume={isMuted ? 0 : volume / 100}
        // src={`/audio/${selectedAmbient}.mp3`} // Will be added when audio files are available
      />

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(to right, #a855f7, #ec4899);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(168, 85, 247, 0.4);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(to right, #a855f7, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(168, 85, 247, 0.4);
        }
      `}</style>
    </div>
  );
};

export default MeditativeSpace;

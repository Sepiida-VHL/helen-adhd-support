import React, { useState, useEffect } from 'react';
import Cubes from './Cubes';
import { SparklesIcon } from './Icons';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEnterApp = () => {
    // Add a gentle transition effect
    const button = document.querySelector('.launch-button');
    if (button) {
      button.animate([
        { transform: 'scale(1)', filter: 'brightness(1)' },
        { transform: 'scale(0.95)', filter: 'brightness(1.2)' },
        { transform: 'scale(1.05)', filter: 'brightness(0.9)' },
        { transform: 'scale(1)', filter: 'brightness(1)' }
      ], {
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      });
    }
    
    setTimeout(() => {
      onEnterApp();
    }, 200);
  };

  return (
    <div className="landing-page min-h-screen relative overflow-hidden">
      {/* Gentle Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800" />
      
      {/* Subtle Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`,
          transition: 'background-image 0.3s ease'
        }}
      />

      {/* Animated Cubes Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-60">
        <Cubes 
          gridSize={8}
          maxAngle={25}
          radius={3}
          borderStyle="1px solid rgba(139, 92, 246, 0.3)"
          faceColor="rgba(15, 23, 42, 0.8)"
          rippleColor="#a855f7"
          rippleSpeed={1.2}
          autoAnimate={true}
          rippleOnClick={true}
          duration={{ enter: 0.5, leave: 0.8 }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Helen
            </h1>
            <SparklesIcon className="w-8 h-8 text-purple-400" />
          </div>
          
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 font-light tracking-wider">
              by <span className="text-purple-400 font-medium">SepiidAI</span>
            </p>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4 leading-relaxed">
            Crisis support designed for ADHD minds
          </p>
          
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Evidence-based therapeutic support that works with your ADHD brain, not against it. 
            Immediate help when emotions feel overwhelming.
          </p>
        </div>

        {/* Main Launch Button */}
        <div className="relative group">
          {/* Button Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          
          <button
            className="launch-button relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-6 px-12 rounded-full text-xl md:text-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl"
            onClick={handleEnterApp}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              boxShadow: isHovered 
                ? '0 20px 40px rgba(239, 68, 68, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                : '0 10px 30px rgba(239, 68, 68, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            <span className="flex items-center gap-3">
              <span>I Need Support</span>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </span>
          </button>
        </div>

        {/* Secondary Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Available 24/7 • Private & Secure • Evidence-Based
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              ACT Therapy
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              DBT Skills
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              ADHD Adapted
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-pink-400 rounded-full" />
              Crisis Ready
            </span>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 max-w-md text-center">
          <p className="text-gray-500 text-xs leading-relaxed">
            <strong className="text-red-400">Emergency?</strong> Call 988 (Crisis Lifeline) or 911 immediately.
            <br />
            This tool provides support but is not a replacement for emergency services.
          </p>
        </div>
      </div>

      <style jsx>{`
        .landing-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .launch-button {
          position: relative;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: none;
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        .launch-button::before {
          content: '';
          position: absolute;
          top: 1px;
          left: 1px;
          right: 1px;
          bottom: 1px;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
          border-radius: inherit;
          pointer-events: none;
        }
        
        .launch-button:active {
          transform: translateY(1px) scale(0.98);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .launch-button {
            transition: none;
            transform: none;
          }
          
          .launch-button:hover {
            transform: none;
          }
          
          .launch-button:active {
            transform: translateY(1px);
          }
        }
        
        @media (max-width: 768px) {
          .launch-button {
            padding: 1.25rem 2rem;
            font-size: 1.125rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

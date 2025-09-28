import React, { useState } from 'react';
import { SparklesIcon } from './Icons';

interface HelpMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectActivity: (activity: 'breathing' | 'grounding' | 'meditate' | 'stressball' | 'bubblewrap' | 'rsd') => void;
}

const HelpMenu: React.FC<HelpMenuProps> = ({ isVisible, onClose, onSelectActivity }) => {
  if (!isVisible) return null;

  const activities = [
    {
      id: 'breathing',
      title: 'Breathing Exercises',
      description: 'Guided breathing patterns to calm your nervous system',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      ),
      gradient: 'from-cyan-500 to-cyan-600',
      hoverGradient: 'hover:from-cyan-600 hover:to-cyan-700',
    },
    {
      id: 'grounding',
      title: 'Grounding Techniques',
      description: 'Connect with the present moment using your senses',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
    },
    {
      id: 'meditate',
      title: 'Meditative Space',
      description: 'Ambient sounds and peaceful environment for reflection',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      gradient: 'from-indigo-500 to-indigo-600',
      hoverGradient: 'hover:from-indigo-600 hover:to-indigo-700',
    },
    {
      id: 'stressball',
      title: 'Interactive Stress Ball',
      description: 'Squeeze and throw a virtual stress ball around',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      ),
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'hover:from-orange-600 hover:to-orange-700',
    },
    {
      id: 'bubblewrap',
      title: 'Bubble Wrap Popping',
      description: 'Pop virtual bubble wrap for satisfying stress relief',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm2-4H5V6h14v8z"/>
        </svg>
      ),
      gradient: 'from-pink-500 to-pink-600',
      hoverGradient: 'hover:from-pink-600 hover:to-pink-700',
    },
    {
      id: 'rsd',
      title: 'RSD Support Chat',
      description: 'Structured conversation for rejection sensitivity moments',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 9h-2.5l-2-2h-2l2.5 2.5L8 13.5h2l2-2H14V9z"/>
        </svg>
      ),
      gradient: 'from-red-500 to-red-600',
      hoverGradient: 'hover:from-red-600 hover:to-red-700',
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Support Activities
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors duration-300 rounded-full hover:bg-gray-800/50"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-6 text-center">
          Choose an activity that feels right for you. Each one is designed to help you feel better in a different way.
        </p>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => {
                onSelectActivity(activity.id as any);
                onClose();
              }}
              className={`
                group relative p-4 rounded-2xl bg-gradient-to-r ${activity.gradient} ${activity.hoverGradient}
                text-white text-left transition-all duration-300 transform hover:scale-105
                shadow-lg backdrop-blur-sm border border-white/10
              `}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl mb-3 group-hover:bg-white/30 transition-colors duration-300">
                {activity.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold mb-2 group-hover:text-white/90 transition-colors duration-300">
                {activity.title}
              </h3>
              <p className="text-white/80 text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                {activity.description}
              </p>

              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            After completing any activity, you'll return right back to our conversation
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpMenu;
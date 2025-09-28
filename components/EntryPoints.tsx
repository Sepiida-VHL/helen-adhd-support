import React from 'react';
import { SparklesIcon, ShieldExclamationIcon } from './Icons';

interface EntryPointsProps {
    onSelectMode: (mode: 'chat' | 'breathing' | 'grounding' | 'crisis' | 'meditate' | 'stressball' | 'bubblewrap' | 'rsd') => void;
}

const EntryPoints: React.FC<EntryPointsProps> = ({ onSelectMode }) => {
    const entryPoints = [
        {
            id: 'chat',
            title: 'Talk to Helen',
            description: 'Start a conversation and get personalized support',
            icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
            ),
            gradient: 'from-purple-500 to-purple-600',
            hoverGradient: 'hover:from-purple-600 hover:to-purple-700',
            shadowColor: 'rgba(147, 51, 234, 0.3)'
        },
        {
            id: 'breathing',
            title: 'Breathing Exercises',
            description: 'Guided breathing patterns to calm your nervous system',
            icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2zm0-3H6V9h12v2z"/>
                </svg>
            ),
            gradient: 'from-cyan-500 to-cyan-600',
            hoverGradient: 'hover:from-cyan-600 hover:to-cyan-700',
            shadowColor: 'rgba(6, 182, 212, 0.3)'
        },
        {
            id: 'grounding',
            title: 'Grounding Techniques',
            description: 'Connect with the present moment using your senses',
            icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            ),
            gradient: 'from-green-500 to-green-600',
            hoverGradient: 'hover:from-green-600 hover:to-green-700',
            shadowColor: 'rgba(34, 197, 94, 0.3)'
        },
        {
            id: 'meditate',
            title: 'Meditative Space',
            description: 'Ambient sounds and peaceful environment for reflection',
            icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            ),
            gradient: 'from-indigo-500 to-indigo-600',
            hoverGradient: 'hover:from-indigo-600 hover:to-indigo-700',
            shadowColor: 'rgba(99, 102, 241, 0.3)'
        },
        {
            id: 'rsd',
            title: 'RSD Support Chat',
            description: 'Structured conversation for rejection sensitivity moments',
            icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 9h-2.5l-2-2h-2l2.5 2.5L8 13.5h2l2-2H14V9z"/>
                </svg>
            ),
            gradient: 'from-red-400 to-red-500',
            hoverGradient: 'hover:from-red-500 hover:to-red-600',
            shadowColor: 'rgba(248, 113, 113, 0.3)'
        },
        {
            id: 'stressball',
            title: 'Interactive Stress Ball',
            description: 'Squeeze and throw a virtual stress ball around',
            icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
            ),
            gradient: 'from-orange-500 to-orange-600',
            hoverGradient: 'hover:from-orange-600 hover:to-orange-700',
            shadowColor: 'rgba(249, 115, 22, 0.3)'
        },
        {
            id: 'bubblewrap',
            title: 'Bubble Wrap Popping',
            description: 'Pop virtual bubble wrap for satisfying stress relief',
            icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm2-4H5V6h14v8z"/>
                </svg>
            ),
            gradient: 'from-pink-500 to-pink-600',
            hoverGradient: 'hover:from-pink-600 hover:to-pink-700',
            shadowColor: 'rgba(236, 72, 153, 0.3)'
        },
        {
            id: 'crisis',
            title: 'Crisis Support',
            description: 'Immediate help and emergency resources',
            icon: <ShieldExclamationIcon />,
            gradient: 'from-red-500 to-red-600',
            hoverGradient: 'hover:from-red-600 hover:to-red-700',
            shadowColor: 'rgba(239, 68, 68, 0.4)',
            urgent: true
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient background effect */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="relative z-10 max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-xl">
                            <span className="text-white font-bold text-2xl">H</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3 mb-2">
                        Helen
                    </h1>
                    <p className="text-gray-400 mb-2">by SepiidAI</p>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Choose how you'd like to connect with your support today. Each path is designed to meet you where you are.
                    </p>
                </div>

                {/* Entry Points Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {entryPoints.map((point) => (
                        <button
                            key={point.id}
                            onClick={() => onSelectMode(point.id as any)}
                            className={`
                                group relative p-6 rounded-3xl bg-gradient-to-r ${point.gradient} ${point.hoverGradient}
                                text-white text-left transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
                                ${point.urgent ? 'animate-pulse' : ''}
                                shadow-xl backdrop-blur-sm border border-white/10
                            `}
                            style={{
                                boxShadow: `0 8px 25px ${point.shadowColor}`
                            }}
                        >
                            {/* Icon */}
                            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl mb-4 group-hover:bg-white/30 transition-colors duration-300">
                                {point.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold mb-2 group-hover:text-white/90 transition-colors duration-300">
                                {point.title}
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                                {point.description}
                            </p>

                            {/* Subtle gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    ))}
                </div>

                {/* Footer note */}
                <div className="text-center mt-12">
                    <p className="text-gray-500 text-sm">
                        You can always switch between modes during your session
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EntryPoints;

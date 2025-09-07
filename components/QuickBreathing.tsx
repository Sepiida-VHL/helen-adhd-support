import React, { useState } from 'react';
import { SparklesIcon } from './Icons';
import BreathingAnimator from './BreathingAnimator';

interface QuickBreathingProps {
    onBack: () => void;
    onComplete?: (activityType: 'breathing') => void;
}

type BreathingPattern = {
    name: string;
    steps: { label: string; duration: number }[];
    description: string;
}

const QuickBreathing: React.FC<QuickBreathingProps> = ({ onBack, onComplete }) => {
    const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
    const [guidedVoice, setGuidedVoice] = useState(false);
    const [vibrationEnabled, setVibrationEnabled] = useState(false);
    const [cycles, setCycles] = useState(5);

    const breathingPatterns: BreathingPattern[] = [
        {
            name: '4-7-8 Breathing',
            steps: [
                { label: 'Breathe In', duration: 4 },
                { label: 'Hold', duration: 7 },
                { label: 'Breathe Out', duration: 8 },
            ],
            description: 'Perfect for anxiety and stress. Activates your relaxation response.'
        },
        {
            name: 'Box Breathing',
            steps: [
                { label: 'Breathe In', duration: 4 },
                { label: 'Hold', duration: 4 },
                { label: 'Breathe Out', duration: 4 },
                { label: 'Hold', duration: 4 },
            ],
            description: 'Used by Navy SEALs for focus and calm. Great for ADHD minds.'
        },
        {
            name: 'Cyclic Sighing',
            steps: [
                { label: 'Double Inhale', duration: 3 },
                { label: 'Long Exhale', duration: 6 },
            ],
            description: 'Research-backed technique for rapid calm and nervous system regulation.'
        },
        {
            name: 'Equal Breathing',
            steps: [
                { label: 'Breathe In', duration: 5 },
                { label: 'Breathe Out', duration: 5 },
            ],
            description: 'Simple and balanced. Perfect when you need gentle grounding.'
        }
    ];

    const handleBreathingComplete = () => {
        setSelectedPattern(null);
        if (onComplete) {
            onComplete('breathing');
        }
    };

    if (selectedPattern) {
        return (
            <BreathingAnimator 
                pattern={selectedPattern} 
                onComplete={handleBreathingComplete}
                cycles={cycles}
                guidedVoice={guidedVoice}
                vibrationEnabled={vibrationEnabled}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-800 text-white relative overflow-hidden">
            {/* Ambient background effect */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="relative z-10 flex flex-col h-screen">
                {/* Header */}
                <header className="p-6">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                            </svg>
                            Back to options
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                                </svg>
                            </div>
                            <span className="text-sm text-gray-400">Breathing Space</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="max-w-4xl w-full">
                        {/* Title */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
                                Breathing Exercises
                            </h1>
                            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                Choose a breathing pattern that feels right for you. Each exercise is designed to calm your nervous system and bring you back to center.
                            </p>
                        </div>

                        {/* Breathing Patterns Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {breathingPatterns.map((pattern) => (
                                <button
                                    key={pattern.name}
                                    onClick={() => setSelectedPattern(pattern)}
                                    className="group relative p-6 rounded-3xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:border-cyan-400/50 text-left transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm"
                                    style={{
                                        boxShadow: '0 8px 25px rgba(6, 182, 212, 0.2)'
                                    }}
                                >
                                    {/* Pattern Name */}
                                    <h3 className="text-xl font-bold text-cyan-300 mb-3 group-hover:text-cyan-200 transition-colors duration-300">
                                        {pattern.name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-gray-200 transition-colors duration-300">
                                        {pattern.description}
                                    </p>

                                    {/* Pattern Preview */}
                                    <div className="flex items-center gap-2 text-xs text-cyan-400">
                                        {pattern.steps.map((step, index) => (
                                            <React.Fragment key={index}>
                                                <span className="bg-cyan-500/20 px-2 py-1 rounded-full">
                                                    {step.label} {step.duration}s
                                                </span>
                                                {index < pattern.steps.length - 1 && (
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                                                    </svg>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            ))}
                        </div>

                        {/* Settings */}
                        <div className="mt-12">
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 max-w-2xl mx-auto">
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                                    </svg>
                                    <span className="text-cyan-300 font-medium">Session Settings</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Cycles Control */}
                                    <div className="text-center">
                                        <label className="block text-sm text-gray-400 mb-2">Cycles</label>
                                        <div className="flex items-center justify-center gap-3">
                                            <button 
                                                onClick={() => setCycles(Math.max(1, cycles - 1))}
                                                className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors duration-200"
                                            >
                                                −
                                            </button>
                                            <span className="text-xl font-bold text-white w-8">{cycles}</span>
                                            <button 
                                                onClick={() => setCycles(Math.min(20, cycles + 1))}
                                                className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors duration-200"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Voice Guidance Toggle */}
                                    <div className="text-center">
                                        <label className="block text-sm text-gray-400 mb-2">Voice Guidance</label>
                                        <button
                                            onClick={() => setGuidedVoice(!guidedVoice)}
                                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                                                guidedVoice ? 'bg-cyan-500' : 'bg-gray-600'
                                            }`}
                                        >
                                            <div
                                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                                                    guidedVoice ? 'translate-x-7' : 'translate-x-1'
                                                }`}
                                            ></div>
                                        </button>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {guidedVoice ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>
                                    
                                    {/* Vibration Toggle */}
                                    <div className="text-center">
                                        <label className="block text-sm text-gray-400 mb-2">Haptic Feedback</label>
                                        <button
                                            onClick={() => setVibrationEnabled(!vibrationEnabled)}
                                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                                                vibrationEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                                            }`}
                                        >
                                            <div
                                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                                                    vibrationEnabled ? 'translate-x-7' : 'translate-x-1'
                                                }`}
                                            ></div>
                                        </button>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {vibrationEnabled ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-6 pt-6 border-t border-gray-700/50">
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        <SparklesIcon className="text-cyan-400" />
                                        <span className="text-cyan-300 font-medium">Tips</span>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed text-center">
                                        Find a comfortable position, close your eyes if it feels good, and let the orb guide your breath. 
                                        If your mind wanders, that's totally normal—just gently return to the rhythm.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default QuickBreathing;

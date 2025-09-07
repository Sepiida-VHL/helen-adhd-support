import React, { useState } from 'react';
import { SparklesIcon } from './Icons';
import InterventionAnimator from './InterventionAnimator';
import { GroundingTechnique } from '../types';

interface QuickGroundingProps {
    onBack: () => void;
    onComplete?: (activityType: 'grounding') => void;
}

const QuickGrounding: React.FC<QuickGroundingProps> = ({ onBack, onComplete }) => {
    const [selectedTechnique, setSelectedTechnique] = useState<GroundingTechnique | null>(null);

    const groundingTechniques: GroundingTechnique[] = [
        {
            name: '5-4-3-2-1 Sensory Grounding',
            description: 'Use your five senses to connect with the present moment',
            steps: [
                'Notice 5 things you can see around you',
                'Notice 4 things you can touch or feel',
                'Notice 3 things you can hear',
                'Notice 2 things you can smell',
                'Notice 1 thing you can taste'
            ],
            duration: 300,
            adhdAdaptations: [
                'Move around while identifying objects',
                'Say items out loud or count on fingers',
                'Use colorful or textured objects when possible'
            ]
        },
        {
            name: 'Self-Touch Containment',
            description: 'Use gentle touch to soothe your nervous system',
            steps: [
                'Place both hands on your heart',
                'Take three deep breaths feeling your heartbeat',
                'Gently squeeze your shoulders with opposite hands',
                'Rub your arms from shoulders to hands',
                'Hold your own hands in your lap'
            ],
            duration: 240,
            adhdAdaptations: [
                'Use firmer pressure if light touch is uncomfortable',
                'Focus on the physical sensation rather than emotions',
                'Move at your own pace, no rush'
            ]
        },
        {
            name: 'Body Scan Grounding',
            description: 'Connect with your body from head to toe',
            steps: [
                'Start at the top of your head',
                'Notice any tension in your face and jaw',
                'Feel your shoulders and arms',
                'Bring attention to your chest and breathing',
                'Notice your stomach and lower back',
                'Feel your hips and legs',
                'Ground through your feet on the floor'
            ],
            duration: 360,
            adhdAdaptations: [
                'Wiggle or move each body part as you notice it',
                'Use a mental checklist if it helps',
                'Skip areas that feel uncomfortable'
            ]
        },
        {
            name: 'Temperature Grounding',
            description: 'Use temperature changes to anchor in the present',
            steps: [
                'Hold an ice cube or cold object',
                'Notice the sensation completely',
                'Splash cold water on your face',
                'Or hold a warm cup of tea/coffee',
                'Focus entirely on the temperature sensation'
            ],
            duration: 180,
            adhdAdaptations: [
                'Keep ice cubes or temperature objects handy',
                'Alternate between warm and cool',
                'Use strong temperature contrasts'
            ]
        }
    ];

    const handleGroundingComplete = () => {
        setSelectedTechnique(null);
        if (onComplete) {
            onComplete('grounding');
        }
    };

    if (selectedTechnique) {
        return (
            <InterventionAnimator 
                technique={selectedTechnique} 
                onComplete={handleGroundingComplete}
                onSkip={handleGroundingComplete}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-800 text-white relative overflow-hidden">
            {/* Ambient background effect */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
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
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            </div>
                            <span className="text-sm text-gray-400">Grounding Space</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="max-w-4xl w-full">
                        {/* Title */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                                Grounding Techniques
                            </h1>
                            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                These techniques help you reconnect with your body and the present moment when you're feeling overwhelmed or disconnected.
                            </p>
                        </div>

                        {/* Grounding Techniques Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {groundingTechniques.map((technique) => (
                                <button
                                    key={technique.name}
                                    onClick={() => setSelectedTechnique(technique)}
                                    className="group relative p-6 rounded-3xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:border-green-400/50 text-left transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm"
                                    style={{
                                        boxShadow: '0 8px 25px rgba(34, 197, 94, 0.2)'
                                    }}
                                >
                                    {/* Technique Name */}
                                    <h3 className="text-xl font-bold text-green-300 mb-3 group-hover:text-green-200 transition-colors duration-300">
                                        {technique.name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-gray-200 transition-colors duration-300">
                                        {technique.description}
                                    </p>

                                    {/* Duration and Steps Preview */}
                                    <div className="flex items-center justify-between text-xs text-green-400 mb-3">
                                        <span className="bg-green-500/20 px-2 py-1 rounded-full">
                                            ~{Math.floor(technique.duration / 60)} minutes
                                        </span>
                                        <span className="bg-green-500/20 px-2 py-1 rounded-full">
                                            {technique.steps.length} steps
                                        </span>
                                    </div>

                                    {/* ADHD Badge */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <SparklesIcon className="text-purple-400 w-3 h-3" />
                                        <span className="text-purple-300">ADHD-adapted</span>
                                    </div>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            ))}
                        </div>

                        {/* Tips */}
                        <div className="mt-12 text-center">
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 max-w-2xl mx-auto">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <SparklesIcon className="text-green-400" />
                                    <span className="text-green-300 font-medium">Grounding Tips</span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Grounding works best when you engage with it curiously rather than forcefully. 
                                    Notice what you discover without judging whether you're "doing it right."
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default QuickGrounding;

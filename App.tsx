import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Message, Sender, CrisisLevel, ConversationState, InterventionTechnique, GeminiResponse, ACTTechnique, GroundingTechnique, RAINMethod } from './types';
import { getEnhancedAIResponse, getContextualAIResponse } from './services/geminiService';
import { ACTInterventions, AdvancedCrisisInterventions, BreathingInterventions, GroundingTechniques } from './services/interventionService';
import { SendIcon, SparklesIcon, UserIcon, ShieldExclamationIcon } from './components/Icons';
import InterventionCard from './components/InterventionCard';
import BreathingAnimator from './components/BreathingAnimator';
import InterventionAnimator from './components/InterventionAnimator';
import CrisisResourcesComponent from './components/CrisisResources';
import LandingPage from './components/LandingPage';
import MeditativeSpace from './components/MeditativeSpace';
import EntryPoints from './components/EntryPoints';
import QuickBreathing from './components/QuickBreathing';
import QuickGrounding from './components/QuickGrounding';
import AppShell from './components/AppShell';
// Clerk imports commented out until configured
// import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { UserOnboarding } from './src/components/UserOnboarding';
import { MemoryCreation } from './src/components/MemoryCreation';
import { MemoryService } from './src/services/memoryService';
import { UserProfile } from './src/types/memory.types';
import './src/styles/Modal.css';

const initialMessage: Message = {
    id: 'initial',
    sender: Sender.AI,
    text: "Hi there! I'm Helen. I'm here to support you through whatever you're experiencing. I understand that emotions can feel really intense sometimes, especially if you have an ADHD brain.\n\nWhat's bringing you here today?",
    timestamp: new Date().toISOString(),
};

type BreathingPattern = {
    name: string;
    steps: { label: string; duration: number }[];
}

const App: React.FC = () => {
    const [showLandingPage, setShowLandingPage] = useState(true);
    const [showEntryPoints, setShowEntryPoints] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showMemoryCreation, setShowMemoryCreation] = useState(false);
    const [memoryCreationData, setMemoryCreationData] = useState<{
        suggestedInitial?: string;
        suggestedReframe?: string;
        detectedInsights?: string[];
        rsdStage?: string;
    }>({});
    const [appMode, setAppMode] = useState<'chat' | 'breathing' | 'grounding' | 'crisis' | 'meditate' | null>(null);
    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [crisisLevel, setCrisisLevel] = useState<CrisisLevel>(CrisisLevel.NONE);
    const [conversationState, setConversationState] = useState<ConversationState>(ConversationState.GREETING);
    const [availableInterventions, setAvailableInterventions] = useState<InterventionTechnique[]>([]);
    const [activeIntervention, setActiveIntervention] = useState<BreathingPattern | null>(null);
    const [activeAdvancedIntervention, setActiveAdvancedIntervention] = useState<ACTTechnique | GroundingTechnique | RAINMethod | null>(null);
    const [showCrisisResources, setShowCrisisResources] = useState(false);
    const [showMeditativeSpace, setShowMeditativeSpace] = useState(false);
    const [sessionId] = useState(() => crypto.randomUUID());
    const [attentionFadeDetected, setAttentionFadeDetected] = useState(false);
    const [previousActivity, setPreviousActivity] = useState<'breathing' | 'grounding' | 'chat' | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Check for existing user profile on mount
    useEffect(() => {
        const checkUserProfile = async () => {
            const profile = await MemoryService.getUserProfile();
            if (profile) {
                setUserProfile(profile);
            }
        };
        checkUserProfile();
    }, []);

    const handleSendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            sender: Sender.User,
            text,
            timestamp: new Date().toISOString(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);
        setAvailableInterventions([]);

        // Use enhanced contextual AI response that includes full layered context system
        const aiResponse: GeminiResponse = await getContextualAIResponse(newMessages, sessionId, previousActivity);

        setIsLoading(false);
        
        const aiMessage: Message = {
            id: crypto.randomUUID(),
            sender: Sender.AI,
            text: aiResponse.responseText,
            timestamp: new Date().toISOString(),
        };

        if (aiResponse.adhdValidation) {
            const validationMessage: Message = {
                 id: crypto.randomUUID(),
                 sender: Sender.System,
                 text: aiResponse.adhdValidation,
                 timestamp: new Date().toISOString(),
            }
             setMessages(prev => [...prev, validationMessage]);
        }
        
        setMessages(prev => [...prev, aiMessage]);
        
        setCrisisLevel(aiResponse.detectedCrisisLevel);
        setConversationState(aiResponse.conversationStateUpdate);

        if (aiResponse.suggestedInterventions && aiResponse.suggestedInterventions.length > 0) {
            setAvailableInterventions(aiResponse.suggestedInterventions);
        }

    }, [isLoading, messages]);
    
    const handleCrisisButton = () => {
        handleSendMessage("I'm in crisis and need help now.");
    };

    const handleInterventionSelect = (intervention: InterventionTechnique) => {
        setAvailableInterventions([]);
        if (intervention.name === 'Box Breathing') {
            setActiveIntervention({
                name: 'Box Breathing',
                steps: [
                    { label: 'Breathe In', duration: 4 },
                    { label: 'Hold', duration: 4 },
                    { label: 'Breathe Out', duration: 4 },
                    { label: 'Hold', duration: 4 },
                ]
            });
        } else if (intervention.name === '4-7-8 Breathing') {
             setActiveIntervention({
                name: '4-7-8 Breathing',
                steps: [
                    { label: 'Breathe In', duration: 4 },
                    { label: 'Hold', duration: 7 },
                    { label: 'Breathe Out', duration: 8 },
                ]
            });
        } else {
            handleSendMessage(`Let's try the "${intervention.name}" technique.`);
        }
    }

    const handleInterventionComplete = () => {
        setActiveIntervention(null);
        const systemMessage: Message = {
            id: crypto.randomUUID(),
            sender: Sender.System,
            text: "Breathing exercise complete. Let's check in.",
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, systemMessage]);
        handleSendMessage("How are you feeling now?");
    }

    const renderMessage = (msg: Message) => {
        const isUser = msg.sender === Sender.User;
        const isSystem = msg.sender === Sender.System;

        if (isSystem) {
             return (
                <div key={msg.id} className="my-2 flex items-center justify-center gap-2 text-xs text-purple-400 italic">
                    <SparklesIcon/>
                    <span>{msg.text}</span>
                    <SparklesIcon/>
                </div>
            )
        }

        return (
            <div key={msg.id} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"><SparklesIcon /></div>}
                <div
                    className={`max-w-md rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm ${
                        isUser ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-br-none' : 'bg-gray-800/80 text-gray-200 rounded-bl-none border border-gray-700/50'
                    }`}
                    style={{
                        boxShadow: isUser ? '0 4px 15px rgba(236, 72, 153, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
                </div>
                 {isUser && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg"><UserIcon /></div>}
            </div>
        );
    };

    const isHandoff = conversationState === ConversationState.HUMAN_HANDOFF;

    const handleEnterApp = () => {
        setShowLandingPage(false);
        if (!userProfile) {
            setShowOnboarding(true);
        } else {
            setShowEntryPoints(true);
        }
    };

    const handleSelectMode = (mode: 'chat' | 'breathing' | 'grounding' | 'crisis' | 'meditate') => {
        setShowEntryPoints(false);
        setAppMode(mode);
        
        if (mode === 'crisis') {
            setShowCrisisResources(true);
        } else if (mode === 'meditate') {
            setShowMeditativeSpace(true);
        } else if (mode === 'chat') {
            // If starting chat, we'll use the previous activity info later
            // The geminiService will detect any completed activities and skip to Phase 2
        }
    };

    const handleActivityComplete = (activityType: 'breathing' | 'grounding') => {
        setPreviousActivity(activityType);
        setAppMode('chat');
        
        // Add a system message indicating the activity was completed
        const completionMessage: Message = {
            id: crypto.randomUUID(),
            sender: Sender.System,
            text: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} activity completed! Let's continue with a conversation.`,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, completionMessage]);
        
        // Update the initial message to acknowledge the completed activity
        const transitionMessage: Message = {
            id: crypto.randomUUID(),
            sender: Sender.AI,
            text: `I see you just completed a ${activityType} exercise - that's wonderful! How are you feeling now? Since you've already done some self-care, we can focus on connecting and talking about what's on your mind.`,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, transitionMessage]);
    };

    const handleBackToEntryPoints = () => {
        setAppMode(null);
        setShowEntryPoints(true);
        setShowMeditativeSpace(false);
        setShowCrisisResources(false);
    };

    const handleProfileComplete = (profile: UserProfile) => {
        setUserProfile(profile);
        setShowOnboarding(false);
        setShowEntryPoints(true);
        
        // Update initial message with user's name
        const personalizedGreeting: Message = {
            id: 'initial-personalized',
            sender: Sender.AI,
            text: `Hi ${profile.name}! I'm Helen. I'm here to support you through whatever you're experiencing. I understand that emotions can feel really intense sometimes, especially if you have an ADHD brain.\n\nWhat's bringing you here today?`,
            timestamp: new Date().toISOString(),
        };
        setMessages([personalizedGreeting]);
    };

    const handleMemoryCreationComplete = (memory: any) => {
        setShowMemoryCreation(false);
        if (memory) {
            // Show success message
            const successMessage: Message = {
                id: crypto.randomUUID(),
                sender: Sender.System,
                text: "✨ Your reflection has been saved. You can view it anytime in your journal.",
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, successMessage]);
        }
    };

    // Show landing page first
    if (showLandingPage) {
        return (
            <AppShell showOrb={true} orbConfig={{ hue: -10, hoverIntensity: 0.15, opacity: 0.3 }}>
                <LandingPage onEnterApp={handleEnterApp} />
            </AppShell>
        );
    }

    // Show onboarding if needed
    if (showOnboarding) {
        return (
            <AppShell orbConfig={{ hue: 270, hoverIntensity: 0.2, opacity: 0.25 }}>
                <UserOnboarding onComplete={handleProfileComplete} isFirstTime={!userProfile} />
            </AppShell>
        );
    }

    // Show entry points selection
    if (showEntryPoints) {
        return (
            <AppShell>
                <EntryPoints onSelectMode={handleSelectMode} />
            </AppShell>
        );
    }

    // Show specific mode components
    if (appMode === 'breathing') {
        return (
            <AppShell orbConfig={{ hue: 180, hoverIntensity: 0.2, opacity: 0.2 }}>
                <QuickBreathing onBack={handleBackToEntryPoints} onComplete={handleActivityComplete} />
            </AppShell>
        );
    }

    if (appMode === 'grounding') {
        return (
            <AppShell orbConfig={{ hue: 120, hoverIntensity: 0.15, opacity: 0.2 }}>
                <QuickGrounding onBack={handleBackToEntryPoints} onComplete={handleActivityComplete} />
            </AppShell>
        );
    }

    // Show crisis resources if needed
    if (showCrisisResources) {
        return (
            <AppShell orbConfig={{ hue: 0, hoverIntensity: 0.1, opacity: 0.15 }}>
                <CrisisResourcesComponent 
                    isVisible={showCrisisResources} 
                    onClose={handleBackToEntryPoints} 
                />
            </AppShell>
        );
    }

    // Show meditative space modal
    if (showMeditativeSpace) {
        return (
            <AppShell orbConfig={{ hue: 240, hoverIntensity: 0.1, opacity: 0.15 }}>
                <MeditativeSpace 
                    isVisible={showMeditativeSpace}
                    onClose={handleBackToEntryPoints}
                />
            </AppShell>
        );
    }

    // Show chat interface
    if (appMode === 'chat') {
        return (
        <AppShell>
            {showMemoryCreation && userProfile && (
                <div className="modal-overlay" onClick={() => setShowMemoryCreation(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <MemoryCreation
                            userId={userProfile.id}
                            userName={userProfile.name}
                            suggestedInitial={memoryCreationData.suggestedInitial}
                            suggestedReframe={memoryCreationData.suggestedReframe}
                            detectedInsights={memoryCreationData.detectedInsights}
                            rsdStage={memoryCreationData.rsdStage}
                            onComplete={handleMemoryCreationComplete}
                            onCancel={() => setShowMemoryCreation(false)}
                        />
                    </div>
                </div>
            )}
            {activeAdvancedIntervention && (
                <InterventionAnimator 
                    technique={activeAdvancedIntervention} 
                    onComplete={() => setActiveAdvancedIntervention(null)}
                    onSkip={() => setActiveAdvancedIntervention(null)}
                />
            )}
            <div className="relative z-10 flex h-screen flex-col">
            {activeIntervention && <BreathingAnimator pattern={activeIntervention} onComplete={handleInterventionComplete} cycles={4} />}
            <header className="flex items-center justify-between p-4 border-b border-gray-700/30 glass shadow-lg">
                <div className="flex items-center gap-3">
                    {appMode === 'chat' && (
                        <button 
                            onClick={handleBackToEntryPoints}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 mr-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                            </svg>
                        </button>
                    )}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">H</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                            <SparklesIcon className="text-purple-400"/> Helen
                        </h1>
                        <p className="text-xs text-gray-400">by SepiidAI</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {userProfile && (
                        <button 
                            onClick={() => setShowOnboarding(true)}
                            className="secondary rounded-full"
                            title="Update profile and preferences"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            Profile
                        </button>
                    )}
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-medium py-2 px-4 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M10 17l5-5-5-5v10z"/>
                                </svg>
                                Sign in
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/"/>
                    </SignedIn>
                    <button 
                        onClick={() => setShowMeditativeSpace(true)}
                        className="secondary rounded-full"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Meditate
                    </button>
                    {userProfile && messages.length > 3 && (
                        <button 
                            onClick={() => setShowMemoryCreation(true)}
                            className="secondary rounded-full"
                            title="Create a reflection"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                            </svg>
                            Reflect
                        </button>
                    )}
                    <button 
                        onClick={handleCrisisButton}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-full animate-pulse"
                    >
                        <ShieldExclamationIcon/> Help Now
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map(renderMessage)}
                {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"><SparklesIcon /></div>
                        <div className="max-w-md rounded-2xl px-4 py-3 shadow-lg bg-gray-800/80 backdrop-blur-sm text-gray-200 rounded-bl-none border border-gray-700/50">
                            <div className="flex items-center justify-center space-x-1">
                                <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.3s]"></div>
                                <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.15s]"></div>
                                <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>

            {availableInterventions.length > 0 && !isHandoff && (
                <div className="p-4 border-t border-gray-700/30 glass">
                    <p className="text-center text-sm text-gray-300 mb-3 text-enter">Here are a few options that might help. What feels most doable?</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {availableInterventions.map((int, index) => (
                           <InterventionCard key={index} intervention={int} onSelect={() => handleInterventionSelect(int)} />
                        ))}
                    </div>
                </div>
            )}

            <footer className="p-4 border-t border-gray-700/30 glass">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage(userInput);
                    }}
                    className="flex items-center gap-3"
                >
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={isHandoff ? "Please contact emergency services." : "How are you feeling right now?"}
                        className="flex-1"
                        disabled={isLoading || isHandoff}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim() || isHandoff}
                        className="primary rounded-2xl p-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <SendIcon />
                        )}
                    </button>
                </form>
            </footer>
            </div>
        </AppShell>
        );
    }

    // Default fallback - show entry points
    return (
        <AppShell>
            <EntryPoints onSelectMode={handleSelectMode} />
        </AppShell>
    );
};

export default App;

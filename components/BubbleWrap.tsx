import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';

interface BubbleWrapProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Bubble {
  id: string;
  popped: boolean;
  x: number;
  y: number;
}

const BubbleWrap: React.FC<BubbleWrapProps> = ({ isVisible, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Initialize bubbles grid
  useEffect(() => {
    if (isVisible && bubbles.length === 0) {
      const newBubbles: Bubble[] = [];
      const rows = 10; // Reduced for better spacing
      const cols = 14; // Reduced for better spacing
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          newBubbles.push({
            id: `${row}-${col}`,
            popped: false,
            x: col,
            y: row
          });
        }
      }
      
      setBubbles(newBubbles);
    }
  }, [isVisible, bubbles.length]);

  // Check for completion
  useEffect(() => {
    if (bubbles.length > 0 && poppedCount === bubbles.length) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        // Reset after celebration
        setTimeout(() => {
          setBubbles([]);
          setPoppedCount(0);
        }, 1000);
      }, 3000);
    }
  }, [poppedCount, bubbles.length]);

  const popBubble = (bubbleId: string) => {
    setBubbles(prev => 
      prev.map(bubble => 
        bubble.id === bubbleId && !bubble.popped
          ? { ...bubble, popped: true }
          : bubble
      )
    );
    
    setPoppedCount(prev => prev + 1);
    
    // Enhanced pop sound effect simulation with haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([15, 5, 10]); // More complex vibration pattern
    }
    
    // Find the bubble element and animate it with enhanced effects
    const bubbleElement = document.getElementById(`bubble-${bubbleId}`);
    if (bubbleElement) {
      // Create pop explosion effect
      gsap.timeline()
        .to(bubbleElement, {
          scale: 1.3,
          duration: 0.1,
          ease: "power2.out"
        })
        .to(bubbleElement, {
          scale: 0,
          rotation: 180,
          duration: 0.2,
          ease: "back.in(2)"
        }, 0.1)
        .to(bubbleElement, {
          opacity: 0,
          duration: 0.1
        }, 0.2);
      
      // Add sparkle effect
      const sparkles = document.createElement('div');
      sparkles.className = 'absolute pointer-events-none';
      sparkles.innerHTML = '✨';
      sparkles.style.left = '50%';
      sparkles.style.top = '50%';
      sparkles.style.transform = 'translate(-50%, -50%)';
      sparkles.style.fontSize = '12px';
      bubbleElement.appendChild(sparkles);
      
      gsap.to(sparkles, {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => sparkles.remove()
      });
    }
  };

  const resetBubbles = () => {
    setBubbles([]);
    setPoppedCount(0);
    setShowCelebration(false);
  };

  const popRandomBubbles = () => {
    const unpoppedBubbles = bubbles.filter(b => !b.popped);
    const bubblesToPopCount = Math.min(10, unpoppedBubbles.length);
    
    for (let i = 0; i < bubblesToPopCount; i++) {
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * unpoppedBubbles.length);
        if (unpoppedBubbles[randomIndex]) {
          popBubble(unpoppedBubbles[randomIndex].id);
          unpoppedBubbles.splice(randomIndex, 1);
        }
      }, i * 50);
    }
  };

  if (!isVisible) return null;

  const progress = bubbles.length > 0 ? (poppedCount / bubbles.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full h-full max-w-6xl max-h-4xl">
        {/* Header */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-6 py-3 shadow-xl">
            <h2 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent text-center mb-2">
              Bubble Wrap Popping
            </h2>
            <div className="flex items-center gap-4">
              <p className="text-gray-300 text-sm">
                Popped: {poppedCount}/{bubbles.length}
              </p>
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={popRandomBubbles}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-lg"
          >
            Pop 10!
          </button>
          <button
            onClick={resetBubbles}
            className="px-4 py-2 rounded-xl transition-all duration-300 shadow-lg text-white"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #ff8787, #ff6b6b, #e55353)',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2), 0 8px 20px rgba(255,107,107,0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'radial-gradient(circle at 30% 30%, #ff9999, #ff7979, #e66767)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'radial-gradient(circle at 30% 30%, #ff8787, #ff6b6b, #e55353)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl transition-all duration-300 shadow-lg text-white"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #ff8787, #ff6b6b, #e55353)',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2), 0 8px 20px rgba(255,107,107,0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'radial-gradient(circle at 30% 30%, #ff9999, #ff7979, #e66767)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'radial-gradient(circle at 30% 30%, #ff8787, #ff6b6b, #e55353)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            Done
          </button>
        </div>

        {/* Bubble Wrap Container */}
        <div 
          ref={containerRef}
          className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-800 rounded-3xl border border-gray-700/30 overflow-hidden p-8 flex items-center justify-center"
        >
          {/* Bubble Grid */}
          <div 
            className="grid gap-3 select-none"
            style={{ 
              gridTemplateColumns: 'repeat(14, 1fr)',
              gridTemplateRows: 'repeat(10, 1fr)'
            }}
          >
            {bubbles.map((bubble) => (
              <div
                key={bubble.id}
                id={`bubble-${bubble.id}`}
                className={`
                  w-10 h-10 rounded-full cursor-pointer transition-all duration-200 relative group
                  ${bubble.popped 
                    ? 'bg-transparent border-2 border-dashed border-gray-600/30' 
                    : 'bg-gradient-to-br from-blue-100 via-blue-50 to-white shadow-lg hover:shadow-2xl transform hover:scale-110 active:scale-95'
                  }
                `}
                onClick={() => !bubble.popped && popBubble(bubble.id)}
                onMouseDown={() => {
                  if (!bubble.popped) {
                    const element = document.getElementById(`bubble-${bubble.id}`);
                    if (element) {
                      gsap.to(element, { scale: 0.9, duration: 0.1 });
                    }
                  }
                }}
                onMouseUp={() => {
                  if (!bubble.popped) {
                    const element = document.getElementById(`bubble-${bubble.id}`);
                    if (element) {
                      gsap.to(element, { scale: 1, duration: 0.1 });
                    }
                  }
                }}
                style={{
                  boxShadow: bubble.popped 
                    ? 'none' 
                    : 'inset 0 3px 6px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(59,130,246,0.2), 0 6px 12px rgba(59,130,246,0.3)',
                  background: bubble.popped
                    ? 'transparent'
                    : 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.9), rgba(147,197,253,0.7), rgba(59,130,246,0.5))',
                }}
              >
                {!bubble.popped && (
                  <>
                    {/* Multiple highlights for enhanced 3D effect */}
                    <div 
                      className="absolute bg-white/90 rounded-full" 
                      style={{
                        top: '15%',
                        left: '25%',
                        width: '25%',
                        height: '25%'
                      }}
                    />
                    <div 
                      className="absolute bg-white/60 rounded-full" 
                      style={{
                        top: '20%',
                        left: '50%',
                        width: '15%',
                        height: '15%'
                      }}
                    />
                    {/* Enhanced bubble reflection */}
                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/50 via-transparent to-blue-200/30" />
                    
                    {/* Outer rim for depth */}
                    <div className="absolute inset-0 rounded-full border border-blue-200/40" />
                    
                    {/* Inner glow */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/0 to-blue-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </>
                )}
                
                {bubble.popped && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400 text-xs opacity-50">💥</span>
                  </div>
                )}
              </div>
            ))
          }
          </div>
        </div>

        {/* Celebration */}
        {showCelebration && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-3xl shadow-2xl animate-bounce">
              <h3 className="text-3xl font-bold text-center mb-2">🎉 Amazing! 🎉</h3>
              <p className="text-lg text-center">You popped all the bubbles!</p>
            </div>
            
            {/* Confetti */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d'][Math.floor(Math.random() * 5)],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-2">
            <p className="text-gray-300 text-sm text-center">
              Click on the bubbles to pop them! 💥 Try to pop them all for a surprise
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BubbleWrap;
import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';

interface StressBallProps {
  isVisible: boolean;
  onClose: () => void;
}

const StressBall: React.FC<StressBallProps> = ({ isVisible, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSqueezing, setIsSqueezing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  // Physics constants
  const friction = 0.95;
  const bounce = 0.8;
  const gravity = 0.3;
  const returnForce = 0.02; // Force that pulls ball back to center

  useEffect(() => {
    if (isVisible && ballRef.current) {
      // Initial bounce-in animation
      gsap.fromTo(ballRef.current, 
        { 
          scale: 0,
          x: position.x,
          y: position.y,
        },
        { 
          scale: 1,
          duration: 0.8,
          ease: "bounce.out"
        }
      );
    }
  }, [isVisible]);

  // Physics animation loop
  useEffect(() => {
    if (!isVisible || isDragging) return;

    const animate = () => {
      if (!containerRef.current || !ballRef.current) return;

      const container = containerRef.current.getBoundingClientRect();
      const ballSize = 120; // Bigger ball diameter
      
      // Apply gravity only when ball is not near center
      const centerX = 0;
      const centerY = 0;
      const distanceFromCenter = Math.sqrt(position.x * position.x + position.y * position.y);
      
      if (distanceFromCenter > 50) {
        // Apply gentle gravity when away from center
        setVelocity(prev => ({ ...prev, y: prev.y + gravity }));
      }
      
      // Apply return force when ball is far from center
      if (distanceFromCenter > 100) {
        const returnX = -position.x * returnForce;
        const returnY = -position.y * returnForce;
        setVelocity(prev => ({ 
          x: prev.x + returnX, 
          y: prev.y + returnY 
        }));
      }
      
      // Update position
      setPosition(prev => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        
        // Boundary collision detection with squish effect
        if (newX <= -container.width/2 + ballSize/2) {
          newX = -container.width/2 + ballSize/2;
          setVelocity(v => ({ ...v, x: -v.x * bounce }));
          // Trigger squish effect
          if (ballRef.current) {
            gsap.to(ballRef.current, { scaleX: 0.7, scaleY: 1.3, duration: 0.1, yoyo: true, repeat: 1 });
          }
        }
        if (newX >= container.width/2 - ballSize/2) {
          newX = container.width/2 - ballSize/2;
          setVelocity(v => ({ ...v, x: -v.x * bounce }));
          if (ballRef.current) {
            gsap.to(ballRef.current, { scaleX: 0.7, scaleY: 1.3, duration: 0.1, yoyo: true, repeat: 1 });
          }
        }
        if (newY <= -container.height/2 + ballSize/2) {
          newY = -container.height/2 + ballSize/2;
          setVelocity(v => ({ ...v, y: -v.y * bounce }));
          if (ballRef.current) {
            gsap.to(ballRef.current, { scaleX: 1.3, scaleY: 0.7, duration: 0.1, yoyo: true, repeat: 1 });
          }
        }
        if (newY >= container.height/2 - ballSize/2) {
          newY = container.height/2 - ballSize/2;
          setVelocity(v => ({ ...v, y: -v.y * bounce }));
          if (ballRef.current) {
            gsap.to(ballRef.current, { scaleX: 1.3, scaleY: 0.7, duration: 0.1, yoyo: true, repeat: 1 });
          }
        }
        
        return { x: newX, y: newY };
      });
      
      // Apply friction
      setVelocity(prev => ({
        x: prev.x * friction,
        y: prev.y * friction
      }));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, isDragging, velocity.x, velocity.y, position.x, position.y]);

  // Update ball position
  useEffect(() => {
    if (ballRef.current && !isDragging) {
      gsap.set(ballRef.current, {
        x: position.x,
        y: position.y,
        scale: isSqueezing ? 0.6 : 1,
        scaleX: isSqueezing ? 0.6 : 1,
        scaleY: isSqueezing ? 0.6 : 1
      });
    }
  }, [position, isSqueezing, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsSqueezing(true);
    setVelocity({ x: 0, y: 0 });
    
    if (ballRef.current) {
      gsap.to(ballRef.current, { 
        scale: 0.5, 
        scaleX: 0.5, 
        scaleY: 0.5, 
        duration: 0.2, 
        ease: "power2.out" 
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const centerX = container.left + container.width / 2;
    const centerY = container.top + container.height / 2;
    
    const newX = e.clientX - centerX;
    const newY = e.clientY - centerY;
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setIsSqueezing(false);
    
    // Calculate throw velocity based on mouse movement
    const throwPower = 25; // Increased throw power
    setVelocity({
      x: (Math.random() - 0.5) * throwPower,
      y: (Math.random() - 0.5) * throwPower
    });
    
    if (ballRef.current) {
      gsap.to(ballRef.current, { 
        scale: 1, 
        scaleX: 1, 
        scaleY: 1, 
        duration: 0.3, 
        ease: "back.out(1.7)" 
      });
    }
  };

  const handleThrow = () => {
    const throwPower = 30;
    setVelocity({
      x: (Math.random() - 0.5) * throwPower,
      y: -Math.abs(Math.random()) * throwPower
    });
    
    // Add extra bounce effect
    if (ballRef.current) {
      gsap.to(ballRef.current, { 
        scale: 1.2, 
        duration: 0.1, 
        yoyo: true, 
        repeat: 1,
        ease: "power2.out" 
      });
    }
  };

  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setVelocity({ x: 0, y: 0 });
    
    if (ballRef.current) {
      gsap.to(ballRef.current, { 
        x: 0, 
        y: 0, 
        scale: 1, 
        duration: 0.5, 
        ease: "back.out(1.7)" 
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-4xl max-h-3xl">
        {/* Header */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-6 py-3 shadow-xl">
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent text-center mb-2">
              Interactive Stress Ball
            </h2>
            <p className="text-gray-300 text-sm text-center">
              Click and drag to squeeze and throw • Watch it bounce around
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleThrow}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-lg"
          >
            Throw
          </button>
          <button
            onClick={handleReset}
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

        {/* Play Area */}
        <div 
          ref={containerRef}
          className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 rounded-3xl border border-gray-700/30 overflow-hidden cursor-pointer relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Stress Ball */}
          <div
            ref={ballRef}
            className="absolute w-30 h-30 rounded-full cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: '50%',
              top: '50%',
              width: '120px',
              height: '120px',
              background: isSqueezing 
                ? 'radial-gradient(circle at 25% 25%, #ff4444, #dd1111, #bb0000)'
                : 'radial-gradient(circle at 30% 30%, #ff8787, #ff6b6b, #e55353)',
              boxShadow: isSqueezing
                ? 'inset 0 0 30px rgba(0,0,0,0.4), 0 8px 20px rgba(255,107,107,0.6)'
                : 'inset 0 0 15px rgba(0,0,0,0.2), 0 15px 35px rgba(255,107,107,0.7)',
              filter: isSqueezing ? 'brightness(0.8)' : 'brightness(1.2)',
              transition: 'all 0.1s ease-out'
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Ball texture - more prominent */}
            <div className="absolute inset-0 rounded-full opacity-30">
              <div className="absolute inset-3 rounded-full border-3 border-white/40"></div>
              <div className="absolute inset-6 rounded-full border-2 border-white/30"></div>
              <div className="absolute inset-9 rounded-full border border-white/20"></div>
            </div>
            
            {/* Enhanced highlight for 3D effect */}
            <div 
              className="absolute rounded-full bg-gradient-to-br from-white/50 to-transparent" 
              style={{
                top: '15%',
                left: '20%',
                width: '40%',
                height: '40%'
              }}
            ></div>
            
            {/* Squeeze effect */}
            {isSqueezing && (
              <>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent animate-pulse"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-400/20 to-transparent animate-ping"></div>
              </>
            )}
          </div>

          {/* Bounce trails */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-orange-400/30 animate-ping"
                style={{
                  left: `${50 + Math.sin(Date.now() / 1000 + i) * 30}%`,
                  top: `${50 + Math.cos(Date.now() / 1000 + i) * 30}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-2">
            <p className="text-gray-300 text-sm text-center">
              {isDragging ? "🤏 Squeezing..." : "Click and drag the ball to squeeze and throw it around!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StressBall;
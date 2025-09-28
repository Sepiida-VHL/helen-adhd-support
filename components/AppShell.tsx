import React, { useEffect, useRef, useState } from 'react';
import Orb from './Orb';
import { theme, getCSSVariables } from '../styles/theme';

interface AppShellProps {
  children: React.ReactNode;
  showOrb?: boolean;
  orbConfig?: {
    hue?: number;
    hoverIntensity?: number;
    rotateOnHover?: boolean;
    opacity?: number;
  };
}

const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  showOrb = true,
  orbConfig = {
    hue: 0,
    hoverIntensity: 0.15,
    rotateOnHover: false,
    opacity: 0.25
  }
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Apply theme CSS variables on mount
  useEffect(() => {
    const cssVars = getCSSVariables();
    const root = document.documentElement;
    
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Handle page transitions
  const handleTransition = () => {
    if (reduceMotion) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
    }, parseInt(theme.animation.duration.base));
  };

  // Observe content changes for smooth transitions
  useEffect(() => {
    const observer = new MutationObserver(() => {
      handleTransition();
    });

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: false
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="helen-app-shell min-h-screen relative overflow-hidden">
      {/* Persistent orb background */}
      {showOrb && (
        <div 
          className="orb-background fixed inset-0 pointer-events-none"
          style={{ 
            opacity: orbConfig.opacity,
            zIndex: theme.zIndex[60]
          }}
        >
          <div className="absolute inset-0">
            <Orb 
              hue={orbConfig.hue}
              hoverIntensity={orbConfig.hoverIntensity}
              rotateOnHover={orbConfig.rotateOnHover}
              forceHoverState={true}
            />
          </div>
        </div>
      )}

      {/* Ambient particles for depth */}
      <div className="ambient-particles fixed inset-0 pointer-events-none opacity-20" style={{ zIndex: theme.zIndex[50] }}>
        <div 
          className="particle absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${theme.colors.secondary[500]}20, transparent)`,
            animationDuration: '8s'
          }}
        />
        <div 
          className="particle absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full blur-3xl animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${theme.colors.accent.pink.default}15, transparent)`,
            animationDelay: '2s',
            animationDuration: '10s'
          }}
        />
        <div 
          className="particle absolute top-1/2 right-1/4 w-32 h-32 rounded-full blur-2xl animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${theme.colors.primary[400]}10, transparent)`,
            animationDelay: '4s',
            animationDuration: '12s'
          }}
        />
      </div>

      {/* Main content with transition effects */}
      <div 
        ref={contentRef}
        className={`app-content relative z-70 ${isTransitioning ? 'transitioning' : ''}`}
        style={{ zIndex: theme.zIndex[70] }}
      >
        {children}
      </div>

      {/* Global styles for the shell */}
      <style jsx global>{`
        /* Import global styles */
        @import url('/styles/globals.css');
        
        /* Helen app specific overrides */
        .helen-app-shell {
          background: ${theme.colors.background.primary};
          font-family: ${theme.typography.fontFamily.sans};
          color: ${theme.colors.gray[100]};
        }

        /* Smooth content transitions */
        .app-content {
          transition: opacity ${theme.animation.duration.base} ${theme.animation.easing.gentle},
                      transform ${theme.animation.duration.base} ${theme.animation.easing.gentle};
        }

        .app-content.transitioning {
          opacity: 0.9;
          transform: scale(0.99);
        }

        /* Text entrance animations */
        .helen-app-shell h1,
        .helen-app-shell h2,
        .helen-app-shell h3,
        .helen-app-shell h4,
        .helen-app-shell h5,
        .helen-app-shell h6 {
          animation: textEnter ${theme.animation.duration.slow} ${theme.animation.easing.gentle} forwards;
        }

        .helen-app-shell p,
        .helen-app-shell li {
          animation: textEnter ${theme.animation.duration.slower} ${theme.animation.easing.gentle} forwards;
          animation-delay: 100ms;
        }

        /* General button styles - lower specificity */
        .helen-app-shell button:not([class*="bg-"]) {
          background: ${theme.colors.background.soft};
          color: ${theme.colors.gray[900]};
          border-radius: ${theme.borderRadius.xl};
          padding: ${theme.spacing[3]} ${theme.spacing[6]};
          font-weight: ${theme.typography.fontWeight.medium};
          box-shadow: ${theme.shadows.md};
          backdrop-filter: blur(${theme.blur.sm});
          transition: all ${theme.animation.duration.base} ${theme.animation.easing.gentle};
          position: relative;
          overflow: hidden;
        }

        .helen-app-shell button:not([class*="bg-"]):hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: ${theme.shadows.lg}, ${theme.shadows.glow.purple};
        }

        .helen-app-shell button:not([class*="bg-"]):active {
          transform: translateY(0) scale(0.98);
        }

        /* Primary buttons */
        .helen-app-shell button.primary {
          background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.primary[600]});
          color: white;
        }

        .helen-app-shell button.primary:hover {
          background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[700]});
        }

        /* Pink buttons - high specificity to override */
        .helen-app-shell button.bg-pink-600,
        .helen-app-shell .bg-pink-600 {
          background: #db2777 !important;
          background-color: #db2777 !important;
          background-image: none !important;
          color: white !important;
          border: none !important;
          padding: 0.75rem 1.5rem !important;
          border-radius: 9999px !important;
          font-weight: 700 !important;
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .helen-app-shell button.bg-pink-600:hover,
        .helen-app-shell .bg-pink-600:hover {
          background: #be185d !important;
          background-color: #be185d !important;
          background-image: none !important;
          transform: translateY(-2px) scale(1.02) !important;
        }

        .helen-app-shell button.bg-pink-600:disabled,
        .helen-app-shell .bg-pink-600:disabled {
          background: #374151 !important;
          background-color: #374151 !important;
          background-image: none !important;
          opacity: 0.5 !important;
          transform: none !important;
        }

        .helen-app-shell button.bg-pink-600:active,
        .helen-app-shell .bg-pink-600:active {
          background: #9d174d !important;
          background-color: #9d174d !important;
          background-image: none !important;
          transform: translateY(0) scale(0.98) !important;
        }

        /* Secondary buttons - stress ball style */
        .helen-app-shell button.secondary {
          background: radial-gradient(circle at 30% 30%, #ff8787, #ff6b6b, #e55353);
          color: white;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.2), 0 10px 25px rgba(255,107,107,0.3);
          border: 2px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }
        
        .helen-app-shell button.secondary::before {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: inherit;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 70%);
          pointer-events: none;
        }
        
        .helen-app-shell button.secondary:hover {
          background: radial-gradient(circle at 30% 30%, #ff9999, #ff7979, #e66767);
          box-shadow: inset 0 0 15px rgba(0,0,0,0.25), 0 15px 30px rgba(255,107,107,0.4);
          transform: translateY(-3px) scale(1.05);
          border-color: rgba(255, 255, 255, 0.3);
        }
        
        .helen-app-shell button.secondary:active {
          background: radial-gradient(circle at 30% 30%, #ff5757, #ff4444, #d63333);
          box-shadow: inset 0 0 20px rgba(0,0,0,0.3), 0 5px 15px rgba(255,107,107,0.5);
          transform: translateY(-1px) scale(0.97);
        }

        /* Glass card styles */
        .helen-app-shell .card {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(${theme.blur.md});
          -webkit-backdrop-filter: blur(${theme.blur.md});
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: ${theme.borderRadius.xl};
          padding: ${theme.spacing[6]};
          box-shadow: ${theme.shadows.lg};
          transition: all ${theme.animation.duration.base} ${theme.animation.easing.gentle};
        }

        .helen-app-shell .card:hover {
          transform: translateY(-4px);
          box-shadow: ${theme.shadows.xl};
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Input styles */
        .helen-app-shell input,
        .helen-app-shell textarea {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: ${theme.borderRadius.lg};
          padding: ${theme.spacing[3]} ${theme.spacing[4]};
          color: ${theme.colors.gray[100]};
          font-family: ${theme.typography.fontFamily.sans};
          transition: all ${theme.animation.duration.fast} ${theme.animation.easing.gentle};
          backdrop-filter: blur(${theme.blur.sm});
        }

        .helen-app-shell input:focus,
        .helen-app-shell textarea:focus {
          outline: none;
          border-color: ${theme.colors.primary[400]};
          box-shadow: 0 0 0 3px ${theme.colors.primary[400]}20;
          background: rgba(30, 41, 59, 0.6);
        }

        .helen-app-shell input::placeholder,
        .helen-app-shell textarea::placeholder {
          color: ${theme.colors.gray[400]};
        }

        /* Gradient text */
        .helen-app-shell .gradient-text {
          background: linear-gradient(to right, ${theme.colors.primary[400]}, ${theme.colors.secondary[400]});
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Reduce motion overrides */
        @media (prefers-reduced-motion: reduce) {
          .helen-app-shell * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .ambient-particles {
            display: none;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .helen-app-shell {
            font-size: ${theme.typography.fontSize.sm};
          }

          .helen-app-shell .card {
            padding: ${theme.spacing[4]};
          }

          .orb-background {
            opacity: ${orbConfig.opacity ? orbConfig.opacity * 0.5 : 0.15};
          }
        }
      `}</style>
    </div>
  );
};

export default AppShell;

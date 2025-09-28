import React, { useState, useRef, useEffect } from 'react';
import { theme } from '../styles/theme';

interface SquidgyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'calm';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
  pulse?: boolean;
  className?: string;
  style?: React.CSSProperties;
  haptic?: boolean;
}

const SquidgyButton: React.FC<SquidgyButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  glow = false,
  pulse = false,
  className = '',
  style = {},
  haptic = true
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const nextRippleId = useRef(0);

  // Variant styles
  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.primary[600]})`,
      hoverBackground: `linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[700]})`,
      color: 'white',
      glowColor: theme.shadows.glow.purple
    },
    secondary: {
      background: 'radial-gradient(circle at 30% 30%, #ff8787, #ff6b6b, #e55353)',
      hoverBackground: 'radial-gradient(circle at 30% 30%, #ff9999, #ff7979, #e66767)',
      color: 'white',
      glowColor: '0 0 20px rgba(255, 107, 107, 0.4)'
    },
    danger: {
      background: `linear-gradient(135deg, ${theme.colors.error}, #dc2626)`,
      hoverBackground: `linear-gradient(135deg, #dc2626, #b91c1c)`,
      color: 'white',
      glowColor: '0 0 20px rgba(239, 68, 68, 0.4)'
    },
    calm: {
      background: `linear-gradient(135deg, ${theme.colors.accent.green.default}, ${theme.colors.accent.blue.default})`,
      hoverBackground: `linear-gradient(135deg, ${theme.colors.accent.green.dark}, ${theme.colors.accent.blue.dark})`,
      color: 'white',
      glowColor: '0 0 20px rgba(52, 211, 153, 0.4)'
    }
  };

  // Size styles
  const sizeStyles = {
    small: {
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.sm,
      borderRadius: theme.borderRadius.lg
    },
    medium: {
      padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
      fontSize: theme.typography.fontSize.base,
      borderRadius: theme.borderRadius.xl
    },
    large: {
      padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
      fontSize: theme.typography.fontSize.lg,
      borderRadius: theme.borderRadius['2xl']
    }
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  // Handle ripple effect
  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const rippleId = nextRippleId.current++;
    setRipples(prev => [...prev, { x, y, id: rippleId }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== rippleId));
    }, 800);
  };

  // Handle haptic feedback
  const triggerHaptic = () => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    createRipple(e);
    triggerHaptic();
    
    if (onClick) {
      onClick();
    }
  };

  const handleMouseDown = () => {
    if (disabled) return;
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={`squidgy-button ${className} ${fullWidth ? 'w-full' : ''} ${pulse ? 'pulse-soft' : ''}`}
      style={{
        ...currentVariant,
        ...currentSize,
        fontWeight: theme.typography.fontWeight.medium,
        fontFamily: theme.typography.fontFamily.sans,
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transform: isPressed ? 'scale(0.96)' : 'scale(1)',
        transition: `all ${theme.animation.duration.base} ${theme.animation.easing.gentle}`,
        boxShadow: glow ? currentVariant.glowColor : theme.shadows.lg,
        ...style
      }}
    >
      {/* Ripple effects container */}
      <div className="ripple-container" style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none'
      }}>
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="ripple"
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
              width: 0,
              height: 0,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.3)',
              animation: `rippleExpand ${theme.animation.duration.lazy} ${theme.animation.easing.out}`
            }}
          />
        ))}
      </div>

      {/* Button content */}
      <span style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing[2],
        position: 'relative',
        zIndex: 1
      }}>
        {icon && iconPosition === 'left' && <span className="button-icon">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="button-icon">{icon}</span>}
      </span>

      {/* Hover overlay */}
      <div 
        className="hover-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.1)',
          opacity: 0,
          transition: `opacity ${theme.animation.duration.fast} ${theme.animation.easing.gentle}`,
          pointerEvents: 'none'
        }}
      />

      {/* Inner glow effect for pressed state */}
      {isPressed && (
        <div 
          className="press-glow"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
            animation: `fadeIn ${theme.animation.duration.fast} ${theme.animation.easing.gentle}`
          }}
        />
      )}

      <style jsx>{`
        @keyframes rippleExpand {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .squidgy-button:hover .hover-overlay {
          opacity: 1;
        }

        .squidgy-button:hover {
          transform: translateY(-2px) scale(1.02);
          background: ${currentVariant.hoverBackground} !important;
        }

        .squidgy-button:active {
          transform: translateY(0) scale(0.98);
        }

        .squidgy-button:focus-visible {
          outline: 2px solid ${theme.colors.primary[400]};
          outline-offset: 2px;
        }

        /* Accessibility - show focus for keyboard navigation */
        .squidgy-button:focus:not(:focus-visible) {
          outline: none;
        }

        /* Reduce motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .squidgy-button {
            transition: none !important;
            transform: none !important;
          }
          
          .ripple {
            animation: none !important;
          }
        }
      `}</style>
    </button>
  );
};

export default SquidgyButton;

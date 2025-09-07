import React, { ReactNode, useState, useEffect } from 'react';
import { theme } from '../styles/theme';

interface GentleCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  padding?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'primary' | 'secondary' | 'calm';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
  animationDelay?: number;
  glow?: boolean;
}

const GentleCard: React.FC<GentleCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  padding = 'medium',
  variant = 'default',
  hoverable = true,
  clickable = false,
  onClick,
  className = '',
  style = {},
  animate = true,
  animationDelay = 0,
  glow = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(!animate);

  // Padding styles
  const paddingStyles = {
    small: theme.spacing[4],
    medium: theme.spacing[6],
    large: theme.spacing[8]
  };

  // Variant styles
  const variantStyles = {
    default: {
      background: 'rgba(30, 41, 59, 0.6)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      glowColor: theme.shadows.glow.purple
    },
    primary: {
      background: 'rgba(168, 85, 247, 0.1)',
      borderColor: 'rgba(168, 85, 247, 0.3)',
      glowColor: theme.shadows.glow.purple
    },
    secondary: {
      background: 'rgba(20, 184, 166, 0.1)',
      borderColor: 'rgba(20, 184, 166, 0.3)',
      glowColor: theme.shadows.glow.cyan
    },
    calm: {
      background: 'rgba(52, 211, 153, 0.1)',
      borderColor: 'rgba(52, 211, 153, 0.3)',
      glowColor: '0 0 20px rgba(52, 211, 153, 0.4)'
    }
  };

  const currentVariant = variantStyles[variant];

  // Trigger entrance animation
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, animationDelay);

      return () => clearTimeout(timer);
    }
  }, [animate, animationDelay]);

  const handleClick = () => {
    if (clickable && onClick) {
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      onClick();
    }
  };

  const baseStyles: React.CSSProperties = {
    padding: paddingStyles[padding],
    background: currentVariant.background,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${currentVariant.borderColor}`,
    borderRadius: theme.borderRadius['2xl'],
    transition: `all ${theme.animation.duration.base} ${theme.animation.easing.gentle}`,
    cursor: clickable ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    opacity: isVisible ? 1 : 0,
    transform: `translateY(${isVisible ? 0 : 20}px) scale(${isPressed ? 0.98 : 1})`,
    boxShadow: glow && isHovered ? currentVariant.glowColor : theme.shadows.lg,
    ...style
  };

  const hoverStyles: React.CSSProperties = hoverable && isHovered ? {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: glow ? `${theme.shadows.xl}, ${currentVariant.glowColor}` : theme.shadows.xl,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  } : {};

  return (
    <div
      className={`gentle-card ${className}`}
      style={{ ...baseStyles, ...hoverStyles }}
      onMouseEnter={() => hoverable && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => clickable && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={handleClick}
    >
      {/* Animated background gradient */}
      <div 
        className="card-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${isHovered ? '50%' : '100%'} ${isHovered ? '50%' : '100%'}, ${currentVariant.borderColor}, transparent)`,
          opacity: 0.3,
          transition: `all ${theme.animation.duration.slower} ${theme.animation.easing.gentle}`,
          pointerEvents: 'none'
        }}
      />

      {/* Card header */}
      {(title || subtitle || icon) && (
        <div style={{
          marginBottom: theme.spacing[4],
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[3],
            marginBottom: subtitle ? theme.spacing[2] : 0
          }}>
            {icon && (
              <div className="card-icon" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: theme.borderRadius.lg,
                background: 'rgba(255, 255, 255, 0.1)',
                color: theme.colors.primary[400]
              }}>
                {icon}
              </div>
            )}
            {title && (
              <h3 style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.gray[100],
                margin: 0,
                animation: animate ? `textEnter ${theme.animation.duration.slow} ${theme.animation.easing.gentle} forwards` : 'none'
              }}>
                {title}
              </h3>
            )}
          </div>
          {subtitle && (
            <p style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[400],
              margin: 0,
              marginLeft: icon ? '52px' : 0,
              animation: animate ? `textEnter ${theme.animation.duration.slower} ${theme.animation.easing.gentle} forwards` : 'none',
              animationDelay: '100ms'
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Card content */}
      <div className="card-content" style={{
        position: 'relative',
        zIndex: 1
      }}>
        {children}
      </div>

      {/* Hover shimmer effect */}
      {hoverable && (
        <div 
          className="hover-shimmer"
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)`,
            transform: `translateX(${isHovered ? '50%' : '-50%'}) rotate(45deg)`,
            transition: `transform ${theme.animation.duration.slower} ${theme.animation.easing.gentle}`,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Organic blob decoration */}
      <div 
        className="blob-decoration"
        style={{
          position: 'absolute',
          bottom: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          background: currentVariant.borderColor,
          borderRadius: theme.borderRadius.blob,
          opacity: 0.2,
          filter: 'blur(20px)',
          transform: `scale(${isHovered ? 1.2 : 1})`,
          transition: `all ${theme.animation.duration.lazy} ${theme.animation.easing.gentle}`,
          animation: 'blobMorph 8s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      />

      <style jsx>{`
        @keyframes textEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes blobMorph {
          0%, 100% {
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          }
          25% {
            border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
          }
          50% {
            border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
          }
          75% {
            border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
          }
        }

        /* Reduce motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .gentle-card {
            animation: none !important;
            transition: none !important;
          }
          
          .card-background,
          .hover-shimmer,
          .blob-decoration {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GentleCard;

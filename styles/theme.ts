// Helen App Theme - Gentle, Soothing Design System by SepiidAI
// Inspired by cuttlefish adaptability and stress-ball squidgy feel

export const theme = {
  // Soft cuttlefish-inspired color palette
  colors: {
    // Primary colors - soft, calming pastels
    primary: {
      50: '#fdf4ff',   // Lightest lavender
      100: '#fae8ff',  // Soft lavender
      200: '#f5d0fe',  // Light purple
      300: '#f0abfc',  // Pastel purple
      400: '#e879f9',  // Medium purple
      500: '#d946ef',  // Primary purple (Helen signature)
      600: '#c026d3',  // Deeper purple
      700: '#a21caf',  // Rich purple
      800: '#86198f',  // Dark purple
      900: '#701a75',  // Darkest purple
    },
    
    // Secondary colors - calming ocean hues
    secondary: {
      50: '#f0fdfa',   // Lightest teal
      100: '#ccfbf1',  // Soft mint
      200: '#99f6e4',  // Light cyan
      300: '#5eead4',  // Pastel cyan
      400: '#2dd4bf',  // Medium cyan
      500: '#14b8a6',  // Primary cyan
      600: '#0d9488',  // Deeper cyan
      700: '#0f766e',  // Rich teal
      800: '#115e59',  // Dark teal
      900: '#134e4a',  // Darkest teal
    },
    
    // Gentle accent colors
    accent: {
      pink: {
        light: '#fce7f3',
        default: '#ec4899',
        dark: '#be185d',
      },
      blue: {
        light: '#dbeafe',
        default: '#3b82f6',
        dark: '#1e40af',
      },
      green: {
        light: '#d1fae5',
        default: '#34d399',
        dark: '#065f46',
      },
    },
    
    // Neutral grays with warmth
    gray: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },
    
    // Semantic colors for states
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Background gradients
    background: {
      primary: 'linear-gradient(to bottom right, #0f172a, rgba(139, 92, 246, 0.1), #1e293b)',
      soft: 'linear-gradient(to bottom right, #f8fafc, rgba(139, 92, 246, 0.05), #f1f5f9)',
      orb: 'linear-gradient(135deg, #a855f7, #ec4899)',
    },
  },
  
  // Typography with gentle transitions
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: '"Frank Ruhl Libre", Georgia, serif',
      mono: 'Menlo, Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },
  
  // Squidgy, stress-ball inspired shapes
  borderRadius: {
    none: '0',
    sm: '0.5rem',      // 8px
    md: '1rem',        // 16px
    lg: '1.5rem',      // 24px
    xl: '2rem',        // 32px
    '2xl': '3rem',     // 48px
    full: '9999px',
    blob: '30% 70% 70% 30% / 30% 30% 70% 70%', // Organic blob shape
  },
  
  // Soft shadows for depth
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: {
      purple: '0 0 20px rgba(168, 85, 247, 0.4)',
      pink: '0 0 20px rgba(236, 72, 153, 0.4)',
      cyan: '0 0 20px rgba(6, 182, 212, 0.4)',
    },
  },
  
  // Gentle animation configurations
  animation: {
    duration: {
      instant: '0ms',
      fast: '200ms',
      base: '300ms',
      slow: '400ms',
      slower: '600ms',
      lazy: '800ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      gentle: 'cubic-bezier(0.4, 0, 0.2, 1)', // Default for all transitions
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideIn: {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.8' },
      },
      breathe: {
        '0%, 100%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.05)' },
      },
      blob: {
        '0%, 100%': { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
        '25%': { borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%' },
        '50%': { borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%' },
        '75%': { borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%' },
      },
    },
  },
  
  // Spacing scale
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
  },
  
  // Blur effects for glassmorphism
  blur: {
    none: '0',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  },
  
  // Z-index scale
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    60: '60', // Orb background
    70: '70', // Content
    80: '80', // Modals
    90: '90', // Tooltips
    100: '100', // Critical UI
  },
};

// CSS variables for runtime theming
export const getCSSVariables = () => {
  const vars: Record<string, string> = {};
  
  // Colors
  Object.entries(theme.colors.primary).forEach(([key, value]) => {
    vars[`--color-primary-${key}`] = value;
  });
  
  Object.entries(theme.colors.secondary).forEach(([key, value]) => {
    vars[`--color-secondary-${key}`] = value;
  });
  
  // Typography
  vars['--font-sans'] = theme.typography.fontFamily.sans;
  vars['--font-serif'] = theme.typography.fontFamily.serif;
  vars['--font-mono'] = theme.typography.fontFamily.mono;
  
  // Animation
  Object.entries(theme.animation.duration).forEach(([key, value]) => {
    vars[`--duration-${key}`] = value;
  });
  
  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value;
  });
  
  return vars;
};

// Accessibility preferences
export const accessibilityConfig = {
  reduceMotion: {
    animationDuration: '50ms',
    transitionDuration: '50ms',
    disableBackgroundAnimations: true,
  },
  highContrast: {
    borderWidth: '2px',
    focusOutlineWidth: '3px',
    focusOutlineOffset: '2px',
  },
  largeText: {
    scaleMultiplier: 1.2,
  },
};

export type Theme = typeof theme;

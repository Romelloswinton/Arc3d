// Twitch-inspired color palette for the app
export const colors = {
  // Primary Twitch Purple
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#9146ff', // Main Twitch purple
    600: '#7928ca',
    700: '#6b21a8',
    800: '#581c87',
    900: '#4c1d95',
  },
  // Dark gaming theme
  dark: {
    bg: {
      primary: '#0e0e10',    // Deep black
      secondary: '#18181b',  // Card background
      tertiary: '#1f1f23',   // Hover states
    },
    text: {
      primary: '#efeff1',    // White text
      secondary: '#adadb8',  // Gray text
      muted: '#53535f',      // Muted text
    },
    border: {
      primary: '#2e2e35',
      secondary: '#3a3a3d',
    }
  },
  // Accent colors
  accent: {
    success: '#00f593',      // Bright green
    warning: '#ffb31a',      // Orange
    error: '#ff4444',        // Red
    info: '#00c8ff',         // Cyan
  },
  // Gradient for premium features
  gradient: {
    purple: 'linear-gradient(135deg, #9146ff 0%, #772ce8 100%)',
    premium: 'linear-gradient(135deg, #bf94ff 0%, #6441a4 100%)',
    gaming: 'linear-gradient(135deg, #a970ff 0%, #00f5a0 100%)',
  }
};

export const animations = {
  transition: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  }
};

export const PALETTE = {
  dark: {
    background: '#0F0F11',
    surface: '#1C1C1E',
    surfaceHighlight: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#48484A',
    border: 'rgba(255, 255, 255, 0.1)',
    todayIndicator: '#FFFFFF',
    success: '#32D74B',
  },
  light: {
    background: '#e9ebea',
    surface: '#d4d5c3',
    surfaceHighlight: '#c4c5b3',
    text: '#45413e',
    textSecondary: 'rgba(69, 65, 62, 0.6)',
    textTertiary: 'rgba(69, 65, 62, 0.3)',
    border: 'rgba(69, 65, 62, 0.1)',
    todayIndicator: '#45413e',
    success: '#34C759',
  }
};

// Default export for backward compatibility during refactor
export const COLORS = PALETTE.dark;

export const MOOD_COLORS = {
    rad: '#FF2D55',
    good: '#FFD60A',
    meh: '#64D2FF',
    bad: '#BF5AF2',
    awful: '#5E5CE6',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  round: 999,
};

export const FONTS = {
  regular: { fontWeight: '400' as const },
  medium: { fontWeight: '500' as const },
  bold: { fontWeight: '700' as const },
  heavy: { fontWeight: '800' as const },
};

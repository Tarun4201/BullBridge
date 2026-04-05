/**
 * Bull Bridge — Design System Colors
 * Neural-network inspired dark theme and clean premium light theme palettes
 */

export const darkTheme = {
  // Core backgrounds
  background: '#0A0E1A',
  backgroundSecondary: '#111827',
  backgroundTertiary: '#1A2235',
  surface: '#1E293B',
  surfaceLight: '#253449',
  
  // Glass morphism
  glass: 'rgba(30, 41, 59, 0.7)',
  glassBorder: 'rgba(100, 160, 255, 0.15)',
  glassLight: 'rgba(255, 255, 255, 0.05)',
  
  // Primary accent — electric cyan/blue
  primary: '#00D4FF',
  primaryDark: '#0099CC',
  primaryLight: '#66E5FF',
  primaryMuted: 'rgba(0, 212, 255, 0.15)',
  
  // Bullish — neon green
  bullish: '#00E676',
  bullishDark: '#00C853',
  bullishLight: '#69F0AE',
  bullishMuted: 'rgba(0, 230, 118, 0.15)',
  
  // Bearish — warm red
  bearish: '#FF5252',
  bearishDark: '#FF1744',
  bearishLight: '#FF8A80',
  bearishMuted: 'rgba(255, 82, 82, 0.15)',
  
  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0A0E1A',
  
  // Utility
  warning: '#FFB300',
  warningMuted: 'rgba(255, 179, 0, 0.15)',
  info: '#448AFF',
  infoMuted: 'rgba(68, 138, 255, 0.15)',
  
  // Neural network accent colors
  neuralPurple: '#B388FF',
  neuralPurpleMuted: 'rgba(179, 136, 255, 0.15)',
  neuralOrange: '#FF9100',
  neuralOrangeMuted: 'rgba(255, 145, 0, 0.15)',
  
  // Borders & dividers
  border: 'rgba(148, 163, 184, 0.12)',
  borderLight: 'rgba(148, 163, 184, 0.06)',
  
  // Gradients
  gradientStart: '#0A0E1A',
  gradientEnd: '#1A1040',
  gradientAccentStart: '#00D4FF',
  gradientAccentEnd: '#B388FF',
  
  // Shadows
  shadowColor: '#000000',
  
  // Tab bar
  tabBarBackground: '#0F1524',
  tabBarBorder: 'rgba(100, 160, 255, 0.08)',
  tabActive: '#00D4FF',
  tabInactive: '#64748B',
  
  // Status bar
  statusBarBackground: '#0A0E1A',
};

export const lightTheme = {
  // Core backgrounds
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  backgroundTertiary: '#E2E8F0',
  surface: '#FFFFFF',
  surfaceLight: '#F8FAFC',
  
  // Glass morphism
  glass: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
  glassLight: 'rgba(0, 0, 0, 0.03)',
  
  // Primary accent — deep electric blue
  primary: '#0B57D0',
  primaryDark: '#0842A0',
  primaryLight: '#D3E3FD',
  primaryMuted: 'rgba(11, 87, 208, 0.1)',
  
  // Bullish — crisp green
  bullish: '#146C2E',
  bullishDark: '#0F5223',
  bullishLight: '#C4EED0',
  bullishMuted: 'rgba(20, 108, 46, 0.1)',
  
  // Bearish — crisp red
  bearish: '#B3261E',
  bearishDark: '#8C1D18',
  bearishLight: '#F9DEDC',
  bearishMuted: 'rgba(179, 38, 30, 0.1)',
  
  // Text
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Utility
  warning: '#B3261E',
  warningMuted: 'rgba(179, 38, 30, 0.1)',
  info: '#0B57D0',
  infoMuted: 'rgba(11, 87, 208, 0.1)',
  
  // Neural network accent colors
  neuralPurple: '#7B1FA2',
  neuralPurpleMuted: 'rgba(123, 31, 162, 0.1)',
  neuralOrange: '#E65100',
  neuralOrangeMuted: 'rgba(230, 81, 0, 0.1)',
  
  // Borders & dividers
  border: 'rgba(0, 0, 0, 0.12)',
  borderLight: 'rgba(0, 0, 0, 0.06)',
  
  // Gradients
  gradientStart: '#F8FAFC',
  gradientEnd: '#E2E8F0',
  gradientAccentStart: '#0B57D0',
  gradientAccentEnd: '#7B1FA2',
  
  // Shadows
  shadowColor: '#000000',
  
  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarBorder: 'rgba(0, 0, 0, 0.1)',
  tabActive: '#0B57D0',
  tabInactive: '#94A3B8',
  
  // Status bar
  statusBarBackground: '#F8FAFC',
};

export type ThemeColors = typeof darkTheme;

// Backwards-compatible export to prevent full app crash during iterative refactor
export const Colors = darkTheme;

// Dynamic gradient presets
export const getGradients = (t: ThemeColors) => ({
  primary: [t.primary, t.neuralPurple] as const,
  background: [t.gradientStart, t.gradientEnd] as const,
  card: [t.surface, t.backgroundSecondary] as const,
  bullish: [t.bullish, t.bullishLight] as const,
  bearish: [t.bearish, t.bearishLight] as const,
  glass: [t.glass, t.glassLight] as const,
});

// Deprecated temporary gradient export 
export const Gradients = getGradients(Colors);

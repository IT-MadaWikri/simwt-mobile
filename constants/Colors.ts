/**
 * SIMWT Mobile Color Palette — Gojek-Style Green Theme
 */

const tintColorLight = '#00880F';
const tintColorDark = '#4ADE80';

export const Colors = {
  // Primary Brand
  primary: '#00880F',
  primaryDark: '#006B0D',
  primaryLight: '#E8F5E9',
  primaryGradientStart: '#00AA13',
  primaryGradientEnd: '#006B0D',

  // Secondary
  secondary: '#1C1C1C',
  accent: '#00AED6',

  // Status
  danger: '#EF4123',
  warning: '#FFB800',
  success: '#00880F',
  info: '#2196F3',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F2F3F5',
  card: '#FFFFFF',
  textPrimary: '#1C1C1C',
  textSecondary: '#6B6B6B',
  textTertiary: '#9E9E9E',
  border: '#E8E8E8',
  disabled: '#BDBDBD',
  placeholder: '#C4C4C4',

  // Service Icon Backgrounds (pastel)
  serviceBlue: '#E3F2FD',
  serviceGreen: '#E8F5E9',
  serviceOrange: '#FFF3E0',
  servicePurple: '#F3E5F5',
  serviceRed: '#FFEBEE',
  serviceTeal: '#E0F2F1',
  serviceAmber: '#FFF8E1',
  serviceIndigo: '#E8EAF6',
  serviceCyan: '#E0F7FA',
  serviceLime: '#F9FBE7',

  // Theme variants
  light: {
    text: '#1C1C1C',
    textSecondary: '#6B6B6B',
    background: '#F2F3F5',
    card: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#9E9E9E',
    tabIconSelected: tintColorLight,
    border: '#E8E8E8',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#121212',
    card: '#1E1E1E',
    tint: tintColorDark,
    tabIconDefault: '#6B6B6B',
    tabIconSelected: tintColorDark,
    border: '#2C2C2C',
  },
};

export default Colors;

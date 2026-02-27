import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const premiumTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1a73e8', // Premium blue
    primaryContainer: '#e8f0fe',
    secondary: '#34a853', // Green for profits
    secondaryContainer: '#e8f5e8',
    tertiary: '#ea4335', // Red for losses
    tertiaryContainer: '#fce8e6',
    surface: '#ffffff',
    surfaceVariant: '#f8f9fa',
    onSurface: '#202124',
    onSurfaceVariant: '#5f6368',
    background: '#f8f9fa',
    onBackground: '#202124',
    error: '#ea4335',
    errorContainer: '#fce8e6',
    outline: '#dadce0',
    outlineVariant: '#e8eaed',
    inverseSurface: '#2d2e30',
    inverseOnSurface: '#f8f9fa',
    inversePrimary: '#8ab4f8',
    shadow: '#000000',
    scrim: '#000000',
    surfaceTint: '#1a73e8',
  },
  roundness: 12, // More rounded for premium feel
  fonts: {
    ...MD3LightTheme.fonts,
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontWeight: '700',
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontWeight: '600',
    },
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontWeight: '400',
    },
  },
};

export const darkPremiumTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8ab4f8',
    primaryContainer: '#1a73e8',
    secondary: '#81c995',
    secondaryContainer: '#1b5e20',
    tertiary: '#ff8a80',
    tertiaryContainer: '#ea4335',
    surface: '#1e1e1e',
    surfaceVariant: '#2d2d2d',
    onSurface: '#e8eaed',
    onSurfaceVariant: '#bdc1c6',
    background: '#121212',
    onBackground: '#e8eaed',
    error: '#ff8a80',
    errorContainer: '#ea4335',
    outline: '#5f6368',
    outlineVariant: '#3c4043',
    shadow: '#000000',
    scrim: '#000000',
    surfaceTint: '#8ab4f8',
  },
  roundness: 12,
  fonts: {
    ...MD3DarkTheme.fonts,
    titleLarge: {
      ...MD3DarkTheme.fonts.titleLarge,
      fontWeight: '700',
    },
    titleMedium: {
      ...MD3DarkTheme.fonts.titleMedium,
      fontWeight: '600',
    },
    bodyLarge: {
      ...MD3DarkTheme.fonts.bodyLarge,
      fontWeight: '400',
    },
  },
};

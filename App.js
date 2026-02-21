import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { premiumTheme } from './src/utils/theme';

export default function App() {
  // Force rebuild timestamp: {new Date().toISOString()} - Padding Update
  return (
    <SafeAreaProvider>
      <PaperProvider theme={premiumTheme}>
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

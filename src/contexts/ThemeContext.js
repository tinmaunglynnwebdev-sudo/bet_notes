import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { premiumTheme, darkPremiumTheme } from '../utils/theme';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('user-theme-preference');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          // Auto by time: 6 PM to 6 AM is dark
          const hour = new Date().getHours();
          setIsDarkMode(hour >= 18 || hour < 6);
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      } finally {
        setIsLoaded(true);
      }
    };
    initTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      setIsDarkMode(prev => {
        const newMode = !prev;
        AsyncStorage.setItem('user-theme-preference', newMode ? 'dark' : 'light');
        return newMode;
      });
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const theme = isDarkMode ? darkPremiumTheme : premiumTheme;

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

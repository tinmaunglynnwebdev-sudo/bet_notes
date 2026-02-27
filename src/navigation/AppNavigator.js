import React from 'react';
import { View, TouchableOpacity, Switch } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import ProfitScreen from '../screens/ProfitScreen';
import ProfitHistoryScreen from '../screens/ProfitHistoryScreen';
import MatchNotesScreen from '../screens/MatchNotesScreen';
import NormalNotesScreen from '../screens/NormalNotesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HeaderControls = () => {
  const { i18n } = useTranslation();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'mm' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
      <TouchableOpacity onPress={toggleLanguage} style={{ marginRight: 15 }}>
        <View style={{ backgroundColor: theme.colors.primaryContainer, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            {currentLanguage === 'en' ? 'MM' : 'EN'}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons
          name={isDarkMode ? 'moon' : 'sunny'}
          size={18}
          color={theme.colors.onSurfaceVariant}
          style={{ marginRight: 4 }}
        />
        <Switch value={isDarkMode} onValueChange={toggleTheme} color={theme.colors.primary} />
      </View>
    </View>
  );
};


const withHeaderOptions = (theme) => ({
  headerStyle: { backgroundColor: theme.colors.surface },
  headerTintColor: theme.colors.onSurface,
  headerShadowVisible: false,
  headerRight: () => <HeaderControls />,
});

const ProfitStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={withHeaderOptions(theme)}>
      <Stack.Screen name="ProfitMain" component={ProfitScreen} options={{ title: t('profit_income') }} />
      <Stack.Screen name="ProfitHistory" component={ProfitHistoryScreen} options={{ title: t('history') }} />
    </Stack.Navigator>
  );
};

const MatchNotesStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={withHeaderOptions(theme)}>
      <Stack.Screen name="MatchNotesMain" component={MatchNotesScreen} options={{ title: t('match_notes') }} />
    </Stack.Navigator>
  );
};

const NormalNotesStack = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={withHeaderOptions(theme)}>
      <Stack.Screen name="NormalNotesMain" component={NormalNotesScreen} options={{ title: t('normal_notes') }} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'ProfitTab') {
              iconName = focused ? 'cash' : 'cash-outline';
            } else if (route.name === 'Match Notes') {
              iconName = focused ? 'football' : 'football-outline';
            } else if (route.name === 'Normal Notes') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outlineVariant,
          },
        })}
      >
        <Tab.Screen 
          name="ProfitTab" 
          component={ProfitStack} 
          options={{ title: t('profit_income') }}
        />
        <Tab.Screen 
          name="Match Notes" 
          component={MatchNotesStack} 
          options={{ title: t('match_notes') }}
        />
        <Tab.Screen 
          name="Normal Notes" 
          component={NormalNotesStack} 
          options={{ title: t('normal_notes') }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

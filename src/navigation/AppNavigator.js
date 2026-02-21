import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfitScreen from '../screens/ProfitScreen';
import ProfitHistoryScreen from '../screens/ProfitHistoryScreen';
import MatchNotesScreen from '../screens/MatchNotesScreen';
import NormalNotesScreen from '../screens/NormalNotesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ProfitStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfitMain" component={ProfitScreen} options={{ title: 'Profit/Income' }} />
      <Stack.Screen name="ProfitHistory" component={ProfitHistoryScreen} options={{ title: 'History' }} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
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
          tabBarActiveTintColor: '#1a73e8',
          tabBarInactiveTintColor: '#5f6368',
        })}
      >
        <Tab.Screen 
          name="ProfitTab" 
          component={ProfitStack} 
          options={{ title: 'Profit/Income' }}
        />
        <Tab.Screen name="Match Notes" component={MatchNotesScreen} />
        <Tab.Screen name="Normal Notes" component={NormalNotesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

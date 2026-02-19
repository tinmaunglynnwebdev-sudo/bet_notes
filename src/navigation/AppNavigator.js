import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProfitScreen from '../screens/ProfitScreen';
import MatchNotesScreen from '../screens/MatchNotesScreen';
import NormalNotesScreen from '../screens/NormalNotesScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Profit/Income') {
              iconName = focused ? 'cash' : 'cash-outline';
            } else if (route.name === 'Match Notes') {
              iconName = focused ? 'football' : 'football-outline';
            } else if (route.name === 'Normal Notes') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Profit/Income" component={ProfitScreen} />
        <Tab.Screen name="Match Notes" component={MatchNotesScreen} />
        <Tab.Screen name="Normal Notes" component={NormalNotesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

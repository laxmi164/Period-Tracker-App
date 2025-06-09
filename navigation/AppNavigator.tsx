import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"

import CalendarScreen from "../screens/CalendarScreen"
import LogScreen from "../screens/LogScreen"
import LearnScreen from "../screens/LearnScreen"
import ProfileScreen from "../screens/ProfileScreen"
import FunMessagesScreen from "../screens/FunMessagesScreen";

// Define the parameter list for the bottom tab navigator
export type BottomTabParamList = {
  Calendar: undefined; // Calendar screen does not expect parameters via tab navigation
  Log: { date?: string }; // Log screen can optionally receive a date parameter
  FunMessages: undefined;
  Learn: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>()

export default function AppNavigator(): JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === "Calendar") {
            iconName = focused ? "calendar" : "calendar-outline"
          } else if (route.name === "Log") {
            iconName = focused ? "add-circle" : "add-circle-outline"
          } else if (route.name === "FunMessages") {
            iconName = focused ? "heart" : "heart-outline"
          } else if (route.name === "Learn") {
            iconName = focused ? "book" : "book-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          } else {
            iconName = "help-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#FF6B8A",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Log" component={LogScreen} />
      <Tab.Screen name="FunMessages" component={FunMessagesScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

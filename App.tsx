import 'react-native-url-polyfill/auto';

import React, { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { StatusBar } from "expo-status-bar"
import { AppRegistry } from "react-native"

import AuthScreen from "./src/screens/AuthScreen"
import AppNavigator from "./src/navigation/AppNavigator"

// Define the parameter list for the root stack navigator
// 'Main' screen navigates to the tab navigator, 'Auth' is the authentication screen
export type RootStackParamList = {
  Main: undefined; // Main screen (AppNavigator) does not expect any parameters when navigated to from here
  Auth: undefined; // Auth screen does not expect any parameters when navigated to via navigate
};

// Get the stack navigator type
const Stack = createStackNavigator<RootStackParamList>();

export default function App(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Clear AsyncStorage for development purposes to ensure AuthScreen is shown initially
    const clearAsyncStorage = async () => {
      try {
        await AsyncStorage.clear();
        console.log('AsyncStorage cleared for development.');
      } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
      }
    };
    
    clearAsyncStorage();

    checkAuthStatus()
  }, [])

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const userToken = await AsyncStorage.getItem("userToken")
      setIsAuthenticated(!!userToken)
    } catch (error) {
      console.error("Error checking auth status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return null // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth">
            {(props: any) => <AuthScreen {...props} onAuthSuccess={() => setIsAuthenticated(true)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

AppRegistry.registerComponent('main', () => App)

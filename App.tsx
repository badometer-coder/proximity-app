import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, View, Text } from 'react-native';
import { colors } from './src/constants/theme';
import { supabase } from './src/config/supabase';
import { useAuth } from './src/hooks/auth/useAuth';

// Placeholder screens to prevent import errors if actual files are not fully implemented in this context
// In a real scenario, these would be imported from src/screens
const LoginScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }}><Text>Login</Text></View>;
const ProfileSetupScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }}><Text>Profile Setup</Text></View>;
const ProximityFeedScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }}><Text>Proximity Feed</Text></View>;
const ChatThreadScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }}><Text>Chat Thread</Text></View>;

const Stack = createNativeStackNavigator();

export default function App() {
  const [loaded] = useFonts({
    // Add font loading here if necessary
  });

  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
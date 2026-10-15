```typescript
import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from './src/constants/theme';

/**
 * Root App component.
 * Sets the global background color to black and configures the navigation stack.
 */
export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text.primary,
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            color: colors.text.primary,
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: true }} />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors
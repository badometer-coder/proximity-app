import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { SignalStrength } from '../../types';
import { getSignalBars } from '../../lib/utils';

export const SignalIndicator = ({ strength }: { strength: SignalStrength }) => {
  const bars = getSignalBars(strength);
  const color = strength === 'excellent' ? theme.colors.success : strength === 'good' ? theme.colors.warning : strength === 'fair' ? theme.colors.orange : theme.colors.error;

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((level) => (
        <View key={level} style={[styles.bar, { height: 4 + (level * 3), backgroundColor: level <= bars ? color : theme.colors.border }]} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 },
  bar: { width: 4, borderRadius: 1 },
});
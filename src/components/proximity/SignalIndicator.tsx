import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface SignalIndicatorProps {
  distanceKm: number;
}

export const SignalIndicator: React.FC<SignalIndicatorProps> = ({ distanceKm }) => {
  const getSignalStrength = (distance: number) => {
    if (distance <= 0.5) return 4;
    if (distance <= 2) return 3;
    if (distance <= 5) return 2;
    return 1;
  };

  const strength = getSignalStrength(distanceKm);

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((bar) => (
        <View
          key={bar}
          style={[
            styles.bar,
            { height: bar * 5 + 4 },
            bar <= strength ? styles.activeBar : styles.inactiveBar,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    gap: 3,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  activeBar: {
    backgroundColor: theme.colors.primary.main,
  },
  inactiveBar: {
    backgroundColor: theme.colors.border,
  },
});
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { SignalStrength } from '../../types';

interface SignalIndicatorProps {
  strength: SignalStrength;
}

export const SignalIndicator: React.FC<SignalIndicatorProps> = ({ strength }) => {
  const getSignalLevel = (s: SignalStrength) => {
    switch (s) {
      case 'excellent': return 4;
      case 'good': return 3;
      case 'fair': return 2;
      case 'weak': return 1;
      default: return 0;
    }
  };

  const level = getSignalLevel(strength);

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((bar) => (
        <View
          key={bar}
          style={[
            styles.bar,
            { height: bar * 5 + 4 },
            bar <= level ? styles.activeBar : styles.inactiveBar,
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
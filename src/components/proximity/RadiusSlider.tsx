import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { theme } from '../../constants/theme';

export const RadiusSlider = ({ value, onValueChange }: { value: number; onValueChange: (val: number) => void }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Radius: {value >= 1000 ? `${(value / 1000).toFixed(1)} km` : `${value} m`}</Text>
      <Slider
        style={styles.slider}
        minimumValue={100}
        maximumValue={5000}
        step={100}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={theme.colors.primary.main}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.colors.primary.dark}
      />
      <View style={styles.labelsRow}>
        <Text style={styles.smallLabel}>100m</Text>
        <Text style={styles.smallLabel}>5km</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  label: { fontSize: 15, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 12, textAlign: 'center' },
  slider: { width: '100%', height: 40 },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  smallLabel: { fontSize: 11, color: theme.colors.text.tertiary },
});
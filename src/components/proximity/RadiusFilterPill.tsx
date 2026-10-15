import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { RadiusFilter, RadiusFilterOption } from '../../types';

export const RadiusFilterPill = ({ options, selectedValue, onSelect }: { options: readonly RadiusFilterOption[]; selectedValue: RadiusFilter; onSelect: (v: RadiusFilter) => void }) => (
  <View style={styles.container}>
    {options.map((option) => {
      const isSelected = option.value === selectedValue;
      return (
        <TouchableOpacity key={option.value} style={[styles.pill, isSelected && styles.pillActive]} onPress={() => onSelect(option.value)} activeOpacity={0.7}>
          <Text style={[styles.text, isSelected && styles.textActive]}>{option.shortLabel}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  pill: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 100, backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border },
  pillActive: { backgroundColor: theme.colors.primary.main, borderColor: theme.colors.primary.main },
  text: { fontSize: 13, fontWeight: '500', color: theme.colors.text.secondary },
  textActive: { color: '#FFF' },
});
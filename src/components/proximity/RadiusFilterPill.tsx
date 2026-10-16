import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface RadiusFilter {
  id: string;
  name?: string;
  label?: string;
  radiusKm: number;
}

interface RadiusFilterPillProps {
  filter: RadiusFilter;
  isSelected: boolean;
  onSelect: (radiusKm: number) => void;
}

export const RadiusFilterPill: React.FC<RadiusFilterPillProps> = ({
  filter,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        isSelected && styles.selectedPill,
      ]}
      onPress={() => onSelect(filter.radiusKm)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          isSelected && styles.selectedText,
        ]}
      >
        {filter.name || filter.label || `${filter.radiusKm} km`}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  selectedPill: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  text: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  selectedText: {
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
});
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface RadiusFilter {
  id: string;
  name?: string;
  value: number;
}

interface RadiusFilterPillProps {
  filter: RadiusFilter;
  isSelected: boolean;
  onSelect: (value: number) => void;
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
      onPress={() => onSelect(filter.value)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          isSelected && styles.selectedText,
        ]}
      >
        {filter.name || `${filter.value}m`}
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
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  selectedText: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
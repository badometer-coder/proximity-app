import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { RadiusFilter } from '../../types';
import { theme } from '../../constants/theme';

interface RadiusFilterPillProps {
  filter: RadiusFilter;
  isSelected: boolean;
  onSelect: (filter: RadiusFilter) => void;
}

export const RadiusFilterPill: React.FC<RadiusFilterPillProps> = ({
  filter,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[styles.pill, isSelected && styles.selectedPill]}
      onPress={() => onSelect(filter)}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isSelected && styles.selectedText]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
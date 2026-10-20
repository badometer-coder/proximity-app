import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { formatRelativeTime } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

export const ProximityHeader = ({ lastUpdated }: { lastUpdated: string | null }) => {
  const { mode, toggle, colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
        <View>
          <Text style={[styles.modeText, { color: colors.text.primary }]}>ONLINE GPS Mode</Text>
          {lastUpdated && <Text style={[styles.timeText, { color: colors.text.tertiary }]}>Updated {formatRelativeTime(lastUpdated)}</Text>}
        </View>
      </View>
      <TouchableOpacity 
        onPress={toggle} 
        style={[styles.toggleButton, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={mode === 'dark' ? "sunny" : "moon"} 
          size={18} 
          color={mode === 'dark' ? '#F59E0B' : '#6366F1'} 
        />
        <Text style={[styles.toggleText, { color: colors.text.primary }]}>
          {mode === 'dark' ? 'Day' : 'Night'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  modeText: { fontSize: 13, fontWeight: '600' },
  timeText: { fontSize: 11, marginTop: 2 },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
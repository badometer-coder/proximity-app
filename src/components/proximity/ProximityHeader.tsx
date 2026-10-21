import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

export const ProximityHeader = ({ lastUpdated }: { lastUpdated: string | null }) => {
  const { mode, toggle, colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <SafeAreaView style={{ backgroundColor: colors.surface }}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
          <View>
            <Text style={styles.modeText}>ONLINE GPS Mode</Text>
            {lastUpdated && <Text style={styles.timeText}>Updated {formatRelativeTime(lastUpdated)}</Text>}
          </View>
        </View>
        <TouchableOpacity onPress={toggle} style={styles.toggleButton} activeOpacity={0.7}>
          <Ionicons
            name={mode === 'dark' ? 'sunny' : 'moon'}
            size={18}
            color={mode === 'dark' ? '#FBBF24' : '#6366F1'}
          />
          <Text style={styles.toggleText}>{mode === 'dark' ? 'Day' : 'Night'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modeText: { fontSize: 13, fontWeight: '600', color: colors.text.primary },
  timeText: { fontSize: 11, color: colors.text.tertiary, marginTop: 2 },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  toggleText: { fontSize: 12, fontWeight: '600', color: colors.text.primary },
});

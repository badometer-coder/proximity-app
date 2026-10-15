import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { formatRelativeTime } from '../../lib/utils';

export const ProximityHeader = ({ lastUpdated }: { lastUpdated: string | null }) => (
  <View style={styles.container}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success }} />
      <View>
        <Text style={styles.modeText}>ONLINE GPS Mode</Text>
        {lastUpdated && <Text style={styles.timeText}>Updated {formatRelativeTime(lastUpdated)}</Text>}
      </View>
    </View>
    <Ionicons name="cloud-outline" size={20} color={theme.colors.text.secondary} />
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  modeText: { fontSize: 13, fontWeight: '600', color: theme.colors.text.primary },
  timeText: { fontSize: 11, color: theme.colors.text.tertiary, marginTop: 2 },
});
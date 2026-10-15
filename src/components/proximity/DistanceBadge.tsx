import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

export const DistanceBadge = ({ distance }: { distance: string }) => (
  <View style={styles.container}>
    <Ionicons name="navigate-outline" size={14} color={theme.colors.primary.main} />
    <Text style={styles.text}>{distance}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.primary.light, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  text: { fontSize: 11, fontWeight: '600', color: theme.colors.primary.main },
});
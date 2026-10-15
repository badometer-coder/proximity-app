import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

export const EmptyState = ({ icon, title, description, actionLabel, onAction }: { icon: any; title: string; description: string; actionLabel?: string; onAction?: () => void }) => (
  <View style={styles.container}>
    <View style={styles.iconBox}><Ionicons name={icon} size={64} color={theme.colors.text.tertiary} /></View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.desc}>{description}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity style={styles.btn} onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.btnText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  iconBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: theme.colors.border },
  title: { fontSize: 17, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 8 },
  desc: { fontSize: 13, color: theme.colors.text.secondary, textAlign: 'center', lineHeight: 20, marginBottom: 24, maxWidth: 280 },
  btn: { paddingHorizontal: 32, paddingVertical: 12, backgroundColor: theme.colors.primary.main, borderRadius: 100 },
  btnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
});
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { getInitials } from '../../lib/utils';

export const Avatar = ({ uri, name, size = 48 }: { uri: string | null; name: string; size?: number }) => {
  const fontSize = size * 0.35;
  const initials = getInitials(name);
  const colors = ['#6366F1', '#EC4899', '#F97316', '#22C55E', '#06B6D4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const bgColor = colors[Math.abs(hash) % colors.length];

  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.divider }} />;
  }

  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize, fontWeight: '600', color: '#FFF' }}>{initials}</Text>
    </View>
  );
};
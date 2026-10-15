import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from '../common/Avatar';
import { DistanceBadge } from './DistanceBadge';
import { SignalIndicator } from './SignalIndicator';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';
import { getPresenceColor } from '../../lib/utils';

export const NearbyPeerCard = ({ peer, onPress }: { peer: FormattedNearbyPeer; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.avatarWrap}>
      <Avatar uri={peer.avatar_url} name={peer.full_name} size={56} />
      <View style={[styles.dot, { backgroundColor: getPresenceColor(peer.presence_status) }]} />
    </View>
    <View style={styles.info}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Text style={styles.name} numberOfLines={1}>{peer.full_name}</Text>
        <Text style={styles.age}>{peer.age}</Text>
      </View>
      <Text style={styles.username}>@{peer.username}</Text>
    </View>
    <View style={styles.meta}>
      <DistanceBadge distance={peer.formatted_distance} />
      <SignalIndicator strength={peer.signal_strength} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  avatarWrap: { position: 'relative', marginRight: 16 },
  dot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2.5, borderColor: theme.colors.surface },
  info: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: theme.colors.text.primary, flexShrink: 1 },
  age: { fontSize: 13, color: theme.colors.text.tertiary },
  username: { fontSize: 13, color: theme.colors.text.secondary, marginTop: 2 },
  meta: { alignItems: 'flex-end', gap: 8 },
});
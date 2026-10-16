import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { SignalIndicator } from './SignalIndicator';
import { DistanceBadge } from './DistanceBadge';
import { getPresenceColor, formatRelativeTime } from '../../lib/utils';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface NearbyPeerCardProps {
  peer: FormattedNearbyPeer;
  onPress: () => void;
}

export const NearbyPeerCard: React.FC<NearbyPeerCardProps> = ({ peer, onPress }) => {
  const presenceColor = getPresenceColor(peer.presence_status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
          <View style={[styles.presenceDot, { backgroundColor: presenceColor }]} />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{peer.full_name || peer.username}</Text>
            {peer.age ? <Text style={styles.age}>, {peer.age}</Text> : null}
          </View>
          <Text style={styles.username} numberOfLines={1}>@{peer.username}</Text>
          <Text style={styles.lastActive}>Active {formatRelativeTime(peer.last_active_at)}</Text>
        </View>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <DistanceBadge distance={peer.formatted_distance} />
          <SignalIndicator strength={peer.signal_strength} />
        </div>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  presenceDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    flexShrink: 1,
  },
  age: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
  },
});
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { DistanceBadge } from './DistanceBadge';
import { SignalIndicator } from './SignalIndicator';
import { theme } from '../../constants/theme';
import { getPresenceColor, formatRelativeTime } from '../../lib/utils';

interface NearbyPeerCardProps {
  peer: FormattedNearbyPeer;
  onPress: () => void;
}

export const NearbyPeerCard: React.FC<NearbyPeerCardProps> = ({ peer, onPress }) => {
  const presenceColor = getPresenceColor(peer.presence_status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
          <View style={[styles.presenceDot, { backgroundColor: presenceColor }]} />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {peer.full_name}
            </Text>
            <Text style={styles.age}>{peer.age}</Text>
          </View>
          <Text style={styles.username} numberOfLines={1}>
            @{peer.username}
          </Text>
          <Text style={styles.lastActive}>
            Active {formatRelativeTime(peer.last_active_at)}
          </Text>
        </View>

        <View style={styles.metaContainer}>
          <DistanceBadge distance={peer.formatted_distance} />
          <SignalIndicator strength={peer.signal_strength} style={styles.signal} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  presenceDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
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
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.xs,
    flexShrink: 1,
  },
  age: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  lastActive: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  metaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  signal: {
    marginTop: theme.spacing.xs,
  },
});
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'prop-types' in globalThis ? {} : StyleSheet;
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { SignalIndicator } from './SignalIndicator';
import { DistanceBadge } from './DistanceBadge';
import { theme } from '../../constants/theme';
import { getPresenceColor, getPresenceStatus } from '../../lib/utils';

interface NearbyPeerCardProps {
  peer: FormattedNearbyPeer;
  onPress: () => void;
}

export const NearbyPeerCard: React.FC<NearbyPeerCardProps> = ({ peer, onPress }) => {
  const presence = getPresenceStatus(peer.last_active_at);
  const presenceColor = getPresenceColor(presence);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
          <View style={[styles.presenceDot, { backgroundColor: presenceColor }]} />
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {peer.full_name} <Text style={styles.age}>{peer.age}</Text>
            </Text>
          </View>
          <Text style={styles.username} numberOfLines={1}>
            @{peer.username}
          </Text>
        </View>
        <DistanceBadge distance={peer.formatted_distance} />
      </View>
      <View style={styles.footer}>
        <View style={styles.signalContainer}>
          <SignalIndicator strength={peer.signal_strength} />
          <Text style={styles.signalText}>{peer.signal_strength.toUpperCase()}</Text>
        </View>
        <Text style={styles.presenceText}>
          {presence === 'online' ? 'Active now' : presence === 'recently' ? 'Active recently' : 'Offline'}
        </Text>
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
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  age: {
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  presenceText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
});
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { DistanceBadge } from './DistanceBadge';
import { SignalIndicator } from './SignalIndicator';
import { getPresenceColor, getPresenceStatus } from '../../lib/utils';
import { theme } from '../../constants/theme';

interface NearbyPeerCardProps {
  peer: FormattedNearbyPeer;
  onPress: () => void;
}

export const NearbyPeerCard: React.FC<NearbyPeerCardProps> = ({ peer, onPress }) => {
  const presenceStatus = peer.presence_status || getPresenceStatus(peer.last_active_at);
  const presenceColor = getPresenceColor(presenceStatus);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
        <View style={[styles.presenceDot, { backgroundColor: presenceColor }]} />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {peer.full_name || peer.username}
            {peer.age ? <Text style={styles.age}>, {peer.age}</Text> : null}
          </Text>
          <DistanceBadge distance={peer.formatted_distance} />
        </View>

        <Text style={styles.username} numberOfLines={1}>
          @{peer.username}
        </Text>

        <View style={styles.footerRow}>
          <SignalIndicator strength={peer.signal_strength} />
          <Text style={styles.statusText}>
            {presenceStatus === 'online' ? 'Online now' : presenceStatus === 'recently' ? 'Active recently' : 'Offline'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  age: {
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
});
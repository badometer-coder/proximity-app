import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { DistanceBadge } from './DistanceBadge';
import { SignalIndicator } from './SignalIndicator';
import { theme } from '../../constants/theme';
import { getPresenceColor, getSignalBars } from '../../lib/utils';

interface NearbyPeerCardProps {
  peer: FormattedNearbyPeer;
  onPress: () => void;
}

export const NearbyPeerCard: React.FC<NearbyPeerCardProps> = ({ peer, onPress }) => {
  const presenceColor = getPresenceColor(peer.presence_status);
  const signalBars = getSignalBars(peer.signal_strength);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatarContainer}>
        <Avatar uri={peer.avatar_url} name={peer.full_name} size={56} />
        <View style={[styles.presenceDot, { backgroundColor: presenceColor }]} />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {peer.full_name}, <Text style={styles.age}>{peer.age}</Text>
          </Text>
          <DistanceBadge distance={peer.formatted_distance} />
        </View>

        <Text style={styles.username} numberOfLines={1}>
          @{peer.username}
        </Text>

        <View style={styles.footerRow}>
          <SignalIndicator bars={signalBars} />
          <Text style={styles.statusText}>
            {peer.presence_status === 'online' ? 'Online now' : `Active ${peer.presence_status}`}
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  presenceDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textTransform: 'capitalize',
  },
});
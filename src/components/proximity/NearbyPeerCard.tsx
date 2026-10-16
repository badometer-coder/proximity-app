import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { DistanceBadge } from './DistanceBadge';
import { SignalIndicator } from './SignalIndicator';
import { theme } from '../../constants/theme';
import { getPresenceColor } from '../../lib/utils';

interface NearbyPeerCardProps {
  peer: FormattedNearbyPeer;
  onPress: () => void;
}

export const NearbyPeerCard: React.FC<NearbyPeerCardProps> = ({ peer, onPress }) => {
  const presenceColor = getPresenceColor(peer.presence_status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <Avatar uri={peer.avatar_url} name={peer.full_name} size={50} />
        <View style={[styles.presenceDot, { backgroundColor: presenceColor }]} />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{peer.full_name}</Text>
          <Text style={styles.age}>{peer.age}</Text>
        </View>

        <Text style={styles.username} numberOfLines={1}>@{peer.username}</Text>

        <View style={styles.footerRow}>
          <DistanceBadge distance={peer.formatted_distance} />
          <SignalIndicator strength={peer.signal_strength} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.xs,
  },
  age: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  username: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
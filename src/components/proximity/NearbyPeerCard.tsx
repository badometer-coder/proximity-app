import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { DistanceBadge } from './DistanceBadge';
import { SignalIndicator } from './SignalIndicator';
import { theme } from '../../constants/theme';
import { formatRelativeTime } from '../../lib/utils';

interface NearbyPeerCardProps {
  peer: FormattedNearbyPeer;
  onPress: () => void;
}

export const NearbyPeerCard: React.FC<NearbyPeerCardProps> = ({ peer, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{peer.full_name || peer.username}</Text>
            {peer.age ? <Text style={styles.age}>, {peer.age}</Text> : null}
          </View>
          <Text style={styles.username}>@{peer.username}</Text>
          <Text style={styles.lastActive}>Active {formatRelativeTime(peer.last_active_at)}</Text>
        </View>
        <SignalIndicator strength={peer.signal_strength} />
      </View>
      <View style={styles.footer}>
        <DistanceBadge distance={peer.formatted_distance} />
        <View style={[styles.presenceDot, { backgroundColor: peer.presence_status === 'online' ? theme.colors.success : peer.presence_status === 'recently' ? theme.colors.warning : theme.colors.text.tertiary }]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
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
  info: {
    flex: 1,
    marginLeft: theme.spacing.md,
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
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.light,
    marginTop: 2,
  },
  lastActive: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.sm,
  },
  presenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
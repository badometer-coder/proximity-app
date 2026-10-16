import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { DistanceBadge } from './DistanceBadge';
import { SignalIndicator } from './SignalIndicator';
import { theme } from '../../constants/theme';

interface NearbyPeerCardProps {
  peer: FormattedNearbyPeer;
  onPress: () => void;
}

export const NearbyPeerCard: React.FC<NearbyPeerCardProps> = ({ peer, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftContent}>
        <View style={styles.avatarContainer}>
          <Avatar url={peer.avatarUrl} name={peer.username} size={48} />
          {peer.isOnline && <View style={styles.onlineBadge} />}
        </View>

        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>{peer.username}</Text>
            {peer.age && <Text style={styles.age}>, {peer.age}</Text>}
          </View>
          {peer.bio && (
            <Text style={styles.bio} numberOfLines={1}>{peer.bio}</Text>
          )}
          <Text style={styles.statusText}>{peer.isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      <View style={styles.rightContent}>
        <DistanceBadge distance={peer.distanceFormatted} />
        <View style={styles.signalWrapper}>
          <SignalIndicator rssiLevel={peer.rssiLevel} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  info: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
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
  bio: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
  },
  signalWrapper: {
    marginTop: theme.spacing.xs,
  },
});
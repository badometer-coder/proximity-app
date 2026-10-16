import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { SignalIndicator } from './SignalIndicator';
import { DistanceBadge } from './DistanceBadge';
import { theme } from '../../constants/theme';

interface NearbyPeerCardProps {
  peer: FormattedNearbyPeer;
  onPress: () => void;
}

export const NearbyPeerCard: React.FC<NearbyPeerCardProps> = ({ peer, onPress }) => {
  const getPresenceColor = (status: FormattedNearbyPeer['presence_status']) => {
    switch (status) {
      case 'online':
        return theme.colors.success;
      case 'recently':
        return theme.colors.warning;
      case 'offline':
      default:
        return theme.colors.text.tertiary;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
            <View 
              style={[
                styles.presenceDot, 
                { backgroundColor: getPresenceColor(peer.presence_status) }
              ]} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name} numberOfLines={1}>{peer.full_name}</Text>
            <Text style={styles.username} numberOfLines={1}>@{peer.username} • {peer.age}</Text>
          </View>
        </View>
        <DistanceBadge distance={peer.formatted_distance} />
      </View>

      <View style={styles.footer}>
        <View style={styles.signalContainer}>
          <SignalIndicator strength={peer.signal_strength} />
          <Text style={styles.signalText}>{peer.signal_strength.toUpperCase()}</Text>
        </View>
        <Text style={styles.presenceText}>
          {peer.presence_status === 'online' ? 'Online now' : peer.presence_status === 'recently' ? 'Active recently' : 'Offline'}
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
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.sm,
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
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  username: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.sm,
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
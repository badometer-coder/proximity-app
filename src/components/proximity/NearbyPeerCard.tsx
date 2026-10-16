import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  const getPresenceDotColor = (status: FormattedNearbyPeer['presence_status']) => {
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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
          <View 
            style={[
              styles.presenceDot, 
              { backgroundColor: getPresenceDotColor(peer.presence_status) }
            ]} 
          />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.fullName} numberOfLines={1}>{peer.full_name}</Text>
            <Text style={styles.age}>{peer.age}</Text>
          </View>
          <Text style={styles.username} numberOfLines={1}>@{peer.username}</Text>
        </View>

        <View style={styles.indicators}>
          <DistanceBadge distance={peer.formatted_distance} />
          <View style={styles.signalWrapper}>
            <SignalIndicator strength={peer.signal_strength} />
          </View>
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
  fullName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.xs,
    flexShrink: 1,
  },
  age: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.regular,
  },
  username: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  indicators: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  signalWrapper: {
    marginTop: theme.spacing.xs,
  },
});
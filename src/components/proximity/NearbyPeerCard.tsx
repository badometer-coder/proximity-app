import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {peer.full_name} <Text style={styles.age}>{peer.age}</Text>
            </Text>
            <SignalIndicator strength={peer.signal_strength} />
          </View>
          <Text style={styles.username} numberOfLines={1}>@{peer.username}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <DistanceBadge distance={peer.formatted_distance} />
        <View style={[styles.statusIndicator, { backgroundColor: peer.presence_status === 'online' ? theme.colors.success : theme.colors.text.tertiary }]} />
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
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  info: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
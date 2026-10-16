import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{peer.full_name}</Text>
            {peer.age ? <Text style={styles.age}>, {peer.age}</Text> : null}
          </View>
          <Text style={styles.username} numberOfLines={1}>@{peer.username}</Text>
          <Text style={styles.lastActive}>
            Active {formatRelativeTime(peer.last_active_at)}
          </Text>
        </View>

        <View style={styles.metrics}>
          <DistanceBadge distance={peer.formatted_distance} />
          <SignalIndicator strength={peer.signal_strength} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.badgeContainer}>
          {peer.is_ble_discoverable && (
            <View style={styles.bleBadge}>
              <Ionicons name="bluetooth" size={12} color={theme.colors.info} />
              <Text style={styles.bleText}>BLE</Text>
            </View>
          )}
          <Text style={styles.statusText}>
            {peer.presence_status === 'online' ? 'Online now' : peer.presence_status === 'recently' ? 'Recently active' : 'Away'}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={theme.colors.text.tertiary} />
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
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  age: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.light,
    marginBottom: 2,
  },
  lastActive: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  metrics: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  bleText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.info,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: 2,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
});
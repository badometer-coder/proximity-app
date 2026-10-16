import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { DistanceBadge } from './DistanceBadge';
import { SignalIndicator } from './SignalIndicator';
import { theme } from '../../constants/theme';
import { getPresenceColor, formatRelativeTime } from '../../lib/utils';
import { Ionicons } from '@expo/vector-icons';

interface NearbyPeerCardProps {
  peer: FormattedNearbyPeer;
  onPress: () => void;
}

export const NearbyPeerCard: React.FC<NearbyPeerCardProps> = ({ peer, onPress }) => {
  const presenceColor = getPresenceColor(peer.presence_status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
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
          <Text style={styles.lastActive}>Active {formatRelativeTime(peer.last_active_at)}</Text>
        </View>

        <View style={styles.indicators}>
          <DistanceBadge distance={peer.formatted_distance} />
          <SignalIndicator strength={peer.signal_strength} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.bleTag}>
          <Ionicons name="bluetooth" size={12} color={theme.colors.primary.main} />
          <Text style={styles.bleText}>
            {peer.is_ble_discoverable ? 'BLE Discoverable' : 'GPS Location'}
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
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
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  age: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  lastActive: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    marginTop: 4,
  },
  indicators: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  bleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bleText: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
  },
});
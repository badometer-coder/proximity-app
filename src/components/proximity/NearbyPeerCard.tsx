import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { SignalIndicator } from './SignalIndicator';
import { DistanceBadge } from './DistanceBadge';
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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
          <View style={[styles.presenceDot, { backgroundColor: presenceColor }]} />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {peer.full_name}
            </Text>
            <Text style={styles.age}>, {peer.age}</Text>
          </View>
          <Text style={styles.username} numberOfLines={1}>
            @{peer.username}
          </Text>
          <Text style={styles.lastActive}>
            Active {formatRelativeTime(peer.last_active_at)}
          </Text>
        </View>

        <View style={styles.badges}>
          <DistanceBadge distance={peer.formatted_distance} />
          <SignalIndicator strength={peer.signal_strength} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.bleIndicator}>
          <Ionicons 
            name={peer.is_ble_discoverable ? "bluetooth" : "bluetooth-outline"} 
            size={14} 
            color={peer.is_ble_discoverable ? theme.colors.info : theme.colors.text.tertiary} 
          />
          <Text style={[styles.bleText, { color: peer.is_ble_discoverable ? theme.colors.info : theme.colors.text.tertiary }]}>
            {peer.is_ble_discoverable ? 'BLE Discoverable' : 'GPS Only'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
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
    bottom: 2,
    right: 2,
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
    alignItems: 'baseline',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  age: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: 13,
    color: theme.colors.primary.light,
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
  },
  badges: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 50,
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
  bleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bleText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
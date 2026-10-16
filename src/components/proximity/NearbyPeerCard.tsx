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
        <Avatar uri={peer.avatar_url} name={peer.full_name} size={50} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{peer.full_name}</Text>
            <Text style={styles.age}>, {peer.age}</Text>
          </View>
          <Text style={styles.username} numberOfLines={1}>@{peer.username}</Text>
        </View>
        <SignalIndicator strength={peer.signal_strength} />
      </View>

      <View style={styles.footer}>
        <DistanceBadge distance={peer.formatted_distance} status={peer.presence_status} />
        <Text style={styles.bleIndicator}>
          {peer.is_ble_discoverable ? 'BLE Active' : 'GPS Only'}
        </Text>
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
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    flexShrink: 1,
  },
  age: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 10,
  },
  bleIndicator: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
});
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
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
        <View style={styles.info}>
          <Text style={styles.name}>{peer.full_name || peer.username}</Text>
          <Text style={styles.username}>@{peer.username} • {peer.age}</Text>
        </View>
        <DistanceBadge distance={peer.formatted_distance} />
      </View>
      <View style={styles.footer}>
        <SignalIndicator strength={peer.signal_strength} />
        <View style={[styles.statusDot, { backgroundColor: peer.presence_status === 'online' ? theme.colors.success : theme.colors.text.tertiary }]} />
        <Text style={styles.statusText}>{peer.presence_status}</Text>
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
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  username: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
});
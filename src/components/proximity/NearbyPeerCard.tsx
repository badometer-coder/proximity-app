import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { SignalIndicator } from './SignalIndicator';
import { DistanceBadge } from './DistanceBadge';
import { theme } from '../../constants/theme';
import { getPresenceColor } from '../../lib/utils';

interface NearbyPeerCardProps {
  peer: FormattedNearbyPeer;
  onPress: () => void;
}

export const NearbyPeerCard: React.FC<NearbyPeerCardProps> = ({ peer, onPress }) => {
  const presenceColor = getPresenceColor(peer.presence_status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatarContainer}>
        <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
        <View style={[styles.presenceDot, { backgroundColor: presenceColor }]} />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {peer.full_name}
            {peer.age ? <Text style={styles.age}>, {peer.age}</Text> : null}
          </Text>
          <DistanceBadge distance={peer.formatted_distance} />
        </View>

        <Text style={styles.username} numberOfLines={1}>
          @{peer.username}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.signalContainer}>
            <SignalIndicator strength={peer.signal_strength} />
            <Text style={styles.signalText}>{peer.signal_strength}</Text>
          </View>
          <Text style={styles.statusText}>{peer.presence_status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  age: {
    fontWeight: '400',
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalText: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  statusText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
});
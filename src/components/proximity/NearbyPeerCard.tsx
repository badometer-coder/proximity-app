import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { SignalIndicator } from './SignalIndicator';
import { DistanceBadge } from './DistanceBadge';
import { getPresenceColor, formatRelativeTime } from '../../lib/utils';
import { theme } from '../../constants/theme';

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
          <Avatar uri={peer.avatar_url} name={peer.full_name} size={50} />
          <View style={[styles.presenceDot, { backgroundColor: presenceColor }]} />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.fullName}>{peer.full_name}</Text>
            <Text style={styles.age}>, {peer.age}</Text>
          </View>
          <Text style={styles.username}>@{peer.username}</Text>
        </View>

        <DistanceBadge distance={peer.formatted_distance} />
      </View>

      <View style={styles.footer}>
        <View style={styles.signalContainer}>
          <SignalIndicator strength={peer.signal_strength} />
          <Text style={styles.signalText}>{peer.signal_strength.toUpperCase()}</Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: presenceColor }]} />
          <Text style={styles.statusText}>
            {peer.presence_status === 'online' ? 'Online' : formatRelativeTime(peer.last_active_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  age: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: 13,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
});
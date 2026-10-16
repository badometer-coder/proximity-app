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
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {peer.full_name}, {peer.age}
            </Text>
            <DistanceBadge distance={peer.formatted_distance} />
          </View>
          <Text style={styles.username} numberOfLines={1}>
            @{peer.username}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.signalContainer}>
          <SignalIndicator strength={peer.signal_strength} />
          <Text style={styles.signalText}>{peer.signal_strength.toUpperCase()}</Text>
        </View>
        <View style={styles.presenceContainer}>
          <View 
            style={[
              styles.presenceDot, 
              { backgroundColor: peer.presence_status === 'online' ? theme.colors.success : theme.colors.text.tertiary }
            ]} 
          />
          <Text style={styles.presenceText}>{peer.presence_status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
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
  info: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
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
  username: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
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
    fontWeight: '500',
  },
  presenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  presenceText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
});
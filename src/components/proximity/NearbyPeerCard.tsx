import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { SignalIndicator } from './SignalIndicator';
import { DistanceBadge } from './DistanceBadge';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
        <View 
          style={[
            styles.presenceDot, 
            { backgroundColor: getPresenceDotColor(peer.presence_status) }
          ]} 
        />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{peer.full_name}</Text>
          <Text style={styles.age}>, {peer.age}</Text>
        </View>

        <Text style={styles.username} numberOfLines={1}>@{peer.username}</Text>

        <View style={styles.metaRow}>
          <DistanceBadge distance={peer.formatted_distance} />
          <View style={styles.signalWrapper}>
            <SignalIndicator strength={peer.signal_strength} />
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  age: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  signalWrapper: {
    marginLeft: theme.spacing.sm,
  },
  actionContainer: {
    paddingLeft: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
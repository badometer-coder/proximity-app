import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormattedNearbyPeer } from '../../types';
import { Avatar } from '../common/Avatar';
import { DistanceBadge } from './DistanceBadge';
import { SignalIndicator } from './SignalIndicator';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface NearbyPeerCardProps {
  peer: FormattedNearbyPeer;
  onPress: () => void;
}

export const NearbyPeerCard: React.FC<NearbyPeerCardProps> = ({ peer, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.headerRow}>
        <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={50} />
        
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{peer.full_name}</Text>
            <Text style={styles.age}>, {peer.age}</Text>
          </View>
          <Text style={styles.username}>@{peer.username}</Text>
        </View>

        <View style={styles.statusContainer}>
          <SignalIndicator strength={peer.signal_strength} />
          <DistanceBadge distance={peer.formatted_distance} />
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.presenceRow}>
          <View style={[styles.presenceDot, { backgroundColor: peer.presence_status === 'online' ? theme.colors.success : theme.colors.warning }]} />
          <Text style={styles.presenceText}>{peer.presence_status}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    maxWidth: '80%',
  },
  age: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  presenceRow: {
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
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
});
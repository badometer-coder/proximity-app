import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'styled-components/native';
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
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Avatar uri={peer.avatar_url} name={peer.full_name} size={50} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{peer.full_name}, {peer.age}</Text>
            <View style={[styles.presenceDot, { backgroundColor: peer.presence_status === 'online' ? theme.colors.success : theme.colors.text.tertiary }]} />
          </View>
          <Text style={styles.username}>@{peer.username}</Text>
        </View>
        <SignalIndicator strength={peer.signal_strength} />
      </View>
      <View style={styles.footer}>
        <DistanceBadge distance={peer.formatted_distance} />
        <View style={styles.chatAction}>
          <Text style={styles.chatText}>Say Hello</Text>
          <Ionicons name="chatbubble-outline" size={16} color={theme.colors.primary.main} />
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
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  presenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
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
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  chatAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary.main,
    marginRight: 6,
  },
});
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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Avatar uri={peer.avatar_url} name={peer.full_name} size={50} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{peer.full_name}</Text>
            <Text style={styles.age}>{peer.age}</Text>
          </View>
          <Text style={styles.username}>@{peer.username}</Text>
        </View>
        <SignalIndicator signal={peer.signal_strength} />
      </View>
      <View style={styles.footer}>
        <DistanceBadge distance={peer.formatted_distance} status={peer.presence_status} />
        <View style={styles.chatPrompt}>
          <Text style={styles.chatPromptText}>Chat</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary.main} />
        </View>
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
    marginRight: 6,
  },
  age: {
    fontSize: 15,
    color: theme.colors.text.secondary,
  },
  username: {
    fontSize: 13,
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
  chatPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatPromptText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary.main,
    marginRight: 2,
  },
});
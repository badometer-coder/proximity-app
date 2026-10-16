import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useChatMessages } from '../../hooks/messaging/useChatMessages';
import { useAuth } from '../../hooks/auth/useAuth';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { Avatar } from '../../components/common/Avatar';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer, ChatMessage } from '../../types';
import { ChatThreadScreen } from './ChatThreadScreen';

export default function ProximityFeedScreen() {
  const { location, isLoading: isLocationLoading, permissionStatus, requestPermission } = useCurrentLocation();
  const {
    peers,
    selectedRadius,
    isLoading: isPeersLoading,
    isRefreshing,
    error,
    lastFetchedAt,
    setRadius,
    refresh,
  } = useNearbyPeers(location);

  const { user } = useAuth();
  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);

  const {
    messages,
    isLoading: isChatLoading,
    sendMessage,
  } = useChatMessages(selectedPeer?.id ?? '', selectedPeer?.username ?? '');

  if (permissionStatus !== 'granted') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <EmptyState
          icon="location-outline"
          title="Location Permission Required"
          description="We need your location to discover people around you in real-time."
        />
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isLocationLoading || (isPeersLoading && !isRefreshing)) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Scanning proximity spectrum...</Text>
      </SafeAreaView>
    );
  }

  if (selectedPeer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedPeer(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Avatar uri={selectedPeer.avatar_url} name={selectedPeer.full_name} size={36} />
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{selectedPeer.full_name}</Text>
            <Text style={styles.chatHeaderDistance}>{selectedPeer.formatted_distance}</Text>
          </View>
        </View>
        <ChatThreadScreen
          userId={selectedPeer.id}
          userName={selectedPeer.full_name}
          myId={user?.id ?? null}
          onBack={() => setSelectedPeer(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      <View style={styles.filterSection}>
        <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={20} color={theme.colors.error} />
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      ) : null}

      <FlatList
        data={peers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NearbyPeerCard
            peer={item}
            onPress={() => setSelectedPeer(item)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary.main}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No one nearby"
            description="Try expanding your radius or move to a more populated area to find peers."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  permissionButtonText: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.md,
  },
  filterSection: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listContainer: {
    padding: theme.spacing.md,
    flexGrow: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  chatHeaderInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  chatHeaderName: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  chatHeaderDistance: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xs,
  },
});
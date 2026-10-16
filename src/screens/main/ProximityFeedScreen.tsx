import React, { useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ChatThreadScreen } from './ChatThreadScreen';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';

export default function ProximityFeedScreen() {
  const { location, isLoading: locationLoading, error: locationError } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);

  if (selectedPeer) {
    return (
      <ChatThreadScreen
        userId={selectedPeer.id}
        userName={selectedPeer.full_name || selectedPeer.username}
        myId={null}
        onBack={() => setSelectedPeer(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      <RadiusSlider value={selectedRadius} onValueChange={setRadius} />

      {locationLoading || isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : locationError || error ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Something went wrong"
          description={locationError || error?.message || 'Unable to load nearby peers'}
          actionLabel="Retry"
          onAction={refresh}
        />
      ) : (
        <FlatList
          data={peers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NearbyPeerCard peer={item} onPress={() => setSelectedPeer(item)} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="radio-outline"
              title="No peers nearby"
              description="Try expanding your radius slider above to find people further away."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: theme.spacing.md,
  },
});
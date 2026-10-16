import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { theme } from '../../constants/theme';

export default function HomeScreen() {
  const { location, isLoading: locationLoading } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);

  if (locationLoading || isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterText}>Radius: {selectedRadius} km</Text>
        <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
      </View>

      {error ? (
        <EmptyState 
          icon="alert-circle-outline" 
          title="Error Loading Peers" 
          description={error.message || 'Something went wrong.'}
          actionLabel="Try Again"
          onAction={refresh}
        />
      ) : peers.length === 0 ? (
        <EmptyState 
          icon="people-outline" 
          title="No Peers Nearby" 
          description="Try expanding your radius to find people around you."
          actionLabel="Refresh"
          onAction={refresh}
        />
      ) : (
        <FlatList
          data={peers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NearbyPeerCard 
              peer={item} 
              onPress={() => {}} 
            />
          )}
          contentContainerStyle={styles.list}
          refreshing={isRefreshing}
          onRefresh={refresh}
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
    backgroundColor: theme.colors.background,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
});
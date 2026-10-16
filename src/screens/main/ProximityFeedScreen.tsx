import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { theme } from '../../constants/theme';
import { NearbyPeer } from '../../types';

export const ProximityFeedScreen = () => {
  const { location, errorMsg: locationError } = useCurrentLocation();
  const { peers, loading, radius, setRadius, refetch } = useNearbyPeers(location);
  const [selectedPeer, setSelectedPeer] = useState<NearbyPeer | null>(null);

  const handleSelectPeer = (peer: NearbyPeer) => {
    setSelectedPeer(peer);
  };

  if (loading && peers.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Scanning proximity radar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader 
        radius={radius} 
        onRadiusChange={setRadius} 
        onRefresh={refetch} 
        loading={loading} 
      />

      {locationError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      ) : null}

      <FlatList
        data={peers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NearbyPeerCard 
            peer={item} 
            onPress={() => handleSelectPeer(item)} 
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <EmptyState 
            icon="radio-outline" 
            title="No one nearby" 
            message="Expand your radius or check back later to find peers around you." 
          />
        }
        refreshing={loading}
        onRefresh={refetch}
      />
    </View>
  );
};

export default ProximityFeedScreen;

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
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: 12,
    fontSize: 15,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  errorBanner: {
    backgroundColor: theme.colors.error + '20',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
});
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { FormattedNearbyPeer } from '../../types';
import { theme } from '../../constants/theme';

export default function ProximityFeedScreen() {
  const { location, isLoading: locationLoading, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);

  if (locationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Acquiring GPS location...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.center}>
        <EmptyState 
          icon={<Ionicons name="location-outline" size={48} color={theme.colors.text.secondary} />}
          title="Location Permission Required"
          description={locationError}
        />
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />
      
      <View style={styles.sliderContainer}>
        <Text style={styles.radiusLabel}>Radius: {selectedRadius}m</Text>
        <RadiusSlider value={selectedRadius} onValueChange={(val) => setRadius(val)} />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading peers: {error.message}</Text>
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
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState 
              icon={<Ionicons name="people-outline" size={48} color={theme.colors.text.secondary} />}
              title="No one nearby"
              description="Expand your radius or check back later to find people around you."
            />
          ) : null
        }
      />
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
    padding: 24,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: 12,
    fontSize: 14,
  },
  sliderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  radiusLabel: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '20',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
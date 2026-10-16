import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';

export default function HomeScreen() {
  const { location, isLoading: locationLoading, error: locationError, permissionStatus, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);

  if (locationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.center}>
        <EmptyState
          icon={<Ionicons name="location-outline" size={48} color={theme.colors.primary.main} />}
          title="Location Permission Required"
          description="We need your location to find nearby people and devices around you."
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
        <Text style={styles.sliderLabel}>Search Radius: {selectedRadius}m</Text>
        <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
      </View>

      {error ? (
        <View style={styles.errorBanner}>
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
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={<Ionicons name="people-outline" size={48} color={theme.colors.text.secondary} />}
              title="No one nearby"
              description="Try increasing your search radius or check back later."
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
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sliderLabel: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: theme.colors.error,
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
});
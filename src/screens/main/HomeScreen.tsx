import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { FormattedNearbyPeer } from '../../types';

export default function HomeScreen() {
  const { location, isLoading: locationLoading, error: locationError, permissionStatus, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading: peersLoading, isRefreshing, error: peersError, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const [showSlider, setShowSlider] = useState(false);

  const handlePeerPress = (peer: FormattedNearbyPeer) => {
    // Handle peer selection / chat navigation
  };

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
          icon={<Ionicons name="location-outline" size={64} color={theme.colors.primary.main} />}
          title="Location Permission Required"
          description="We need your location to find people nearby."
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

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowSlider(!showSlider)}>
          <Ionicons name="options-outline" size={16} color={theme.colors.primary.main} />
          <Text style={styles.filterButtonText}>Radius: {selectedRadius}m</Text>
        </TouchableOpacity>
      </View>

      {showSlider && (
        <View style={styles.sliderContainer}>
          <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
        </View>
      )}

      {peersLoading && !isRefreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Scanning for nearby peers...</Text>
        </View>
      ) : peers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon={<Ionicons name="people-outline" size={64} color={theme.colors.text.secondary} />}
            title="No One Nearby"
            description="Try increasing your radius to find more people."
          />
        </View>
      ) : (
        <FlatList
          data={peers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NearbyPeerCard peer={item} onPress={() => handlePeerPress(item)} />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
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
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: 12,
    fontSize: 14,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    flexDirection: 'row',
    alignItem: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonText: {
    color: theme.colors.text.primary,
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  sliderContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContainer: {
    padding: 16,
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
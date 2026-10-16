import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';

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

  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="location-outline" size={64} color={theme.colors.primary.main} />
        <Text style={styles.errorTitle}>Location Permission Needed</Text>
        <Text style={styles.errorText}>
          We need your location to discover people around you.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLocationLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      <View style={styles.filterSection}>
        <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error.message}</Text>
        </View>
      )}

      {isPeersLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Scanning nearby peers...</Text>
        </View>
      ) : (
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
              description="Try expanding your search radius to find more people."
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
  centerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: 12,
    fontSize: 14,
  },
  errorTitle: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  errorBanner: {
    backgroundColor: theme.colors.error + '20',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorBannerText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
});
import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { FormattedNearbyPeer } from '../../types';

export default function ProximityFeedScreen(): React.JSX.Element {
  const { location, isLoading: locationLoading, error: locationError } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);

  const handleSelectPeer = (peer: FormattedNearbyPeer) => {
    // Navigate or show peer detail
  };

  if (locationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon={<Ionicons name="location-outline" size={48} color={theme.colors.error} />}
          title="Location Error"
          description={locationError}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      <View style={styles.sliderContainer}>
        <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      <FlatList<FormattedNearbyPeer>
        data={peers}
        keyExtractor={(item: FormattedNearbyPeer) => item.id}
        renderItem={({ item }: { item: FormattedNearbyPeer }) => (
          <NearbyPeerCard peer={item} onPress={() => handleSelectPeer(item)} />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={<Ionicons name="radio-outline" size={48} color={theme.colors.text.secondary} />}
              title="No one nearby"
              description="Try expanding your radius or check back later."
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
    fontSize: 15,
  },
  sliderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  errorBanner: {
    backgroundColor: theme.colors.error + '20',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontSize: 14,
  },
});
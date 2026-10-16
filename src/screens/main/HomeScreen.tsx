import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../hooks/proximity/useNearbyPeers';

export default function HomeScreen() {
  const { location, isLoading: isLocationLoading, error: locationError } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);

  if (isLocationLoading && !location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locationError) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState 
          icon={<Ionicons name="location-outline" size={48} color={theme.colors.error} />}
          title="Location Error"
          description={locationError}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Radius: {selectedRadius}m</Text>
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
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState 
              icon={<Ionicons name="people-outline" size={48} color={theme.colors.text.secondary} />}
              title="No peers nearby"
              description="Try increasing your radius or check back later."
            />
          ) : null
        }
      />

      {isLoading && !isRefreshing && (
        <View style={styles.absoluteLoading}>
          <ActivityIndicator size="small" color={theme.colors.primary.main} />
        </View>
      )}
    </SafeAreaView>
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
    borderColor: theme.colors.border,
  },
  sliderLabel: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  listContent: {
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
    fontSize: 14,
    textAlign: 'center',
  },
  absoluteLoading: {
    position: 'absolute',
    top: 60,
    right: 16,
  },
});
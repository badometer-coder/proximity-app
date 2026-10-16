import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';

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
          icon={<Ionicons name="location-outline" size={48} color={theme.colors.error} />}
          title="Location Required"
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
        <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Scanning nearby peers...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <EmptyState 
            icon={<Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />}
            title="Scan Failed"
            description={error.message}
          />
          <TouchableOpacity style={styles.button} onPress={refresh}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
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
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
          }
          ListEmptyComponent={
            <EmptyState 
              icon={<Ionicons name="radio-outline" size={48} color={theme.colors.text.secondary} />}
              title="No one nearby"
              description="Expand your radius or check back soon to discover people around you."
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
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: 16,
    fontSize: 14,
  },
  sliderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listContent: {
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
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
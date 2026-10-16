import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';
import { ChatThreadScreen } from './ChatThreadScreen';
import { useAuth } from '../../hooks/auth/useAuth';

export default function ProximityFeedScreen() {
  const { location, isLoading: locationLoading, permissionStatus, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);
  const { session } = useAuth();

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          icon={<Ionicons name="location-outline" size={48} color={theme.colors.primary.main} />}
          title="Location Permission Required"
          description="We need your location to find people nearby."
        />
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (selectedPeer) {
    return (
      <ChatThreadScreen
        userId={selectedPeer.id}
        userName={selectedPeer.full_name || selectedPeer.username}
        myId={session?.user?.id ?? null}
        onBack={() => setSelectedPeer(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      <View style={styles.sliderContainer}>
        <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <EmptyState
            icon={<Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />}
            title="Error Loading Peers"
            description={error.message}
          />
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
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Ionicons name="people-outline" size={48} color={theme.colors.text.secondary} />}
              title="No one nearby"
              description="Try increasing your search radius to find more people."
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  button: {
    marginTop: 16,
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
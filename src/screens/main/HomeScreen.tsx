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
import { ChatThreadScreen } from './ChatThreadScreen';
import { FormattedNearbyPeer } from '../../types';
import { useAuth } from '../../hooks/auth/useAuth';

export default function HomeScreen() {
  const { location, isLoading: locationLoading, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const { user } = useAuth();

  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);

  if (selectedPeer) {
    return (
      <ChatThreadScreen
        userId={selectedPeer.id}
        userName={selectedPeer.full_name || selectedPeer.username}
        myId={user?.id ?? null}
        onBack={() => setSelectedPeer(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      {locationError && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Location permission needed to find nearby peers.</Text>
          <TouchableOpacity style={styles.bannerButton} onPress={requestPermission}>
            <Text style={styles.bannerButtonText}>Grant</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.sliderLabel}>Radius</Text>
          <Text style={styles.sliderValue}>{selectedRadius}m</Text>
        </View>
        <RadiusSlider value={selectedRadius} onValueChange={(val: number) => setRadius(val)} />
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
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
              icon={<Ionicons name="radio-outline" size={48} color={theme.colors.text.secondary} />}
              title="No peers nearby"
              description="Try expanding your radius or checking back when others are around."
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
    paddingTop: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    backgroundColor: theme.colors.surfaceLight,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bannerText: {
    color: theme.colors.text.primary,
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  bannerButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bannerButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sliderContainer: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  sliderValue: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingTop: 4,
  },
});
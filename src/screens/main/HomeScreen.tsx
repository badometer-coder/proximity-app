import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, SafeAreaStorage, TouchableOpacity } from 'react-native';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers, FormattedNearbyPeer } from '../../hooks/proximity/useNearbyPeers';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Avatar } from '../../components/common/Avatar';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ChatThreadScreen } from './ChatThreadScreen';
import { useAuth } from '../../hooks/auth/useAuth';

export default function HomeScreen() {
  const { location, isLoading: locationLoading, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading: peersLoading, isRefreshing, error: peersError, setRadius, refresh } = useNearbyPeers(location);
  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);
  const { session } = useAuth();

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
      <ProximityHeader lastUpdated={null} />

      <View style={styles.content}>
        <View style={styles.sliderContainer}>
          <Text style={styles.radiusLabel}>Radius: {selectedRadius}m</Text>
          <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
        </View>

        {locationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{locationError}</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}

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
              title="No peers nearby"
              description="Try increasing your radius or check back later."
            />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sliderContainer: {
    marginVertical: 12,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  radiusLabel: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 24,
  },
  errorContainer: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
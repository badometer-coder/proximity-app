import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { useAuth } from '../../hooks/auth/useAuth';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { ChatThreadScreen } from './ChatThreadScreen';

export default function HomeScreen() {
  const { user } = useAuth();
  const { location, isLoading: isLocationLoading, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading: isPeersLoading, isRefreshing, error: peersError, setRadius, refresh } = useNearbyPeers(location);

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
    <SafeAreaView style={styles.container}>
      <ProximityHeader lastUpdated={new Date().toLocaleTimeString()} />

      <View style={styles.content}>
        {!location ? (
          <View style={styles.permissionContainer}>
            <EmptyState
              icon={<Ionicons name="location-outline" size={64} color={theme.colors.primary.main} />}
              title="Location Required"
              description="Please enable location permissions to discover people nearby."
            />
            <TouchableOpacity style={styles.button} onPress={requestPermission}>
              <Text style={styles.buttonText}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.sliderContainer}>
              <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
            </View>

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
                !isPeersLoading ? (
                  <EmptyState
                    icon={<Ionicons name="people-outline" size={64} color={theme.colors.text.secondary} />}
                    title="No One Nearby"
                    description="Try increasing your radius or check back later."
                  />
                ) : null
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sliderContainer: {
    marginVertical: 12,
  },
  listContainer: {
    paddingBottom: 24,
  },
});
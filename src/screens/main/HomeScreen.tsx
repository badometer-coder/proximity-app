import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { EmptyState } from '../../components/common/EmptyState';

export const HomeScreen = () => {
  const { location, errorMsg: locationError, refreshLocation } = useCurrentLocation();
  const { peers, radius, setRadius, loading, refreshPeers } = useNearbyPeers();

  const handleRefresh = () => {
    refreshLocation();
    refreshPeers();
  };

  return (
    <View style={styles.container}>
      <ProximityHeader 
        radius={radius} 
        onRadiusChange={setRadius} 
        onRefresh={handleRefresh}
        isRefreshing={loading}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Radar Active</Text>
            <Text style={styles.bannerSubtitle}>
              {locationError ? 'Location unavailable' : `${peers.length} people found nearby`}
            </Text>
          </View>
          <Ionicons name="radio" size={32} color={theme.colors.primary.main} />
        </View>

        <Text style={styles.sectionTitle}>Nearby Users</Text>

        {peers.length === 0 ? (
          <EmptyState 
            icon="people-outline" 
            title="No one nearby" 
            message="Try increasing your radar radius using the filter above to find people further away." 
          />
        ) : (
          peers.map((peer) => (
            <NearbyPeerCard 
              key={peer.id} 
              peer={peer} 
              onPress={() => {}} 
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  banner: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
  },
  bannerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
});

export default HomeScreen;
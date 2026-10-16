import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';

interface ProximityFeedScreenProps {
  navigation?: any;
}

export default function ProximityFeedScreen({ navigation }: ProximityFeedScreenProps) {
  const { location, isLoading: locationLoading, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading: peersLoading, isRefreshing, error: peersError, setRadius, refresh } = useNearbyPeers(location);

  const [showRadiusSlider, setShowRadiusSlider] = useState(false);

  const handlePeerPress = (peer: FormattedNearbyPeer) => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ChatThreadScreen', { userId: peer.id, userName: peer.full_name || peer.username });
    }
  };

  if (locationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Acquiring location...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon="location-outline"
          title="Location Required"
          description={locationError || "Please enable location permissions to find nearby people."}
        />
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={null} />

      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowRadiusSlider(!showRadiusSlider)}
        >
          <Ionicons name="filter" size={16} color={theme.colors.primary.main} />
          <Text style={styles.filterButtonText}>Radius: {selectedRadius}m</Text>
        </TouchableOpacity>
      </View>

      {showRadiusSlider && (
        <View style={styles.sliderContainer}>
          <RadiusSlider 
            value={selectedRadius} 
            onValueChange={(val) => setRadius(val)} 
          />
        </View>
      )}

      {peersError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{peersError.message}</Text>
        </View>
      )}

      <FlatList
        data={peers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NearbyPeerCard 
            peer={item} 
            onPress={() => handlePeerPress(item)} 
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
        }
        ListEmptyComponent={
          !peersLoading ? (
            <EmptyState
              icon="reader-outline"
              title="No one nearby"
              description="Try expanding your radius or check back later when more people are active."
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
    fontSize: 14,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    flexDirection: 'row',
    alignItem: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonText: {
    color: theme.colors.text.primary,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  sliderContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  errorBanner: {
    backgroundColor: theme.colors.error,
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 13,
  },
});
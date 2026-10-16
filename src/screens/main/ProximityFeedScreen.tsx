import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';

interface ProximityFeedScreenProps {
  onSelectPeer?: (peer: FormattedNearbyPeer) => void;
}

export default function ProximityFeedScreen({ onSelectPeer }: ProximityFeedScreenProps) {
  const { location, isLoading: locationLoading, error: locationError, permissionStatus, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading: peersLoading, isRefreshing, error: peersError, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);

  if (locationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Acquiring GPS location...</Text>
      </View>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.center}>
        <EmptyState
          icon={<Ionicons name="location-outline" size={48} color={theme.colors.text.secondary} />}
          title="Location Permission Required"
          description="We need your location to find people nearby."
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

      {peersLoading && !isRefreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Scanning nearby peers...</Text>
        </View>
      ) : peersError ? (
        <View style={styles.center}>
          <EmptyState
            icon={<Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />}
            title="Scan Failed"
            description={peersError.message}
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
              onPress={() => onSelectPeer?.(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshing={isRefreshing}
          onRefresh={refresh}
          ListEmptyComponent={
            <EmptyState
              icon={<Ionicons name="people-outline" size={48} color={theme.colors.text.secondary} />}
              title="No one nearby"
              description="Try expanding your search radius using the slider above."
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
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listContainer: {
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
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
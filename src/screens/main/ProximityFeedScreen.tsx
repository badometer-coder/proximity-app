import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { ChatThreadScreen } from './ChatThreadScreen';
import { useAuth } from '../../hooks/auth/useAuth';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';

export default function ProximityFeedScreen() {
  const { location, isLoading: locationLoading, error: locationError, permissionStatus, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading: peersLoading, isRefreshing, error: peersError, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const { user } = useAuth();

  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);

  if (selectedPeer) {
    return (
      <ChatThreadScreen
        userId={selectedPeer.id}
        userName={selectedPeer.full_name}
        myId={user?.id ?? null}
        onBack={() => setSelectedPeer(null)}
      />
    );
  }

  if (locationLoading || (peersLoading && !isRefreshing)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Finding people nearby...</Text>
      </View>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.center}>
        <EmptyState
          icon={<Ionicons name="location-outline" size={48} color={theme.colors.text.secondary} />}
          title="Location Permission Required"
          description="We need your location to discover people around you."
        />
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon={<Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />}
          title="Location Error"
          description={locationError}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      <View style={styles.filterContainer}>
        <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
      </View>

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
            onPress={() => setSelectedPeer(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary.main}
          />
        }
        ListEmptyComponent={
          !peersLoading ? (
            <EmptyState
              icon={<Ionicons name="people-outline" size={48} color={theme.colors.text.secondary} />}
              title="No One Nearby"
              description="Expand your radius or check back later to find more people."
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
    marginTop: 16,
    fontSize: 14,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
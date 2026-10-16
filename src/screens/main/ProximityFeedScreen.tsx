import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { FormattedNearbyPeer } from '../../types';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';

interface ProximityFeedScreenProps {
  navigation?: any;
}

export default function ProximityFeedScreen({ navigation }: ProximityFeedScreenProps) {
  const { location, isLoading: locationLoading, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);

  const handlePeerPress = (peer: FormattedNearbyPeer) => {
    if (navigation?.navigate) {
      navigation.navigate('ChatThreadScreen', { userId: peer.id, userName: peer.full_name });
    }
  };

  if (locationLoading && !location) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Acquiring GPS location...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          icon="location-outline"
          title="Location Access Required"
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

      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={styles.radiusButton} 
          onPress={() => setShowRadiusSlider(!showRadiusSlider)}
        >
          <Ionicons name="options-outline" size={16} color={theme.colors.primary.main} />
          <Text style={styles.radiusButtonText}>Radius: {selectedRadius}m</Text>
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

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error.message}</Text>
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
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={refresh} 
            tintColor={theme.colors.primary.main} 
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="reader-outline"
              title="No one nearby"
              description="Try increasing your search radius or check back later."
            />
          ) : null
        }
      />

      {isLoading && !isRefreshing && peers.length === 0 && (
        <View style={styles.absoluteLoading}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
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
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: 12,
    fontSize: 14,
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  radiusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  radiusButtonText: {
    color: theme.colors.text.primary,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  sliderContainer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  errorBanner: {
    backgroundColor: theme.colors.error + '22',
    padding: 10,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  absoluteLoading: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
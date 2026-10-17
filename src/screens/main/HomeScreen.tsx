import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { FormattedNearbyPeer } from '../../types';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { Avatar } from '../../components/common/Avatar';
import { theme } from '../../constants/theme';
import { ChatThreadScreen } from './ChatThreadScreen';
import { useAuth } from '../../hooks/auth/useAuth';

export const HomeScreen: React.FC = () => {
  const { location, isLoading: locationLoading, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading: peersLoading, isRefreshing, error: peersError, setRadius, refresh } = useNearbyPeers(location);
  const { user } = useAuth();

  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);
  const [activeTab, setActiveTab] = useState<'radar' | 'list'>('radar');

  if (locationLoading) {
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
          icon={<Ionicons name="location-outline" size={48} color={theme.colors.error} />} 
          title="Location Access Required" 
          description={locationError} 
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
        myId={user?.id ?? null}
        onBack={() => setSelectedPeer(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={null} />

      <View style={styles.filterSection}>
        <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
        
        <View style={styles.tabRow}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'radar' && styles.activeTabButton]}
            onPress={() => setActiveTab('radar')}
          >
            <Ionicons name="compass" size={16} color={activeTab === 'radar' ? '#FFF' : theme.colors.text.secondary} />
            <Text style={[styles.tabButtonText, activeTab === 'radar' && styles.activeTabButtonText]}>Radar View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'list' && styles.activeTabButton]}
            onPress={() => setActiveTab('list')}
          >
            <Ionicons name="list" size={16} color={activeTab === 'list' ? '#FFF' : theme.colors.text.secondary} />
            <Text style={[styles.tabButtonText, activeTab === 'list' && styles.activeTabButtonText]}>List View</Text>
          </TouchableOpacity>
        </View>
      </View>

      {peersLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Scanning for nearby peers...</Text>
        </View>
      ) : peersError ? (
        <View style={styles.centerContainer}>
          <EmptyState 
            icon={<Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />} 
            title="Failed to Load Peers" 
            description={peersError.message} 
          />
        </View>
      ) : peers.length === 0 ? (
        <View style={styles.centerContainer}>
          <EmptyState 
            icon={<Ionicons name="people-outline" size={48} color={theme.colors.text.secondary} />} 
            title="No One Nearby" 
            description="Try expanding your search radius to find people close to you." 
          />
        </View>
      ) : activeTab === 'list' ? (
        <FlatList
          data={peers}
          keyExtractor={(item: FormattedNearbyPeer) => item.id}
          renderItem={({ item }: { item: FormattedNearbyPeer }) => (
            <NearbyPeerCard peer={item} onPress={() => setSelectedPeer(item)} />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
          }
        />
      ) : (
        <View style={styles.radarContainer}>
          <View style={styles.radarRingLarge}>
            <View style={styles.radarRingMedium}>
              <View style={styles.radarRingSmall}>
                <View style={styles.radarCenterDot} />
              </View>
            </View>
          </View>

          {peers.map((peer: FormattedNearbyPeer, index: number) => {
            const angle = (index / peers.length) * 2 * Math.PI;
            const distanceRatio = Math.min(peer.distance_meters / (selectedRadius * 1000), 1);
            const radiusOffset = distanceRatio * 120;
            const x = Math.cos(angle) * radiusOffset;
            const y = Math.sin(angle) * radiusOffset;

            return (
              <TouchableOpacity
                key={peer.id}
                style={[styles.radarPeerNode, { transform: [{ translateX: x }, { translateY: y }] }]}
                onPress={() => setSelectedPeer(peer)}
              >
                <Avatar uri={peer.avatar_url} name={peer.full_name || peer.username} size={36} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
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
  filterSection: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary.main,
  },
  tabButtonText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#FFF',
  },
  listContainer: {
    padding: 16,
  },
  radarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarRingLarge: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarRingMedium: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarRingSmall: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCenterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary.main,
  },
  radarPeerNode: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
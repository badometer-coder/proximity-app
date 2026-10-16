import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { FormattedNearbyPeer } from '../../types';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { Avatar } from '../../components/common/Avatar';
import { formatRelativeTime } from '../../lib/utils';

export default function ProximityFeedScreen() {
  const { location, isLoading: isLocationLoading, permissionStatus, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);
  const [showRadiusModal, setShowRadiusModal] = useState(false);

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

  if (isLocationLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt ? formatRelativeTime(lastFetchedAt) : null} />

      <View style={styles.filterRow}>
        <Text style={styles.radiusText}>Radius: {selectedRadius}m</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowRadiusModal(true)}>
          <Ionicons name="options-outline" size={16} color={theme.colors.text.primary} />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
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
              icon={<Ionicons name="people-outline" size={48} color={theme.colors.text.secondary} />}
              title="No one nearby"
              description="Try expanding your radius to find more peers."
            />
          }
        />
      )}

      <Modal visible={showRadiusModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Radius</Text>
            <RadiusSlider
              value={selectedRadius}
              onValueChange={(val) => setRadius(val)}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowRadiusModal(false)}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={selectedPeer !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPeer && (
              <>
                <Avatar uri={selectedPeer.avatar_url} name={selectedPeer.full_name} size={80} />
                <Text style={styles.peerName}>{selectedPeer.full_name}</Text>
                <Text style={styles.peerUsername}>@{selectedPeer.username}</Text>
                <Text style={styles.peerDistance}>{selectedPeer.formatted_distance} away</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPeer(null)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, padding: 24 },
  loadingText: { color: theme.colors.text.secondary, marginTop: 12, fontSize: 14 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  radiusText: { color: theme.colors.text.primary, fontSize: 14, fontWeight: '500' },
  filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border },
  filterButtonText: { color: theme.colors.text.primary, fontSize: 12, marginLeft: 4 },
  errorBanner: { backgroundColor: theme.colors.error, padding: 8, alignItems: 'center' },
  errorText: { color: '#FFF', fontSize: 12 },
  listContainer: { padding: 16 },
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 24, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 16 },
  closeButton: { backgroundColor: theme.colors.primary.main, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  closeButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  button: { backgroundColor: theme.colors.primary.main, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  buttonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  peerName: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text.primary, marginTop: 12 },
  peerUsername: { fontSize: 14, color: theme.colors.text.secondary, marginTop: 4 },
  peerDistance: { fontSize: 14, color: theme.colors.primary.light, marginTop: 8 },
});
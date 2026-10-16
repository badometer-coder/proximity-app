import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { ChatThreadScreen } from './ChatThreadScreen';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';
import { useAuth } from '../../hooks/auth/useAuth';

export default function ProximityFeedScreen() {
  const { location, isLoading: locationLoading, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading: peersLoading, isRefreshing, error: peersError, setRadius, refresh } = useNearbyPeers(location);
  const { user } = useAuth();
  
  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);
  const [showRadiusModal, setShowRadiusModal] = useState(false);

  const handleSelectPeer = (peer: FormattedNearbyPeer) => {
    setSelectedPeer(peer);
  };

  const handleCloseChat = () => {
    setSelectedPeer(null);
  };

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
      <ProximityHeader lastUpdated={new Date().toLocaleTimeString()} />

      <View style={styles.controlBar}>
        <Text style={styles.radiusLabel}>Radius: {selectedRadius}m</Text>
        <TouchableOpacity style={styles.radiusButton} onPress={() => setShowRadiusModal(true)}>
          <Ionicons name="options-outline" size={18} color="#FFF" />
          <Text style={styles.radiusButtonText}>Change Radius</Text>
        </TouchableOpacity>
      </View>

      {peersLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Scanning nearby peers...</Text>
        </View>
      ) : peersError ? (
        <View style={styles.centerContainer}>
          <EmptyState
            icon="alert-circle-outline"
            title="Failed to Load Peers"
            description={peersError.message}
          />
        </View>
      ) : (
        <FlatList
          data={peers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NearbyPeerCard peer={item} onPress={() => handleSelectPeer(item)} />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="radio-outline"
              title="No One Nearby"
              description="No other users found within your current radius. Try expanding your search."
            />
          }
        />
      )}

      {/* Radius adjustment modal */}
      <Modal visible={showRadiusModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adjust Search Radius</Text>
            <RadiusSlider value={selectedRadius} onValueChange={(val: number) => setRadius(val)} />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowRadiusModal(false)}>
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Chat Thread Modal */}
      <Modal visible={selectedPeer !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedPeer && (
          <ChatThreadScreen
            userId={selectedPeer.id}
            userName={selectedPeer.full_name}
            myId={user?.id ?? null}
            onBack={handleCloseChat}
          />
        )}
      </Modal>
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
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  radiusLabel: {
    color: theme.colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  radiusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  radiusButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: theme.colors.primary.main,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  modalCloseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
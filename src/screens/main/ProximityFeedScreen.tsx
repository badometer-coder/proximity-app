import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { Avatar } from '../../components/common/Avatar';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';

export default function ProximityFeedScreen() {
  const { location, isLoading: locationLoading, requestPermission } = useCurrentLocation();
  const {
    peers,
    selectedRadius,
    isLoading: peersLoading,
    isRefreshing,
    error,
    lastFetchedAt,
    setRadius,
    refresh,
  } = useNearbyPeers(location);

  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);
  const [showRadiusModal, setShowRadiusModal] = useState(false);

  const isLoading = locationLoading || peersLoading;

  if (!location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <EmptyState
            icon={<Ionicons name="location-outline" size={64} color={theme.colors.primary.main} />}
            title="Location Required"
            description="We need your location to find people nearby."
          />
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.radiusButton}
          onPress={() => setShowRadiusModal(true)}
        >
          <Ionicons name="options-outline" size={16} color={theme.colors.primary.main} />
          <Text style={styles.radiusButtonText}>Radius: {selectedRadius}m</Text>
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
          <Text style={styles.loadingText}>Scanning proximity...</Text>
        </View>
      ) : peers.length === 0 ? (
        <View style={styles.centerContainer}>
          <EmptyState
            icon={<Ionicons name="radio-outline" size={64} color={theme.colors.text.secondary} />}
            title="No One Nearby"
            description="No peers detected within your current radius. Try increasing the search distance."
          />
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
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={theme.colors.primary.main}
            />
          }
        />
      )}

      {/* Peer Details Modal */}
      <Modal
        visible={selectedPeer !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedPeer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPeer && (
              <>
                <View style={styles.modalHeader}>
                  <Avatar uri={selectedPeer.avatar_url} name={selectedPeer.full_name} size={64} />
                  <Text style={styles.modalName}>{selectedPeer.full_name}, {selectedPeer.age}</Text>
                  <Text style={styles.modalUsername}>@{selectedPeer.username}</Text>
                </View>

                <View style={styles.modalDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Distance</Text>
                    <Text style={styles.detailValue}>{selectedPeer.formatted_distance}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Signal Strength</Text>
                    <Text style={styles.detailValue}>{selectedPeer.signal_strength}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={styles.detailValue}>{selectedPeer.presence_status}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedPeer(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Radius Slider Modal */}
      <Modal
        visible={showRadiusModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowRadiusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.radiusModalContent}>
            <Text style={styles.modalTitle}>Select Search Radius</Text>
            <RadiusSlider
              value={selectedRadius}
              onValueChange={(val: number) => setRadius(val)}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRadiusModal(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  radiusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  radiusButtonText: {
    marginLeft: 6,
    color: theme.colors.text.primary,
    fontSize: 13,
    fontWeight: '500',
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
    textAlign: 'center',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  button: {
    marginTop: 16,
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 350,
  },
  radiusModalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 250,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 12,
  },
  modalUsername: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  modalDetails: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: theme.colors.primary.main,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
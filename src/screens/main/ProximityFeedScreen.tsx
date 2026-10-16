import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
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
  const { location, isLoading: isLocationLoading, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const { session } = useAuth();

  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);
  const [showRadiusModal, setShowRadiusModal] = useState(false);

  if (isLocationLoading && !location) {
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
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowRadiusModal(true)}
        >
          <Ionicons name="options-outline" size={16} color={theme.colors.primary.main} />
          <Text style={styles.filterButtonText}>Radius: {selectedRadius}m</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.radarButton} onPress={refresh}>
          <Ionicons name="reader-outline" size={16} color="#FFF" />
          <Text style={styles.radarButtonText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      ) : null}

      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Scanning for nearby peers...</Text>
        </View>
      ) : peers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="people-outline"
            title="No One Nearby"
            description="We couldn't find any peers within your selected radius. Try expanding your search range."
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

      {/* Radius adjustment modal */}
      <Modal
        visible={showRadiusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRadiusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Search Radius</Text>
            <Text style={styles.modalSubtitle}>{selectedRadius} meters</Text>

            <RadiusSlider
              value={selectedRadius}
              onValueChange={(val) => setRadius(val)}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowRadiusModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Chat Thread Modal */}
      <Modal
        visible={selectedPeer !== null}
        animationType="slide"
        onRequestClose={() => setSelectedPeer(null)}
      >
        {selectedPeer && (
          <ChatThreadScreen
            userId={selectedPeer.id}
            userName={selectedPeer.full_name || selectedPeer.username}
            myId={session?.user?.id ?? null}
            onBack={() => setSelectedPeer(null)}
          />
        )}
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
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: 12,
    fontSize: 14,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonText: {
    color: theme.colors.text.primary,
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  radarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  radarButtonText: {
    color: '#FFF',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: theme.colors.error,
    padding: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#FFF',
    fontSize: 13,
  },
  listContainer: {
    padding: 16,
  },
  permissionButton: {
    marginTop: 16,
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 20,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary.main,
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
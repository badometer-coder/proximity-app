import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { Avatar } from '../../components/common/Avatar';
import { FormattedNearbyPeer } from '../../types';
import { formatDistance, formatRelativeTime, getPresenceColor, getSignalBars } from '../../lib/utils';
import { ChatThreadScreen } from './ChatThreadScreen';
import { useAuth } from '../../hooks/auth/useAuth';

export default function ProximityFeedScreen() {
  const { location, isLoading: locationLoading, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const { user } = useAuth();

  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);
  const [showRadiusModal, setShowRadiusModal] = useState(false);

  if (locationLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Acquiring GPS location...</Text>
      </View>
    );
  }

  if (locationError || !location) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          icon={<Ionicons name="location-outline" size={48} color={theme.colors.text.secondary} />}
          title="Location Access Required"
          description={locationError || "Please enable location services to find nearby peers."}
        />
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt ? formatRelativeTime(lastFetchedAt) : null} />

      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.radiusButton} onPress={() => setShowRadiusModal(true)}>
          <Ionicons name="radio-outline" size={16} color={theme.colors.primary.main} />
          <Text style={styles.radiusButtonText}>Radius: {selectedRadius >= 1000 ? `${selectedRadius / 1000}km` : `${selectedRadius}m`}</Text>
        </TouchableOpacity>
      </View>

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
            onPress={() => setSelectedPeer(item)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={<Ionicons name="people-outline" size={48} color={theme.colors.text.secondary} />}
              title="No one nearby"
              description="Try increasing your search radius or check back later."
            />
          ) : null
        }
      />

      <Modal visible={showRadiusModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Search Radius</Text>
            <RadiusSlider
              value={selectedRadius}
              onValueChange={(val) => setRadius(val)}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowRadiusModal(false)}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={selectedPeer !== null} animationType="slide">
        {selectedPeer && (
          <View style={styles.detailContainer}>
            <View style={styles.detailHeader}>
              <TouchableOpacity onPress={() => setSelectedPeer(null)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.detailHeaderTitle}>Peer Profile</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.profileSection}>
              <Avatar uri={selectedPeer.avatar_url} name={selectedPeer.full_name} size={80} />
              <Text style={styles.profileName}>{selectedPeer.full_name}, {selectedPeer.age}</Text>
              <Text style={styles.profileUsername}>@{selectedPeer.username}</Text>

              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Ionicons name="location" size={14} color={theme.colors.primary.main} />
                  <Text style={styles.badgeText}>{formatDistance(selectedPeer.distance_meters)}</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="wifi" size={14} color={theme.colors.success} />
                  <Text style={styles.badgeText}>{getSignalBars(selectedPeer.signal_strength)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.chatSection}>
              <ChatThreadScreen
                userId={selectedPeer.id}
                userName={selectedPeer.full_name}
                myId={user?.id ?? null}
                onBack={() => setSelectedPeer(null)}
              />
            </View>
          </View>
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
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  radiusButton: {
    flexDirection: 'row',
    alignItem: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  radiusButtonText: {
    color: theme.colors.text.primary,
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: theme.colors.primary.main,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailHeaderTitle: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 10,
  },
  profileUsername: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  badgeText: {
    color: theme.colors.text.primary,
    fontSize: 12,
  },
  chatSection: {
    flex: 1,
  },
});
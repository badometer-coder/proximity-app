import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator, 
  TouchableOpacity,
  Modal,
  SafeAreaView
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
import { ChatThreadScreen } from './ChatThreadScreen';
import { useAuth } from '../../hooks/auth/useAuth';

export default function ProximityFeedScreen() {
  const { location, isLoading: locationLoading, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const { session } = useAuth();
  
  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [chatPeer, setChatPeer] = useState<FormattedNearbyPeer | null>(null);

  if (chatPeer) {
    return (
      <ChatThreadScreen 
        userId={chatPeer.id} 
        userName={chatPeer.full_name} 
        myId={session?.user?.id ?? null} 
        onBack={() => setChatPeer(null)} 
      />
    );
  }

  if (locationLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Acquiring location...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState 
          icon="location-outline"
          title="Location Required"
          description={locationError}
        />
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      <View style={styles.controlsBar}>
        <View style={styles.radiusBadge}>
          <Ionicons name="radio-outline" size={16} color={theme.colors.primary.main} />
          <Text style={styles.radiusBadgeText}>Radius: {selectedRadius}m</Text>
        </View>

        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowRadiusModal(true)}
        >
          <Ionicons name="options-outline" size={16} color="#FFF" />
          <Text style={styles.filterButtonText}>Adjust</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      ) : null}

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
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState 
              icon="people-outline" 
              title="No one nearby" 
              description={`We couldn't find anyone within ${selectedRadius} meters. Try expanding your radius!`} 
            />
          ) : null
        }
      />

      {/* Radius Adjustment Modal */}
      <Modal
        visible={showRadiusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRadiusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Proximity Radius</Text>
            <Text style={styles.modalSubtitle}>{selectedRadius} meters</Text>

            <RadiusSlider 
              value={selectedRadius} 
              onValueChange={(val: number) => setRadius(val)} 
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

      {/* Peer Details Modal */}
      <Modal
        visible={selectedPeer !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPeer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalContent}>
            {selectedPeer && (
              <>
                <View style={styles.modalAvatarContainer}>
                  <Avatar uri={selectedPeer.avatar_url} name={selectedPeer.full_name} size={80} />
                </View>
                <Text style={styles.modalPeerName}>{selectedPeer.full_name}, {selectedPeer.age}</Text>
                <Text style={styles.modalPeerUsername}>@{selectedPeer.username}</Text>
                
                <View style={styles.peerDetailRow}>
                  <Ionicons name="location-outline" size={16} color={theme.colors.text.secondary} />
                  <Text style={styles.peerDetailText}>{selectedPeer.formatted_distance} away</Text>
                </View>

                <TouchableOpacity 
                  style={styles.chatButton}
                  onPress={() => {
                    const peer = selectedPeer;
                    setSelectedPeer(null);
                    setChatPeer(peer);
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={18} color="#FFF" />
                  <Text style={styles.chatButtonText}>Message</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.closeModalTextButton} 
                  onPress={() => setSelectedPeer(null)}
                >
                  <Text style={styles.closeModalText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
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
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: 12,
    fontSize: 16,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  radiusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  radiusBadgeText: {
    color: theme.colors.text.primary,
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 13,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonText: {
    color: '#FFF',
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 13,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginVertical: 12,
  },
  modalCloseButton: {
    backgroundColor: theme.colors.primary.main,
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  profileModalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    margin: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalAvatarContainer: {
    marginBottom: 16,
  },
  modalPeerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  modalPeerUsername: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 12,
  },
  peerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  peerDetailText: {
    color: theme.colors.text.secondary,
    marginLeft: 6,
    fontSize: 14,
  },
  chatButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary.main,
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  chatButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  closeModalTextButton: {
    padding: 8,
  },
  closeModalText: {
    color: theme.colors.text.secondary,
    fontSize: 15,
  },
});
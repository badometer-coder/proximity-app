import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { FormattedNearbyPeer } from '../../types';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { Avatar } from '../../components/common/Avatar';
import { theme } from '../../constants/theme';
import { ChatThreadScreen } from './ChatThreadScreen';
import { useAuth } from '../../hooks/auth/useAuth';

export default function ProximityFeedScreen() {
  const { location, isLoading: isLocationLoading } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const { user } = useAuth();

  const handleOpenChat = (peer: FormattedNearbyPeer) => {
    setSelectedPeer(peer);
    setIsChatModalVisible(true);
  };

  const handleCloseChat = () => {
    setIsChatModalVisible(false);
    setSelectedPeer(null);
  };

  if (isLocationLoading && peers.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Acquiring GPS location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.sliderLabel}>Search Radius</Text>
          <Text style={styles.sliderValue}>{selectedRadius} meters</Text>
        </View>
        <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      <FlatList
        data={peers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NearbyPeerCard 
            peer={item} 
            onPress={() => handleOpenChat(item)} 
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={<Ionicons name="radar-outline" size={48} color={theme.colors.text.secondary} />}
              title="No one nearby"
              description="Expand your radius or check back later to find people around you."
            />
          ) : null
        }
      />

      <Modal
        visible={isChatModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseChat}
      >
        {selectedPeer && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalPeerInfo}>
                <Avatar uri={selectedPeer.avatar_url} name={selectedPeer.full_name || selectedPeer.username} size={36} />
                <Text style={styles.modalPeerName}>{selectedPeer.full_name || selectedPeer.username}</Text>
              </View>
              <TouchableOpacity onPress={handleCloseChat} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ChatThreadScreen
              userId={selectedPeer.id}
              userName={selectedPeer.full_name || selectedPeer.username}
              myId={user?.id ?? null}
              onBack={handleCloseChat}
            />
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
  center: {
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
  sliderContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    color: theme.colors.text.secondary,
    fontSize: 13,
  },
  sliderValue: {
    color: theme.colors.text.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.text.primary,
    marginLeft: 8,
    fontSize: 13,
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  modalPeerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalPeerName: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
});
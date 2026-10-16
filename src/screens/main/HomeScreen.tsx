import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Modal, Scrollbar } from 'react-native';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { FormattedNearbyPeer } from '../../types';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { Avatar } from '../../components/common/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { ChatThreadScreen } from './ChatThreadScreen';
import { useAuth } from '../../hooks/auth/useAuth';

export default function HomeScreen() {
  const { location, isLoading: isLocationLoading, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading: isPeersLoading, isRefreshing, error: peersError, setRadius, refresh } = useNearbyPeers(location);
  const { user } = useAuth();
  
  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);
  const [chatPeer, setChatPeer] = useState<FormattedNearbyPeer | null>(null);

  if (isLocationLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Acquiring GPS location...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.center}>
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
    <View style={styles.container}>
      <ProximityHeader lastUpdated={new Date().toLocaleTimeString()} />

      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.sliderLabel}>Search Radius</Text>
          <Text style={styles.sliderValue}>{selectedRadius} km</Text>
        </View>
        <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
      </View>

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
          !isPeersLoading ? (
            <EmptyState 
              icon="people-outline" 
              title="No one nearby" 
              description="Try expanding your radius slider above to find more users in your area." 
            />
          ) : null
        }
      />

      {selectedPeer && (
        <Modal visible={true} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPeer(null)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>

              <View style={styles.modalHeader}>
                <Avatar uri={selectedPeer.avatar_url} name={selectedPeer.full_name} size={80} />
                <Text style={styles.modalName}>{selectedPeer.full_name}</Text>
                <Text style={styles.modalUsername}>@{selectedPeer.username} • {selectedPeer.age} yrs</Text>
                <Text style={styles.modalDistance}>
                  {formatDistance(selectedPeer.distance_meters)} away
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.chatButton} 
                onPress={() => {
                  const p = selectedPeer;
                  setSelectedPeer(null);
                  setChatPeer(p);
                }}
              >
                <Ionicons name="chatbubble" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.chatButtonText}>Open Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {chatPeer && (
        <Modal visible={true} animationType="slide">
          <ChatThreadScreen 
            userId={chatPeer.id} 
            userName={chatPeer.full_name} 
            myId={user?.id ?? null} 
            onBack={() => setChatPeer(null)} 
          />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, padding: 24 },
  loadingText: { color: theme.colors.text.secondary, fontSize: 16 },
  sliderContainer: { backgroundColor: theme.colors.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sliderLabel: { color: theme.colors.text.secondary, fontSize: 14 },
  sliderValue: { color: theme.colors.primary.main, fontWeight: '600', fontSize: 14 },
  listContainer: { padding: 16 },
  button: { backgroundColor: theme.colors.primary.main, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  buttonText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 350, alignItems: 'center' },
  closeButton: { alignSelf: 'flex-end', padding: 4 },
  modalHeader: { alignItems: 'center', marginBottom: 24 },
  modalName: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text.primary, marginTop: 12 },
  modalUsername: { fontSize: 14, color: theme.colors.text.secondary, marginTop: 4 },
  modalDistance: { fontSize: 13, color: theme.colors.primary.main, marginTop: 8, fontWeight: '500' },
  chatButton: { backgroundColor: theme.colors.primary.main, flexDirection: 'row', width: '100%', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  chatButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
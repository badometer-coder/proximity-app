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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { useChatMessages } from '../../hooks/messaging/useChatMessages';
import { useAuth } from '../../hooks/auth/useAuth';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { EmptyState } from '../../components/common/EmptyState';
import { theme } from '../../constants/theme';
import { FormattedNearbyPeer } from '../../types';

export default function ProximityFeedScreen() {
  const { location, isLoading: locationLoading, permissionStatus, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading: peersLoading, isRefreshing, error, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);
  const { user } = useAuth();

  const [selectedPeer, setSelectedPeer] = useState<FormattedNearbyPeer | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  const { messages, isLoading: messagesLoading, sendMessage } = useChatMessages(
    selectedPeer ? selectedPeer.id : '',
    selectedPeer ? selectedPeer.full_name : ''
  );

  const handleSend = async () => {
    if (!messageText.trim()) return;
    await sendMessage(messageText.trim());
    setMessageText('');
  };

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="location-outline" size={64} color={theme.colors.primary.main} style={{ marginBottom: 16 }} />
        <Text style={styles.permissionTitle}>Location Access Required</Text>
        <Text style={styles.permissionDesc}>We need your location to discover people around you in real-time.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (locationLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Acquiring GPS location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />

      <View style={styles.filterBar}>
        <View style={styles.radiusContainer}>
          <Text style={styles.radiusLabel}>Radius: {selectedRadius}m</Text>
          <RadiusSlider value={selectedRadius} onValueChange={(val) => setRadius(val)} />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowSettingsModal(true)}>
          <Ionicons name="filter" size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      {peersLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Scanning for nearby peers...</Text>
        </View>
      ) : peers.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContainer} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />}>
          <EmptyState
            icon={<Ionicons name="reader-outline" size={48} color={theme.colors.text.secondary} />}
            title="No one nearby"
            description="Try expanding your distance radius or check back later."
          />
        </ScrollView>
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
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary.main} />}
        />
      )}

      {/* Chat / Profile Modal */}
      <Modal visible={!!selectedPeer} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPeer?.full_name}</Text>
              <TouchableOpacity onPress={() => setSelectedPeer(null)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.chatArea}>
              {messagesLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary.main} style={{ marginTop: 20 }} />
              ) : (
                <FlatList
                  data={messages}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isMe = item.sender_id === user?.id;
                    return (
                      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
                        <Text style={styles.messageText}>{item.message}</Text>
                      </View>
                    );
                  }}
                  contentContainerStyle={{ padding: 16 }}
                />
              )}
            </View>

            <View style={styles.inputBar}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message..."
                placeholderTextColor={theme.colors.text.secondary}
                value={messageText}
                onChangeText={setMessageText}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Ionicons name="send" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettingsModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModalContent}>
            <Text style={styles.modalTitle}>Feed Settings</Text>
            <Text style={styles.settingsDesc}>Configure how your proximity radar operates.</Text>
            
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowSettingsModal(false)}>
              <Text style={styles.closeModalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: 12,
    fontSize: 14,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  radiusContainer: {
    flex: 1,
    marginRight: 12,
  },
  radiusLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  filterButton: {
    padding: 8,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    marginLeft: 8,
    fontSize: 13,
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  settingsModalContent: {
    backgroundColor: theme.colors.surface,
    margin: 24,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  settingsDesc: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginVertical: 12,
  },
  closeModalButton: {
    backgroundColor: theme.colors.primary.main,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeModalButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: theme.colors.primary.main,
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#FFF',
    fontSize: 14,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#FFF',
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: theme.colors.primary.main,
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
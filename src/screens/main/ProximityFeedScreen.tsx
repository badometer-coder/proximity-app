import React, { useEffect } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, StyleSheet, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusWheel } from '../../components/proximity/RadiusWheel';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { EmptyState } from '../../components/common/EmptyState';
import { theme } from '../../constants/theme';

export const ProximityFeedScreen = ({ navigation }: { navigation?: any }) => {
  const { location, permissionStatus, isLoading: isLocLoading, error: locError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, lastFetchedAt, setRadius, refresh } = useNearbyPeers(location);

  // 1. Ask for permission if undetermined
  useEffect(() => {
    if (permissionStatus === 'undetermined') {
      requestPermission();
    }
  }, [permissionStatus, requestPermission]);

  // 2. Handle permission denied error
  useEffect(() => {
    if (locError && permissionStatus === 'denied') {
      Alert.alert('Location Required', 'Please enable location services in settings.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
    }
  }, [locError, permissionStatus]);

  const isInitialLoading = isLocLoading || (isLoading && !lastFetchedAt);

  return (
    <SafeAreaView style={styles.container}>
      <ProximityHeader lastUpdated={lastFetchedAt} />
      
      {/* The smooth iOS-style number scroller */}
      <RadiusWheel value={selectedRadius} onValueChange={setRadius} />
      
      <FlatList
        data={peers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NearbyPeerCard 
            peer={item} 
            onPress={() => {
              if (navigation && navigation.navigate) {
                navigation.navigate('Chat', { recipientId: item.id, recipientName: item.full_name });
              }
            }} 
          />
        )}
        ListEmptyComponent={
          isInitialLoading ? null : (
            <EmptyState
              icon="people-outline"
              title="No One Nearby"
              description="No active users found within your selected radius. Try increasing the distance."
            />
          )
        }
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[theme.colors.primary.main]} />}
        contentContainerStyle={[styles.list, peers.length === 0 && !isInitialLoading && styles.centerList]}
      />

      {isInitialLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  centerList: { flex: 1, justifyContent: 'center' },
  loader: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
});
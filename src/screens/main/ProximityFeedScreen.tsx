import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { EmptyState } from '../../components/common/EmptyState';
import { theme } from '../../constants/theme';

export default function ProximityFeedScreen() {
  const { peers, isLoading, isRefreshing, radius, setRadius, lastUpdated, refreshPeers, errorMsg } = useNearbyPeers();
  const [selectedPeer, setSelectedPeer] = useState<any>(null);

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProximityHeader 
        lastUpdated={lastUpdated}
      />
      
      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      <FlatList
        data={peers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NearbyPeerCard
            peer={item}
            onPress={() => setSelectedPeer(item)}
            onWave={() => {}}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshPeers} tintColor={theme.colors.primary.main} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="radio-outline"
            title="No Proximity Feed"
            description="Expand your radius filter to find peers around you."
            actionLabel="Refresh Feed"
            onAction={refreshPeers}
          />
        }
      />
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
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorBanner: {
    backgroundColor: theme.colors.error + '22',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
});
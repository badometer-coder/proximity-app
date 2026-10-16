import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/auth/useAuth';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { EmptyState } from '../../components/common/EmptyState';

export const HomeScreen = () => {
  const { user, signOut } = useAuth();
  const [radius, setRadius] = useState<number>(5);
  const { peers, loading, refetch } = useNearbyPeers(radius);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProximityHeader radius={radius} onRadiusChange={setRadius} />
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={handleRefresh} tintColor={theme.colors.primary.main} />}
      >
        <Text style={styles.sectionTitle}>Nearby People ({peers.length})</Text>

        {peers.length === 0 && !loading ? (
          <EmptyState 
            title="No one nearby" 
            message="Try increasing your radius filter to find more peers around you." 
          />
        ) : (
          peers.map(peer => (
            <NearbyPeerCard key={peer.id} peer={peer} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  signOutButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  signOutText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
});
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { supabase } from '../../config/supabase';
import { ProfileRow } from '../../types/database';
import { openChat } from '../../../App';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { RadiusWheel } from '../../components/proximity/RadiusWheel';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';

export const HomeScreen: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [radius, setRadius] = useState<number>(5);
  const [useWheel, setUseWheel] = useState<boolean>(false);

  const { location, error: errorMsg, requestPermission: refreshLocation } = useCurrentLocation();
  const { peers, loading: peersLoading, refetch: refetchPeers } = useNearbyPeers({
    radiusKm: radius,
    userLocation: location ? { latitude: location.coords.latitude, longitude: location.coords.longitude } : null,
  });

  const colors = isDarkMode ? {
    bg: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors.text.primary,
    secondaryText: theme.colors.text.secondary,
    border: theme.colors.border,
  } : {
    bg: '#F3F4F6',
    surface: '#FFFFFF',
    text: '#111827',
    secondaryText: '#4B5563',
    border: '#E5E7EB',
  };

  const fetchProfiles = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await (supabase as any).from('profiles').select('*');
      if (!error && data) {
        setProfiles(user ? data.filter((p: ProfileRow) => p.id !== user.id) : data);
      }
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
    refreshLocation();
  }, [fetchProfiles, refreshLocation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfiles(), refreshLocation(), refetchPeers()]);
    setRefreshing(false);
  };

  const renderPeerItem = ({ item }: { item: any }) => (
    <NearbyPeerCard
      peer={item}
      onPress={() => {
        if (openChat) openChat(item.id, item.full_name || 'Chat');
      }}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ProximityHeader
        title="Proximity"
        subtitle={location ? `Radius: ${radius} km` : 'Locating...'}
        onRefresh={onRefresh}
      />

      <View style={[styles.filterContainer, { borderBottomColor: colors.border }]}>
        <View style={styles.radiusSelectorToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, !useWheel && styles.toggleBtnActive]}
            onPress={() => setUseWheel(false)}
          >
            <Text style={[styles.toggleBtnText, !useWheel && styles.toggleBtnTextActive]}>Slider</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, useWheel && styles.toggleBtnActive]}
            onPress={() => setUseWheel(true)}
          >
            <Text style={[styles.toggleBtnText, useWheel && styles.toggleBtnTextActive]}>Wheel</Text>
          </TouchableOpacity>
        </View>

        {useWheel ? (
          <RadiusWheel selectedRadius={radius} onRadiusChange={setRadius} />
        ) : (
          <RadiusSlider radius={radius} onRadiusChange={setRadius} />
        )}
      </View>

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Nearby Peers</Text>
        <View style={styles.themeToggle}>
          <Text style={[styles.themeLabel, { color: colors.secondaryText }]}>
            {isDarkMode ? '🌙' : '☀️'}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#E5E7EB', true: theme.colors.primary.main }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {loading || peersLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={peers.length > 0 ? peers : profiles.map(p => ({ ...p, distance: null }))}
          keyExtractor={(item) => item.id}
          renderItem={renderPeerItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.main} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                {errorMsg || 'No users found nearby within this radius.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterContainer: { padding: 12, borderBottomWidth: 1 },
  radiusSelectorToggle: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8, gap: 8 },
  toggleBtn: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 16, backgroundColor: theme.colors.surfaceLight },
  toggleBtnActive: { backgroundColor: theme.colors.primary.main },
  toggleBtnText: { color: theme.colors.text.secondary, fontSize: 12, fontWeight: '600' },
  toggleBtnTextActive: { color: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  themeToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  themeLabel: { fontSize: 18 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  list: { padding: 16, gap: 12 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Switch, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { openChat } from '../../../App';
import { ProximityHeader } from '../../components/proximity/ProximityHeader';
import { RadiusSlider } from '../../components/proximity/RadiusSlider';
import { RadiusWheel } from '../../components/proximity/RadiusWheel';
import { NearbyPeerCard } from '../../components/proximity/NearbyPeerCard';
import { useNearbyPeers } from '../../hooks/proximity/useNearbyPeers';
import { useCurrentLocation } from '../../hooks/location/useCurrentLocation';
import { useAuth } from '../../hooks/auth/useAuth';
import type { FormattedNearbyPeer } from '../../types';

export const HomeScreen: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [useWheel, setUseWheel] = useState<boolean>(false);

  const { location, error: locationError, requestPermission } = useCurrentLocation();
  const { peers, selectedRadius, isLoading, isRefreshing, error: peersError, setRadius, refresh } = useNearbyPeers(location);
  const { signOut } = useAuth();

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

  const onRefresh = useCallback(async () => {
    await Promise.all([refresh(), requestPermission()]);
  }, [refresh, requestPermission]);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const renderPeerItem = ({ item }: { item: FormattedNearbyPeer }) => (
    <NearbyPeerCard
      peer={item}
      onPress={() => {
        if (openChat) openChat(item.id, item.full_name || 'Chat');
      }}
    />
  );

  const renderFooter = () => (
    <View style={[styles.footerContainer, { borderTopColor: colors.border }]}>
      <View style={styles.footerLinks}>
        <TouchableOpacity onPress={() => Linking.openURL('https://example.com/privacy')}>
          <Text style={[styles.footerLinkText, { color: colors.secondaryText }]}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={[styles.footerDot, { color: colors.secondaryText }]}>•</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://example.com/terms')}>
          <Text style={[styles.footerLinkText, { color: colors.secondaryText }]}>Terms of Service</Text>
        </TouchableOpacity>
        <Text style={[styles.footerDot, { color: colors.secondaryText }]}>•</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://example.com/support')}>
          <Text style={[styles.footerLinkText, { color: colors.secondaryText }]}>Support</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.copyrightText, { color: colors.secondaryText }]}>
        © {new Date().getFullYear()} Proximity App. All rights reserved.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Top header with title and sign out */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Text style={[styles.appTitle, { color: colors.text }]}>Proximity</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ProximityHeader
        lastUpdated={null}
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
          <RadiusWheel value={selectedRadius} onValueChange={setRadius} />
        ) : (
          <RadiusSlider value={selectedRadius} onValueChange={setRadius} />
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

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={peers}
          keyExtractor={(item) => item.id}
          renderItem={renderPeerItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.main} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                {locationError || peersError?.message || 'No users found nearby within this radius.'}
              </Text>
            </View>
          }
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  appTitle: { fontSize: 20, fontWeight: '700' },
  signOutBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  signOutText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
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
  footerContainer: { marginTop: 24, paddingVertical: 20, paddingHorizontal: 16, borderTopWidth: 1, alignItems: 'center', gap: 12 },
  footerLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  footerLinkText: { fontSize: 12, fontWeight: '500', textDecorationLine: 'underline' },
  footerDot: { fontSize: 12 },
  copyrightText: { fontSize: 12, textAlign: 'center' },
});
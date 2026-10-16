import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { supabase } from '../../config/supabase';
import { ProfileRow } from '../../types/database';
import { openChat } from '../../../App';

export const HomeScreen: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const renderItem = ({ item }: { item: ProfileRow }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardInfo}>
        <Text style={[styles.nameText, { color: colors.text }]}>{item.full_name || 'Anonymous'}</Text>
        <Text style={[styles.usernameText, { color: colors.secondaryText }]}>@{item.username}</Text>
      </View>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => { if (openChat) openChat(item.id, item.full_name || 'Chat'); }}
      >
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Proximity</Text>
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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfiles(); }} tintColor={theme.colors.primary.main} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No users found nearby.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  themeToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  themeLabel: { fontSize: 18 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  list: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
  cardInfo: { flex: 1 },
  nameText: { fontSize: 16, fontWeight: '600' },
  usernameText: { fontSize: 13, marginTop: 2 },
  chatButton: { backgroundColor: theme.colors.primary.main, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  chatButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});

import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Switch
} from 'react-native';
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
      if (user) {
        setCurrentUserId(user.id);
      }

      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching profiles:', error);
      } else if (data) {
        const filtered = user ? data.filter((p: ProfileRow) => p.id !== user.id) : data;
        setProfiles(filtered);
      }
    } catch (err) {
      console.error('Unexpected error fetching profiles:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfiles();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const renderItem = ({ item }: { item: ProfileRow }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardInfo}>
        <Text style={[styles.nameText, { color: colors.text }]}>
          {item.display_name || 'Anonymous'}
        </Text>
        {item.bio ? (
          <Text style={[styles.bioText, { color: colors.secondaryText }]} numberOfLines={2}>
            {item.bio}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity 
        style={styles.chatButton}
        onPress={() => {
          if (openChat) {
            openChat(item.id, item.display_name || 'Chat');
          }
        }}
      >
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Proximity</Text>
          <View style={styles.themeToggleContainer}>
            <Text style={[styles.themeLabel, { color: colors.secondaryText }]}>
              {isDarkMode ? 'Dark' : 'Light'}
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={(val) => setIsDarkMode(val)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary.main }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.main} />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No profiles found nearby.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  themeLabel: {
    fontSize: theme.typography.fontSize.xs,
  },
  signOutButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.sm,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  listContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  cardInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  nameText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
  bioText: {
    fontSize: theme.typography.fontSize.sm,
  },
  chatButton: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
  },
});
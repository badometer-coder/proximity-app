import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../config/supabase';
import { theme } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

export const ChatListScreen: React.FC = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    async function fetchProfiles() {
      const { data } = await supabase.from('profiles').select('*');
      if (data) setProfiles(data);
      setLoading(false);
    }
    fetchProfiles();
  }, []);

  if (loading) return <ActivityIndicator style={styles.center} color={theme.colors.primary.main} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item} 
            onPress={() => navigation.navigate('ChatThread', { peerId: item.id, peerName: item.full_name || item.username })}
          >
            <Text style={styles.name}>{item.full_name || item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 24, paddingTop: 64 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 24 },
  center: { flex: 1, justifyContent: 'center' },
  item: { padding: 16, backgroundColor: theme.colors.surface, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  name: { color: theme.colors.text.primary, fontSize: 16, fontWeight: '600' },
});
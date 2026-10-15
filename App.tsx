import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from './src/hooks/auth/useAuth';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { ProfileSetupScreen } from './src/screens/auth/ProfileSetupScreen';
import { ProximityFeedScreen } from './src/screens/main/ProximityFeedScreen';
import { ChatThreadScreen } from './src/screens/main/ChatThreadScreen';
import { supabase } from './src/config/supabase';
import { ProfileRow } from './src/types/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProfileSetupTyped = ProfileSetupScreen as React.ComponentType<any>;

export let openChat: ((id: string, name: string) => void) | null = null;

export default function App() {
  const { session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  
  const [screen, setScreen] = useState<'auth' | 'setup' | 'feed' | 'chat'>('auth');
  const [chatTarget, setChatTarget] = useState<{ id: string; name: string } | null>(null);

  // Grab your ID instantly when you log in
  useEffect(() => {
    if (session?.user?.id) setMyId(session.user.id);
    else setMyId(null);
  }, [session]);

  const fetchProfile = useCallback(async () => {
    if (session?.user) {
      setProfileLoading(true);
      const { data } = await (supabase as any).from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data);
      setProfileLoading(false);
    } else {
      setProfile(null);
      setProfileLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) setScreen('feed');
    else setScreen('auth');
  }, [session]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  openChat = (id: string, name: string) => {
    setChatTarget({ id, name });
    setScreen('chat');
  };

  const handleBackToFeed = () => setScreen('feed');

  if (authLoading || profileLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {/* Keep all screens alive, just hide the ones we aren't using! */}
        <View style={[styles.screen, screen !== 'auth' && styles.hidden]}>
          <LoginScreen />
        </View>

        <View style={[styles.screen, screen !== 'setup' && styles.hidden]}>
          <ProfileSetupTyped onComplete={fetchProfile} />
        </View>

        <View style={[styles.screen, screen !== 'feed' && styles.hidden]}>
          <ProximityFeedScreen />
        </View>

        <View style={[styles.screen, screen !== 'chat' && styles.hidden]}>
          {chatTarget && (
            <ChatThreadScreen 
              userId={chatTarget.id} 
              userName={chatTarget.name} 
              myId={myId} 
              onBack={handleBackToFeed} 
            />
          )}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor
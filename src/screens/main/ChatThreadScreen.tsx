import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatMessages } from '../../hooks/messaging/useChatMessages';
import { supabase } from '../../config/supabase';
import { theme } from '../../constants/theme';
import { formatTime } from '../../lib/utils';

interface Props {
  userId: string;
  userName: string;
  myId: string | null;
  onBack: () => void;
}

export const ChatThreadScreen = ({ userId, userName, myId, onBack }: Props) => {
  const { messages, isLoading } = useChatMessages(userId, myId);
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim() || !myId) {
      Alert.alert("Error", "Cannot send: No ID or empty text");
      return;
    }
    
    const tempText = text;
    setText('');
    
    try {
      const { error } = await (supabase as any).from('messages').insert({
        sender_id: myId,
        recipient_id: userId,
        body: tempText,
      });

      // This will tell us if the database rejected the message
      if (error) {
        Alert.alert("Database Error", error.message);
      } else {
        console.log("Message saved successfully!");
      }
    } catch (err) {
      Alert.alert("App Error", "Could not send message");
    }
  };

  const renderBubble = ({ item }: any) => {
    const isOwn = item.is_own_message === true; 
    return (
      <View style={[styles.bubbleContainer, isOwn ? styles.rightBubble : styles.leftBubble]}>
        <View style={[styles.bubble, isOwn ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.bubbleText, isOwn && styles.myText]}>{item.body}</Text>
          <Text style={styles.timeText}>{formatTime(item.sent_at)} Synced</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{userName}</Text>
        </View>

        {isLoading ? (
          <View style={styles.centered}><Text>Loading Chat...</Text></View>
        ) : (
          <FlatList 
            data={messages} 
            renderItem={renderBubble} 
            keyExtractor={(item) => item.id} 
            contentContainerStyle={styles.list} 
            keyboardShouldPersistTaps="handled" 
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Type a message..." />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  keyboardView: { flex: 1 },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, gap: 16 },
  backButton: { width: 60 },
  backText: { fontSize: 16, color: theme.colors.primary.main, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text.primary, flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 8 },
  bubbleContainer: { flexDirection: 'row', justifyContent: 'flex-start' },
  rightBubble: { justifyContent: 'flex-end' },
  leftBubble: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  myBubble: { backgroundColor: theme.colors.primary.main, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: theme.colors.text.primary },
  myText: { color: '#FFF' },
  timeText: { fontSize: 10, color: theme.colors.text.tertiary, marginTop: 4, textAlign: 'right' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderColor: theme.colors.border, gap: 10 },
  input: { flex: 1, backgroundColor: theme.colors.background, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  sendButton: { backgroundColor: theme.colors.primary.main, borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center' },
  sendText: { color: '#FFF', fontWeight: '600' },
});
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useChatMessages } from '../../hooks/messaging/useChatMessages';
import { theme } from '../../constants/theme';
import { ChatMessage } from '../../types';

interface ChatThreadScreenProps {
  userId: string;
  userName: string;
  myId: string | null;
  onBack: () => void;
}

export const ChatThreadScreen: React.FC<ChatThreadScreenProps> = ({ userId, userName, myId, onBack }) => {
  const [inputText, setInputText] = useState('');
  const { messages, isLoading, sendMessage } = useChatMessages(userId, userName);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      await sendMessage(textToSend);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_id === myId;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userName}</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          inverted={false}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.text.secondary}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backButton: { marginRight: 16 },
  backText: { color: theme.colors.primary.main, fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 12, marginBottom: 12 },
  myMessage: { backgroundColor: theme.colors.primary.main, alignSelf: 'flex-end' },
  theirMessage: { backgroundColor: theme.colors.surface, alignSelf: 'flex-start', borderWidth: 1, borderColor: theme.colors.border },
  messageText: { color: '#FFF', fontSize: 15 },
  timestamp: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface },
  input: { flex: 1, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: '#FFF', marginRight: 8 },
  sendButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary.main, paddingHorizontal: 16, borderRadius: 8 },
  sendButtonText: { color: '#FFF', fontWeight: '600' },
});
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
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

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');
    try {
      await sendMessage(textToSend);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.sender_id === myId;
    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timestamp}>{new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userName}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        inverted={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.text.secondary}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
  backButton: { marginRight: 16 },
  backButtonText: { color: theme.colors.primary.main, fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text.primary },
  messageList: { padding: 16 },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 12, marginBottom: 8 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: theme.colors.primary.main },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: theme.colors.surfaceLight },
  messageText: { color: theme.colors.text.primary, fontSize: 15 },
  timestamp: { fontSize: 10, color: theme.colors.text.secondary, marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface },
  input: { flex: 1, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: theme.colors.text.primary, fontSize: 15, marginRight: 8 },
  sendButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary.main, paddingHorizontal: 20, borderRadius: 20 },
  sendButtonText: { color: '#FFF', fontWeight: '600', fontSize: 15 }
});
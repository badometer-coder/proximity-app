import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useChatMessages } from '../../hooks/messaging/useChatMessages';
import { ChatMessage } from '../../types';
import { theme } from '../../constants/theme';

interface ChatThreadScreenProps {
  userId: string;
  userName: string;
  myId: string | null;
  onBack: () => void;
}

export const ChatThreadScreen: React.FC<ChatThreadScreenProps> = ({ userId, userName, myId, onBack }) => {
  const [inputText, setInputText] = useState('');
  const { messages, isLoading, sendMessage } = useChatMessages(userId, userName);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    setIsSending(true);
    await sendMessage(inputText.trim());
    setInputText('');
    setIsSending(false);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_id === myId;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.message}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
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
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          inverted
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
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isSending}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingTop: 48 },
  backButton: { marginRight: 16 },
  backButtonText: { color: theme.colors.primary.main, fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messageList: { padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 12, marginBottom: 8 },
  myMessage: { backgroundColor: theme.colors.primary.main, alignSelf: 'flex-end' },
  theirMessage: { backgroundColor: theme.colors.surface, alignSelf: 'flex-start' },
  messageText: { fontSize: 15 },
  myMessageText: { color: '#FFF' },
  theirMessageText: { color: theme.colors.text.primary },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: theme.colors.border, alignItems: 'center' },
  input: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#FFF', marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  sendButton: { backgroundColor: theme.colors.primary.main, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  sendButtonText: { color: '#FFF', fontWeight: '600' },
});
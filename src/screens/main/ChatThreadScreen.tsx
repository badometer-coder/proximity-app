import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { ChatMessage } from '../../types';
import { useChatMessages } from '../../hooks/messaging/useChatMessages';
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

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendMessage(inputText);
    setInputText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{userName}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item: ChatMessage) => item.id}
        renderItem={({ item }: { item: ChatMessage }) => {
          const isMe = item.sender_id === myId;
          return (
            <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
          );
        }}
        contentContainerStyle={styles.messageList}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backButton: { fontSize: 16, color: theme.colors.primary.main, marginRight: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text.primary },
  messageList: { padding: 16 },
  messageBubble: { padding: 12, borderRadius: 8, marginBottom: 8, maxWidth: '80%' },
  myBubble: { backgroundColor: theme.colors.primary.main, alignSelf: 'flex-end' },
  theirBubble: { backgroundColor: theme.colors.surface, alignSelf: 'flex-start' },
  messageText: { color: theme.colors.text.primary, fontSize: 15 },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface },
  input: { flex: 1, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, color: theme.colors.text.primary, marginRight: 8 },
  sendButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary.main, paddingHorizontal: 16, borderRadius: 8 },
  sendButtonText: { color: '#FFF', fontWeight: '600' }
});
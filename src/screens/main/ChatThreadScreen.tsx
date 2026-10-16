import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useChatMessages } from '../../hooks/messaging/useChatMessages';
import { ChatMessage } from '../../types';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

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
    if (!inputText.trim() || !sendMessage) return;
    await sendMessage(inputText);
    setInputText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userName}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item: ChatMessage) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }: { item: ChatMessage }) => {
          const isMe = item.sender_id === myId;
          return (
            <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
          );
        }}
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
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text.primary },
  messageList: { padding: 16 },
  messageBubble: { padding: 12, borderRadius: 8, marginBottom: 8, maxWidth: '80%' },
  myMessage: { backgroundColor: theme.colors.primary.main, alignSelf: 'flex-end' },
  theirMessage: { backgroundColor: theme.colors.surface, alignSelf: 'flex-start' },
  messageText: { color: '#FFF', fontSize: 15 },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: theme.colors.border, alignItems: 'center' },
  input: { flex: 1, backgroundColor: theme.colors.surface, color: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
  sendButton: { backgroundColor: theme.colors.primary.main, padding: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});
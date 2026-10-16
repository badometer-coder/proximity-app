import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
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
  const [text, setText] = useState('');
  const { messages, isLoading, sendMessage } = useChatMessages(userId, userName);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(text);
    setText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userName}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item: ChatMessage) => item.id}
        renderItem={({ item }) => {
          const isMe = item.sender_id === myId;
          return (
            <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
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
          value={text}
          onChangeText={setText}
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
  backText: { color: theme.colors.primary.main, fontSize: 16, marginRight: 16 },
  headerTitle: { color: theme.colors.text.primary, fontSize: 18, fontWeight: 'bold' },
  messageList: { padding: 16 },
  messageBubble: { padding: 12, borderRadius: 8, marginBottom: 8, maxWidth: '80%' },
  myMessage: { backgroundColor: theme.colors.primary.main, alignSelf: 'flex-end' },
  theirMessage: { backgroundColor: theme.colors.surface, alignSelf: 'flex-start' },
  messageText: { color: '#FFF', fontSize: 15 },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  input: { flex: 1, backgroundColor: theme.colors.surface, color: '#FFF', borderRadius: 8, paddingHorizontal: 12, height: 44 },
  sendButton: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, backgroundColor: theme.colors.primary.main, borderRadius: 8, marginLeft: 8 },
  sendButtonText: { color: '#FFF', fontWeight: 'bold' },
});
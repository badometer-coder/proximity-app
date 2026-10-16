import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../../constants/theme';
import { useChatMessages } from '../../hooks/messaging/useChatMessages';
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
    await sendMessage(textToSend);
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userName}</Text>
        <View style={{ width: 50 }} />
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
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: theme.colors.primary.main,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 6,
  },
  myMessage: {
    backgroundColor: theme.colors.primary.main,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  theirMessage: {
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: 15,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: theme.colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
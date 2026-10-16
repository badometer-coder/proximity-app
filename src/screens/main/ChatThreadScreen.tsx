import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useChatMessages } from '../../hooks/messaging/useChatMessages';
import { ChatMessage } from '../../types';
import { formatTime } from '../../lib/utils';
import { Avatar } from '../../components/common/Avatar';

interface ChatThreadScreenProps {
  userId: string;
  userName: string;
  myId: string | null;
  onBack: () => void;
  avatarUrl?: string | null;
}

export const ChatThreadScreen: React.FC<ChatThreadScreenProps> = ({
  userId,
  userName,
  myId,
  onBack,
  avatarUrl,
}) => {
  const [inputText, setInputText] = useState('');
  const { messages, isLoading, sendMessage } = useChatMessages(userId, userName);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');
    await sendMessage(textToSend);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_id === myId;
    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        {!isMe && (
          <View style={styles.avatarContainer}>
            <Avatar uri={avatarUrl ?? null} name={userName} size={28} />
          </View>
        )}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.message}
          </Text>
          <Text style={[styles.timestampText, isMe ? styles.myTimestampText : styles.otherTimestampText]}>
            {formatTime(item.sent_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Avatar uri={avatarUrl ?? null} name={userName} size={36} />
          <Text style={styles.headerTitle}>{userName}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          inverted={false}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
              </View>
            ) : null
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flexContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 10,
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: theme.colors.primary.main,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: 15,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: theme.colors.text.primary,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimestampText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestampText: {
    color: theme.colors.text.tertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: theme.colors.text.primary,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
});
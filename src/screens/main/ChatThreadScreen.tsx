import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatMessages } from '../../hooks/messaging/useChatMessages';
import { ChatMessage } from '../../types';
import { formatTime } from '../../lib/utils';
import { theme } from '../../constants/theme';
import { Avatar } from '../../components/common/Avatar';

interface ChatThreadScreenProps {
  userId: string;
  userName: string;
  userAvatar?: string | null;
  myId: string | null;
  onBack: () => void;
}

export const ChatThreadScreen: React.FC<ChatThreadScreenProps> = ({
  userId,
  userName,
  userAvatar = null,
  myId,
  onBack,
}) => {
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

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_id === myId;
    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
        {!isMe && (
          <Avatar uri={userAvatar} name={userName} size={32} />
        )}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
            {item.message}
          </Text>
          <Text style={[styles.timestampText, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
            {formatTime(item.sent_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Avatar uri={userAvatar} name={userName} size={36} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{userName}</Text>
          <Text style={styles.headerSubtitle}>Nearby Chat</Text>
        </View>
      </View>

      {isLoading && messages.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messageList}
          inverted={false}
        />
      )}

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
          <Ionicons name="send" size={18} color="#FFFFFF" />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  myBubble: {
    backgroundColor: theme.colors.primary.main,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: theme.colors.surfaceLight,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: theme.colors.text.primary,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTimestamp: {
    color: theme.colors.text.secondary,
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
    fontSize: 15,
    color: theme.colors.text.primary,
    maxHeight: 100,
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
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatMessages } from '../../hooks/messaging/useChatMessages';
import { ChatMessage } from '../../types';
import { theme } from '../../constants/theme';
import { formatTime } from '../../lib/utils';
import { Avatar } from '../../components/common/Avatar';

interface ChatThreadScreenProps {
  userId: string;
  userName: string;
  myId: string | null;
  onBack: () => void;
  userAvatar?: string | null;
}

export const ChatThreadScreen: React.FC<ChatThreadScreenProps> = ({
  userId,
  userName,
  myId,
  onBack,
  userAvatar,
}) => {
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
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_id === myId;
    return (
      <View style={[styles.messageBubbleContainer, isMe ? styles.myMessageContainer : styles.theirMessageContainer]}>
        {!isMe && (
          <View style={styles.avatarContainer}>
            <Avatar uri={userAvatar ?? null} name={userName} size={28} />
          </View>
        )}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
            {item.message}
          </Text>
          <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
            {formatTime(item.sent_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Avatar uri={userAvatar ?? null} name={userName} size={36} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{userName}</Text>
          <Text style={styles.headerSubtitle}>Active recently</Text>
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
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
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
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
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
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.success,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  myBubble: {
    backgroundColor: theme.colors.primary.main,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
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
  theirMessageText: {
    color: theme.colors.text.primary,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTimeText: {
    color: theme.colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
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
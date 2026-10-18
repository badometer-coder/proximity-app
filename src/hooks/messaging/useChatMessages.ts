import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

export interface ChatMessage {
  id: string;
  body: string;
  sender_id: string;
  sent_at: string;
  is_own_message: boolean;
}

export const useChatMessages = (otherUserId: string, myId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    if (!myId) {
      console.log('DEBUG: Cannot fetch, myId is missing!');
      return;
    }
    
    console.log('DEBUG: Fetching messages for...', myId, 'and', otherUserId);
    
    setIsLoading(true);
    const { data, error } = await (supabase as any).rpc('get_chat_history', {
      user_a: myId,
      user_b: otherUserId,
      limit_count: 50
    });

    console.log('DEBUG: Database returned:', error, data);

    if (!error && data) {
      setMessages((data as ChatMessage[]).reverse());
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (myId) fetchMessages();
  }, [myId, otherUserId]);

  useEffect(() => {
    if (!myId) return;

    const channel = supabase
      .channel(`chat-${otherUserId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
        const newMsg = payload.new;
        if (newMsg.sender_id === myId || newMsg.recipient_id === myId) {
          setMessages((prev: ChatMessage[]) => [...prev, { 
            ...newMsg, 
            is_own_message: newMsg.sender_id === myId 
          }]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [myId, otherUserId]);

  const sendMessage = async (text: string) => {
    if (!myId) return;
    const { error } = await (supabase as any).from('messages').insert({
      sender_id: myId,
      recipient_id: otherUserId,
      body: text,
      is_synced: false
    });
    if (error) console.error('Error sending message:', error);
  };

  return { messages, isLoading, sendMessage };
};
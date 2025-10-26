import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  folder_id?: string | null;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Load conversations
  const loadConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setConversations(data);
    }
  };

  // Reload conversations when they change
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
    }
    setLoading(false);
  };

  // Create new conversation
  const createConversation = async (title: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: user.id,
          title,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      await loadConversations();
      setCurrentConversation(data);
      setMessages([]);
      return data;
    }
    return null;
  };

  // Save message
  const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          role,
          content,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data as Message]);
      return data as Message;
    }
    return null;
  };

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    await loadConversations();
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }
  };

  // Move conversation to folder
  const moveConversationToFolder = async (conversationId: string, folderId: string | null) => {
    const { error } = await supabase
      .from('conversations')
      .update({ folder_id: folderId })
      .eq('id', conversationId);

    if (!error) {
      await loadConversations();
    }
  };

  // Select conversation
  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    await loadMessages(conversation.id);
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    createConversation,
    saveMessage,
    deleteConversation,
    selectConversation,
    setMessages,
    loadConversations,
    moveConversationToFolder,
  };
};
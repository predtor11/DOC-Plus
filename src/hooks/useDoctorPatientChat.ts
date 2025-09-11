import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChatAPI } from '@/integrations/supabase/chat-api';

// Types and Interfaces
interface DoctorPatientMessage {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface DoctorPatientChatSession {
  id: string;
  doctor_id: string;
  patient_id: string;
  title: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

interface HookReturn {
  sessions: DoctorPatientChatSession[];
  messages: DoctorPatientMessage[];
  loading: boolean;
  fetchSessions: () => Promise<void>;
  fetchMessages: () => Promise<void>;
  createSession: (doctorId: string, patientId: string, title?: string) => Promise<DoctorPatientChatSession | null>;
  sendMessage: (content: string) => Promise<DoctorPatientMessage | null>;
  markMessagesAsRead: () => Promise<void>;
}

export const useDoctorPatientChat = (sessionId: string | null): HookReturn => {
  // State and Context
  const { user } = useAuth();
  const [sessions, setSessions] = useState<DoctorPatientChatSession[]>([]);
  const [messages, setMessages] = useState<DoctorPatientMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Constants
  const DOCTOR_PATIENT_SESSIONS_TABLE = 'doctor_patient_chat_sessions';
  const DOCTOR_PATIENT_MESSAGES_TABLE = 'doctor_patient_messages';

  // Early return if hook dependencies are not ready
  if (!user) {
    console.log('useDoctorPatientChat: User not available, returning default values');
    return {
      sessions: [],
      messages: [],
      loading: false,
      fetchSessions: () => Promise.resolve(),
      fetchMessages: () => Promise.resolve(),
      createSession: () => Promise.resolve(null),
      sendMessage: () => Promise.resolve(null),
      markMessagesAsRead: () => Promise.resolve(),
    };
  }

  // Data fetching functions
  const fetchSessions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('Fetching doctor-patient sessions for user:', user.id);

      const { data, error } = await (supabase as any)
        .from(DOCTOR_PATIENT_SESSIONS_TABLE)
        .select('*')
        .or(`doctor_id.eq.${user.id},patient_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]);
        return;
      }

      console.log('Sessions fetched successfully:', data?.length || 0, 'sessions');
      
      // Transform data to match our interface
      const transformedSessions = (data || []).map((session: any) => ({
        id: session.id,
        doctor_id: session.doctor_id,
        patient_id: session.patient_id,
        title: session.title,
        last_message_at: session.last_message_at,
        created_at: session.created_at,
        updated_at: session.updated_at
      }));

      setSessions(transformedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchMessages = useCallback(async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching doctor-patient messages for session:', sessionId);

      const { data, error } = await (supabase as any)
        .from(DOCTOR_PATIENT_MESSAGES_TABLE)
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
        return;
      }

      console.log('Messages fetched successfully:', data?.length || 0, 'messages');

      const transformedMessages = (data || []).map((msg: any) => ({
        id: msg.id,
        session_id: msg.session_id,
        sender_id: msg.sender_id,
        content: msg.content,
        is_read: msg.is_read || false,
        created_at: msg.created_at
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const createSession = useCallback(async (doctorId: string, patientId: string, title?: string) => {
    if (!user?.id) return null;

    try {
      setLoading(true);
      console.log('Creating doctor-patient session:', { doctorId, patientId, title });

      const { data, error } = await ChatAPI.createDoctorPatientSession(doctorId, patientId, title);

      if (error) {
        console.error('Error creating doctor-patient session:', error);
        throw error;
      }

      const transformedSession: DoctorPatientChatSession = {
        id: data.id,
        doctor_id: data.participant_1_id || doctorId,
        patient_id: data.participant_2_id || patientId,
        title: data.title || '',
        last_message_at: data.last_message_at,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      console.log('Session created successfully:', transformedSession.id);
      await fetchSessions();
      return transformedSession;
    } catch (error) {
      console.error('Error creating doctor-patient session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchSessions]);

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId || !user?.id) {
      console.error('Missing sessionId or user for sending message');
      return null;
    }

    try {
      setLoading(true);
      console.log('Sending message:', { sessionId, senderId: user.id });

      const { data, error } = await ChatAPI.sendMessage(sessionId, content, user.id);

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      const transformedMessage: DoctorPatientMessage = {
        id: data.id,
        session_id: data.session_id,
        sender_id: data.sender_id,
        content: data.content,
        is_read: data.is_read || false,
        created_at: data.created_at
      };

      console.log('Message sent successfully:', transformedMessage.id);
      setMessages(prev => [...prev, transformedMessage]);
      return transformedMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sessionId, user?.id]);

  const markMessagesAsRead = useCallback(async () => {
    if (!sessionId || !user?.id) return;

    try {
      console.log('Marking messages as read:', { sessionId });

      const { error } = await (supabase as any)
        .from(DOCTOR_PATIENT_MESSAGES_TABLE)
        .update({ is_read: true })
        .eq('session_id', sessionId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
        throw error;
      }

      console.log('Messages marked as read successfully');
      setMessages(prev =>
        prev.map(msg =>
          msg.sender_id !== user.id && !msg.is_read
            ? { ...msg, is_read: true }
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }, [sessionId, user?.id]);

  // Effect Hooks
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (sessionId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [sessionId, fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!sessionId || !user?.id) {
      console.log('Missing sessionId or user, skipping realtime subscription');
      return;
    }

    const channelName = `chat-${sessionId}-${user.id}`;
    console.log('Setting up realtime subscription:', channelName);

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: user.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: DOCTOR_PATIENT_MESSAGES_TABLE,
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('🎉 Realtime message received:', payload);

          if (!payload.new || !payload.new.id) {
            console.warn('Invalid payload received:', payload);
            return;
          }

          const newMessage: DoctorPatientMessage = {
            id: payload.new.id,
            session_id: payload.new.session_id,
            sender_id: payload.new.sender_id,
            content: payload.new.content,
            is_read: payload.new.is_read || false,
            created_at: payload.new.created_at
          };

          setMessages(prev => {
            // Check for duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              console.log('Message already exists, skipping:', newMessage.id);
              return prev;
            }

            // Don't add messages from current user (they're already in state)
            if (newMessage.sender_id === user.id) {
              console.log('Message is from current user, skipping:', newMessage.id);
              return prev;
            }

            console.log('✅ Adding new message to state:', newMessage.id);
            return [...prev, newMessage];
          });
        }
      )
      .subscribe((status, err) => {
        console.log(`Realtime subscription status for ${channelName}:`, status);

        if (err) {
          console.error('Realtime subscription error details:', err);
          console.error('Error message:', err.message);
          console.error('Error name:', err.name);
          return;
        }

        switch (status) {
          case 'SUBSCRIBED':
            console.log('✅ Successfully subscribed to realtime updates for session:', sessionId);
            break;
          case 'CHANNEL_ERROR':
            console.error('❌ Realtime subscription failed for session:', sessionId);
            console.error('This usually means:');
            console.error('1. The messages table is not enabled for realtime in Supabase dashboard');
            console.error('2. Go to Database > Replication and enable the messages table');
            console.error('3. Make sure INSERT events are enabled');
            console.error('4. Check that the supabase_realtime publication includes the messages table');
            break;
          case 'TIMED_OUT':
            console.warn('⚠️ Realtime subscription timed out for session:', sessionId);
            console.warn('This might indicate network issues or Supabase realtime service problems');
            break;
          case 'CLOSED':
            console.log('ℹ️ Realtime subscription closed for session:', sessionId);
            break;
          default:
            console.log('Unknown subscription status:', status);
        }
      });

    // Cleanup function to unsubscribe when component unmounts or sessionId changes
    return () => {
      console.log('🧹 Cleaning up realtime subscription for session:', sessionId);
      supabase.removeChannel(channel);
    };
  }, [sessionId, user?.id]);

  return {
    sessions,
    messages,
    loading,
    fetchSessions,
    fetchMessages,
    createSession,
    sendMessage,
    markMessagesAsRead
  } as const;
};

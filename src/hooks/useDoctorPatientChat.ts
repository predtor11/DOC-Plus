import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChatAPI } from '@/integrations/supabase/chat-api';

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

export const useDoctorPatientChat = (sessionId: string | null) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<DoctorPatientChatSession[]>([]);
  const [messages, setMessages] = useState<DoctorPatientMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all doctor-patient sessions for the current user
  const fetchSessions = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('Fetching doctor-patient sessions for user:', user.id);
      console.log('Using Clerk user ID for session lookup:', user.id);

      // For now, just use the regular chat_sessions table (skip doctor_patient_chat_sessions)
      console.log('Using doctor_patient_chat_sessions table for doctor-patient sessions');
      const { data, error } = await supabase
        .from('doctor_patient_chat_sessions')
        .select('*')
        .or(`doctor_id.eq.${user.id},patient_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]);
      } else {
        console.log('Sessions fetched successfully:', data?.length || 0, 'sessions');

        // Transform data to match our interface if needed
        const transformedSessions = (data || []).map(session => ({
          id: session.id,
          doctor_id: session.doctor_id, // Use doctor_id directly
          patient_id: session.patient_id, // Use patient_id directly
          title: session.title,
          last_message_at: session.last_message_at,
          created_at: session.created_at,
          updated_at: session.updated_at
        }));

        setSessions(transformedSessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific session
  const fetchMessages = async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching doctor-patient messages for session:', sessionId);

      // For now, just use the regular messages table (skip doctor_patient_messages)
      console.log('Using doctor_patient_messages table for doctor-patient messages');
      const { data, error } = await supabase
        .from('doctor_patient_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } else {
        console.log('Messages fetched successfully:', data?.length || 0, 'messages');

        // Transform data to match our interface if needed
        const transformedMessages = (data || []).map(msg => ({
          id: msg.id,
          session_id: msg.session_id,
          sender_id: msg.sender_id,
          content: msg.content,
          is_read: msg.is_read || false,
          created_at: msg.created_at
        }));

        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new doctor-patient chat session
  const createSession = async (doctorId: string, patientId: string, title?: string) => {
    if (!user?.id) return null;

    try {
      setLoading(true);
      console.log('Creating doctor-patient session via ChatAPI:', { doctorId, patientId, title });

      // Use ChatAPI which handles everything properly
      const { data, error } = await ChatAPI.createDoctorPatientSession(doctorId, patientId, title);

      if (error) {
        console.error('Error creating doctor-patient session via ChatAPI:', error);
        throw error;
      }

      console.log('Doctor-patient session created successfully via ChatAPI:', data);

      // Transform the data to match our interface if needed
      const transformedSession = {
        id: data.id,
        doctor_id: data.doctor_id || doctorId,
        patient_id: data.patient_id || patientId,
        title: data.title,
        last_message_at: data.last_message_at,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      await fetchSessions(); // Refresh sessions list
      return transformedSession;
    } catch (error) {
      console.error('Error creating doctor-patient session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send a message in a doctor-patient chat
  const sendMessage = async (content: string) => {
    if (!sessionId || !user?.id) {
      console.error('Missing sessionId or user for sending message');
      return null;
    }

    try {
      setLoading(true);
      const senderId = user.id; // Use Clerk user ID for sender_id
      console.log('Sending doctor-patient message via ChatAPI:', {
        sessionId,
        content,
        senderId,
        userAuthState: {
          id: user.id,
          user_id: user.user_id
        }
      });

      // Use ChatAPI which has proper fallback logic
      const { data, error } = await ChatAPI.sendMessage(sessionId, content, senderId);

      if (error) {
        console.error('Error sending doctor-patient message via ChatAPI:', error);
        throw error;
      }

      console.log('Doctor-patient message sent successfully via ChatAPI:', data);

      // Transform the data to match our interface if needed
      const transformedMessage = {
        id: data.id,
        session_id: data.session_id,
        sender_id: data.sender_id,
        content: data.content,
        is_read: data.is_read || false,
        created_at: data.created_at
      };

      setMessages(prev => [...prev, transformedMessage]); // Add to local state
      return transformedMessage;
    } catch (error) {
      console.error('Error sending doctor-patient message:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!sessionId || !user?.id) return;

    try {
      console.log('Marking doctor-patient messages as read:', { sessionId, userId: user.id });

      // For now, just use the regular messages table (skip doctor_patient_messages)
      console.log('Using doctor_patient_messages table for marking doctor-patient messages as read');
      const { error } = await supabase
        .from('doctor_patient_messages')
        .update({ is_read: true })
        .eq('session_id', sessionId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
        throw error;
      } else {
        console.log('Messages marked as read successfully');
        // Update local state
        setMessages(prev =>
          prev.map(msg =>
            msg.sender_id !== user.id && !msg.is_read
              ? { ...msg, is_read: true }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user?.id]);

  useEffect(() => {
    if (sessionId) {
      fetchMessages();

      // Set up real-time subscription for new messages
      console.log('Setting up real-time subscription for session:', sessionId);
      console.log('Current user auth state:', {
        userId: user?.id,
        user_id: user?.user_id
      });

      const channel = supabase
        .channel(`messages-${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'doctor_patient_messages',
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            console.log('🎉 New message received via real-time for session', sessionId, ':', payload);
            console.log('Message data:', {
              id: payload.new.id,
              session_id: payload.new.session_id,
              sender_id: payload.new.sender_id,
              content: payload.new.content,
              is_read: payload.new.is_read,
              created_at: payload.new.created_at
            });

            const newMessage = {
              id: payload.new.id,
              session_id: payload.new.session_id,
              sender_id: payload.new.sender_id,
              content: payload.new.content,
              is_read: payload.new.is_read || false,
              created_at: payload.new.created_at
            };

            // Add the new message to the local state
            setMessages(prev => {
              // Check if message already exists to avoid duplicates
              const messageExists = prev.some(msg => msg.id === newMessage.id);
              if (messageExists) {
                console.log('Message already exists, skipping duplicate');
                return prev;
              }
              console.log('Adding new message to state:', newMessage);
              return [...prev, newMessage];
            });
          }
        )
        .subscribe((status, err) => {
          console.log('Real-time subscription status for session', sessionId, ':', status);
          if (err) {
            console.error('Real-time subscription error:', err);
            console.error('Error details:', {
              message: err.message,
              name: err.name,
              stack: err.stack
            });
          }
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to real-time updates for session', sessionId);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Real-time subscription failed for session', sessionId);
            console.error('Channel error details:', err);
            // Try to reconnect after a delay
            setTimeout(() => {
              console.log('🔄 Attempting to reconnect real-time subscription...');
              supabase.removeChannel(channel);
              // The useEffect will recreate the subscription
            }, 5000);
          } else if (status === 'TIMED_OUT') {
            console.error('❌ Real-time subscription timed out for session', sessionId);
          } else if (status === 'CLOSED') {
            console.log('ℹ️ Real-time subscription closed for session', sessionId);
          }
        });

      // Cleanup subscription on unmount or session change
      return () => {
        console.log('Cleaning up real-time subscription for session:', sessionId);
        supabase.removeChannel(channel);
      };
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  return {
    sessions,
    messages,
    loading,
    fetchSessions,
    fetchMessages,
    createSession,
    sendMessage,
    markMessagesAsRead,
  };
};

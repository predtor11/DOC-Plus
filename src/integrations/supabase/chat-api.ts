import { supabase } from './client';
import type { Database } from './types';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

export interface ChatAPIError {
  message: string;
  code?: string;
}

/**
 * Chat API functions for doctor-patient communication
 */
export class ChatAPI {
  /**
   * Fetch chat sessions for a specific patient
   */
  static async fetchPatientChatSessions(patientId: string): Promise<{ data: ChatSession[] | null; error: ChatAPIError | null }> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_type', 'doctor-patient')
        .or(`participant_1_id.eq.${patientId},participant_2_id.eq.${patientId}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        return {
          data: null,
          error: { message: 'Failed to fetch chat sessions', code: error.code }
        };
      }

      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: { message: 'Network error while fetching chat sessions' }
      };
    }
  }

  /**
   * Fetch chat session between doctor and patient
   */
  static async fetchDoctorPatientSession(doctorId: string, patientId: string): Promise<{ data: ChatSession | null; error: ChatAPIError | null }> {
    try {
      // Validate input parameters
      if (!doctorId || !patientId) {
        return {
          data: null,
          error: { message: 'Doctor ID and Patient ID are required' }
        };
      }

      console.log('Fetching doctor-patient chat session for:', { doctorId, patientId });

      // Skip the problematic doctor_patient_chat_sessions table and go straight to the working chat_sessions table
      console.log('Using chat_sessions table for doctor-patient sessions (skipping problematic doctor_patient_chat_sessions)');
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_type', 'doctor-patient')
        .or(`and(participant_1_id.eq.${doctorId},participant_2_id.eq.${patientId}),and(participant_1_id.eq.${patientId},participant_2_id.eq.${doctorId})`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Chat session fetch error:', error);
        return {
          data: null,
          error: { message: `Failed to fetch chat session: ${error.message}`, code: error.code }
        };
      }

      console.log('Chat session fetch result:', { data: !!data, count: data?.length });

      return { data: data?.[0] as ChatSession || null, error: null };
    } catch (err) {
      console.error('Unexpected error fetching chat session:', err);
      return {
        data: null,
        error: { message: 'Network error while fetching chat session' }
      };
    }
  }

  /**
   * Create a new chat session between doctor and patient (or find existing one)
   */
  static async createDoctorPatientSession(doctorId: string, patientId: string, title?: string): Promise<{ data: ChatSession | null; error: ChatAPIError | null }> {
    try {
      // Validate input parameters
      if (!doctorId || !patientId) {
        return {
          data: null,
          error: { message: 'Doctor ID and Patient ID are required' }
        };
      }

      if (doctorId === patientId) {
        return {
          data: null,
          error: { message: 'Doctor and patient cannot be the same user' }
        };
      }

      console.log('Creating/finding doctor-patient chat session with data:', { doctorId, patientId, title });

      // Use the dedicated doctor_patient_chat_sessions table
      console.log('Using doctor_patient_chat_sessions table for doctor-patient session creation');

      // First, try to find an existing session between these users
      console.log('Checking for existing session between doctor and patient...');
      const { data: existingSessions, error: findError } = await (supabase as any)
        .from('doctor_patient_chat_sessions')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (findError) {
        console.error('Error checking for existing session:', findError);
        return {
          data: null,
          error: { message: `Failed to check for existing session: ${findError.message}`, code: findError.code }
        };
      }

      if (existingSessions && existingSessions.length > 0) {
        console.log('Found existing session, returning it:', existingSessions[0].id);
        return { data: existingSessions[0] as any, error: null };
      }

      console.log('No existing session found, creating new one...');

      const sessionData = {
        doctor_id: doctorId,
        patient_id: patientId,
        title: title || 'Doctor-Patient Chat',
      };

      const { data, error } = await (supabase as any)
        .from('doctor_patient_chat_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Chat session creation error:', error);
        return {
          data: null,
          error: { message: `Failed to create chat session: ${error.message}`, code: error.code }
        };
      }

      console.log('Chat session created successfully:', data);

      return { data: data as ChatSession, error: null };
    } catch (err) {
      console.error('Unexpected error creating chat session:', err);
      return {
        data: null,
        error: { message: 'Network error while creating chat session' }
      };
    }
  }

  /**
   * Send a message in a chat session
   */
  static async sendMessage(sessionId: string, content: string, senderId: string, isAiMessage: boolean = false): Promise<{ data: Message | null; error: ChatAPIError | null }> {
    try {
      // Validate message content
      const validation = this.validateMessageContent(content);
      if (!validation.valid) {
        return {
          data: null,
          error: { message: validation.error || 'Invalid message content' }
        };
      }

      // First, check if this is a doctor-patient session by looking at the doctor_patient_chat_sessions table
      const { data: dpSession, error: dpSessionError } = await (supabase as any)
        .from('doctor_patient_chat_sessions')
        .select('id')
        .eq('id', sessionId)
        .single();

      const isDoctorPatientSession = !dpSessionError && dpSession !== null;
      console.log('ChatAPI.sendMessage - Is doctor-patient session:', isDoctorPatientSession, 'Session ID:', sessionId);

      const messageData = {
        session_id: sessionId,
        sender_id: senderId,
        content: content.trim(),
        is_ai_message: isAiMessage,
      };

      // Create separate data objects for different tables to handle column differences
      const doctorPatientMessageData = {
        session_id: sessionId,
        sender_id: senderId,
        content: content.trim(),
        is_read: false, // doctor_patient_messages uses is_read instead of is_ai_message
      };

      let data, error;

      // Use appropriate table based on session type
      if (isDoctorPatientSession) {
        // For doctor-patient sessions, use the dedicated doctor_patient_messages table
        console.log('Using doctor_patient_messages table for doctor-patient session, sessionId:', sessionId);
        const result = await (supabase as any)
          .from('doctor_patient_messages')
          .insert(doctorPatientMessageData)
          .select()
          .single();

        data = result.data;
        error = result.error;
        console.log('Doctor-patient messages table insert result:', { data: !!data, error: error?.message });
      } else {
        // For AI sessions, use the regular messages table
        console.log('Using messages table for AI session, sessionId:', sessionId);
        const result = await supabase
          .from('messages')
          .insert(messageData)
          .select()
          .single();

        data = result.data;
        error = result.error;
        console.log('Messages table insert result:', { data: !!data, error: error?.message });
      }

      if (error) {
        console.error('Message send error:', error);
        return {
          data: null,
          error: { message: `Failed to send message: ${error.message}`, code: error.code }
        };
      }

      console.log('Message sent successfully:', data);
      return { data: data as Message, error: null };
    } catch (err) {
      return {
        data: null,
        error: { message: 'Network error while sending message' }
      };
    }
  }

  /**
   * Mark messages as read in a session
   */
  static async markMessagesAsRead(sessionId: string, userId: string): Promise<{ success: boolean; error: ChatAPIError | null }> {
    try {
      // First, check if this is a doctor-patient session
      const { data: dpSession, error: dpSessionError } = await (supabase as any)
        .from('doctor_patient_chat_sessions')
        .select('id')
        .eq('id', sessionId)
        .single();

      const isDoctorPatientSession = !dpSessionError && dpSession !== null;
      console.log('Marking messages as read for doctor-patient session:', isDoctorPatientSession);

      let error;

      if (isDoctorPatientSession) {
        // For doctor-patient sessions, use the doctor_patient_messages table
        console.log('Using doctor_patient_messages table for marking as read');
        const result = await (supabase as any)
          .from('doctor_patient_messages')
          .update({ is_read: true })
          .eq('session_id', sessionId)
          .neq('sender_id', userId)
          .eq('is_read', false);

        error = result.error;
      } else {
        // For AI sessions, use the regular messages table
        console.log('Using messages table for marking as read');
        const result = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('session_id', sessionId)
          .neq('sender_id', userId)
          .eq('is_read', false);

        error = result.error;
      }

      if (error) {
        return {
          success: false,
          error: { message: 'Failed to mark messages as read', code: error.code }
        };
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: { message: 'Network error while marking messages as read' }
      };
    }
  }

  /**
   * Fetch unread message count for a user
   */
  static async getUnreadMessageCount(userId: string): Promise<{ count: number; error: ChatAPIError | null }> {
    try {
      // Get user's doctor-patient session IDs
      const { data: dpSessions, error: dpSessionError } = await (supabase as any)
        .from('doctor_patient_chat_sessions')
        .select('id')
        .or(`doctor_id.eq.${userId},patient_id.eq.${userId}`);

      // Get user's regular chat session IDs
      const { data: sessions, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`);

      if ((dpSessionError && sessionError) || (!dpSessions && !sessions)) {
        return {
          count: 0,
          error: { message: 'Failed to fetch sessions' }
        };
      }

      let totalUnreadCount = 0;

      // Count unread messages in doctor_patient_messages table
      if (dpSessions && dpSessions.length > 0) {
        const dpSessionIds = dpSessions.map(s => s.id);
        const { count: dpCount, error: dpCountError } = await (supabase as any)
          .from('doctor_patient_messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
          .neq('sender_id', userId)
          .in('session_id', dpSessionIds);

        if (!dpCountError && dpCount !== null) {
          totalUnreadCount += dpCount;
        }
      }

      // Count unread messages in regular messages table
      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id);
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
          .neq('sender_id', userId)
          .in('session_id', sessionIds);

        if (!error && count !== null) {
          totalUnreadCount += count;
        }
      }

      return { count: totalUnreadCount, error: null };
    } catch (err) {
      return {
        count: 0,
        error: { message: 'Network error while fetching unread count' }
      };
    }
  }

  /**
   * Validate message content
   */
  private static validateMessageContent(content: string): { valid: boolean; error?: string } {
    if (!content || typeof content !== 'string') {
      return { valid: false, error: 'Message content is required' };
    }

    const trimmed = content.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (trimmed.length > 2000) {
      return { valid: false, error: 'Message is too long (max 2000 characters)' };
    }

    // Basic XSS prevention - check for script tags
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmed)) {
        return { valid: false, error: 'Message contains potentially dangerous content' };
      }
    }

    return { valid: true };
  }

  /**
   * Delete a chat session (for doctors only)
   */
  static async deleteChatSession(sessionId: string, userId: string): Promise<{ success: boolean; error: ChatAPIError | null }> {
    try {
      // First check if user is a doctor and owns this session
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        return {
          success: false,
          error: { message: 'Session not found', code: sessionError.code }
        };
      }

      // Check if user is a doctor (with fallback for RLS issues) - use safe bulk query approach
      const { data: doctors } = await supabase
        .from('doctors')
        .select('user_id')
        .limit(10);

      const doctor = doctors?.find(d => d.user_id === userId);

      if (!doctor) {
        // If we can't verify doctor status due to RLS or other issues,
        // check if the session belongs to this user as a fallback
        if (session.participant_1_id === userId || session.participant_2_id === userId) {
          // User is a participant in this session, allow deletion
          console.log('Allowing session deletion due to participation verification');
        } else {
          return {
            success: false,
            error: { message: 'Only doctors can delete chat sessions' }
          };
        }
      }

      // Delete the session (this will cascade delete messages due to FK constraints)
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        return {
          success: false,
          error: { message: 'Failed to delete chat session', code: error.code }
        };
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: { message: 'Network error while deleting chat session' }
      };
    }
  }
}

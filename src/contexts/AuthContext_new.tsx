import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Import Clerk hooks directly (not conditionally)
import { useUser as useClerkUser, useAuth as useClerkAuthHook, useClerk as useClerkHook } from '@clerk/clerk-react';

interface DoctorProfile {
  id: string;
  user_id: string;
  username: string;
  name: string;
  registration_no?: string | null;
}

interface PatientProfile {
  id: string;
  user_id: string | null;
  name: string;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  phone?: string | null;
  medical_history?: string | null;
  assigned_doctor_id?: string | null;
}

interface AuthUser {
  id: string;
  user_id: string;
  auth_user_id: string; // Supabase auth.users ID
  username?: string;
  name: string;
  email?: string;
  role: 'doctor' | 'patient';
  registration_no?: string | null;
  age?: number | null;
  gender?: string | null;
  phone?: string | null;
  medical_history?: string | null;
  assigned_doctor_id?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: any; // Clerk session object
  login: (email: string, password: string, userType?: 'doctor' | 'patient') => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    userData: { username: string; name: string; registrationNo?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🔄 AuthProvider component rendered');
  const { user: clerkUser, isLoaded: isClerkLoaded } = useClerkUser();
  const { isSignedIn } = useClerkAuthHook();
  const { signOut } = useClerkHook();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthContext useEffect triggered:', {
      isClerkConfigured: true,
      isClerkLoaded,
      isSignedIn,
      clerkUser: clerkUser ? { id: clerkUser.id, email: clerkUser.primaryEmailAddress?.emailAddress } : null
    });

    // Check if Clerk is properly configured
    const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    const isClerkConfigured = clerkKey &&
      clerkKey !== 'pk_test_your_key_here' &&
      !clerkKey.includes('your_actual_clerk_publishable_key_here');

    console.log('🔧 Clerk configuration check:', { clerkKey: clerkKey ? 'configured' : 'not configured', isClerkConfigured });

    // Only run Clerk logic if Clerk is properly configured
    if (!isClerkConfigured) {
      console.log('⚠️ Clerk not configured, skipping auth logic');
      setIsLoading(false);
      return;
    }

    if (!isClerkLoaded) {
      console.log('⏳ Clerk not loaded yet, waiting...');
      setIsLoading(true);
      return;
    }

    if (isSignedIn && clerkUser) {
      console.log('✅ User signed in with Clerk, setting up Supabase auth');
      setupSupabaseAuth(clerkUser);
    } else {
      console.log('❌ User not signed in with Clerk');
      setUser(null);
      setIsLoading(false);
    }
  }, [isSignedIn, clerkUser, isClerkLoaded]);

  const setupSupabaseAuth = async (clerkUser: any) => {
    try {
      console.log('🚀 Setting up Supabase auth for Clerk user:', clerkUser.id);

      // Check if user is already authenticated with Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ Error getting Supabase session:', sessionError);
      }

      if (session?.user) {
        console.log('✅ Found existing Supabase session:', session.user.id);
        await fetchUserProfile(session.user.id);
        return;
      }

      // For now, fall back to Clerk-only auth since OAuth setup requires Supabase configuration
      console.log('🔄 No Supabase session found, using Clerk-only auth');
      await handleClerkOnlyAuth(clerkUser);

    } catch (error) {
      console.error('❌ Error setting up Supabase auth:', error);
      await handleClerkOnlyAuth(clerkUser);
    }
  };

  const handleClerkOnlyAuth = async (clerkUser: any) => {
    console.log('🔄 Falling back to Clerk-only authentication');

    // Try to fetch user profile using Clerk ID
    const dbUserId = clerkUser?.unsafeMetadata?.dbUserId as string;
    console.log('🗄️ DB User ID from Clerk metadata:', dbUserId);

    if (dbUserId) {
      console.log('🔍 Using dbUserId to fetch profile:', dbUserId);
      // Try to fetch doctor profile first
      const { data: doctorProfile } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', dbUserId)
        .single();

      if (doctorProfile) {
        console.log('✅ Found doctor profile:', doctorProfile);
        setUser({
          id: clerkUser.id,
          user_id: doctorProfile.id,
          auth_user_id: dbUserId, // Use the stored database ID
          username: doctorProfile.username,
          name: doctorProfile.name,
          email: clerkUser?.primaryEmailAddress?.emailAddress,
          role: 'doctor',
          registration_no: doctorProfile.registration_no,
        });
        setIsLoading(false);
        return;
      }

      // Try patient profile
      const { data: patientProfile } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', dbUserId)
        .single();

      if (patientProfile) {
        console.log('✅ Found patient profile:', patientProfile);
        setUser({
          id: clerkUser.id,
          user_id: patientProfile.id,
          auth_user_id: dbUserId,
          name: patientProfile.name,
          email: clerkUser?.primaryEmailAddress?.emailAddress || patientProfile.email,
          role: 'patient',
          age: patientProfile.age,
          gender: patientProfile.gender,
          phone: patientProfile.phone,
          medical_history: patientProfile.medical_history,
          assigned_doctor_id: patientProfile.assigned_doctor_id,
        });
        setIsLoading(false);
        return;
      }
    }

    // If no profile found, user needs to complete onboarding
    console.log('⚠️ No profile found for Clerk user, needs onboarding');
    setUser(null);
    setIsLoading(false);
  };

  const fetchUserProfile = async (supabaseUserId: string) => {
    console.log('🚀 Fetching user profile for Supabase user:', supabaseUserId);

    try {
      // Try to fetch doctor profile
      const { data: doctorProfile } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', supabaseUserId)
        .single();

      if (doctorProfile) {
        console.log('✅ Found doctor profile for Supabase user');
        setUser({
          id: supabaseUserId,
          user_id: doctorProfile.id,
          auth_user_id: supabaseUserId,
          username: doctorProfile.username,
          name: doctorProfile.name,
          email: undefined, // Doctors table doesn't have email field
          role: 'doctor',
          registration_no: doctorProfile.registration_no,
        });
        setIsLoading(false);
        return;
      }

      // Try patient profile
      const { data: patientProfile } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', supabaseUserId)
        .single();

      if (patientProfile) {
        console.log('✅ Found patient profile for Supabase user');
        setUser({
          id: supabaseUserId,
          user_id: patientProfile.id,
          auth_user_id: supabaseUserId,
          name: patientProfile.name,
          email: patientProfile.email,
          role: 'patient',
          age: patientProfile.age,
          gender: patientProfile.gender,
          phone: patientProfile.phone,
          medical_history: patientProfile.medical_history,
          assigned_doctor_id: patientProfile.assigned_doctor_id,
        });
        setIsLoading(false);
        return;
      }

      console.log('⚠️ No profile found for Supabase user');
      setUser(null);
      setIsLoading(false);

    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      setUser(null);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, userType?: 'doctor' | 'patient') => {
    try {
      console.log('🔐 Attempting login with:', { email, userType });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.id);
        await fetchUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('❌ Login exception:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: { username: string; name: string; registrationNo?: string }
  ) => {
    try {
      console.log('📝 Attempting signup with:', { email, userData });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ Signup error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Signup successful:', data.user.id);
        // Note: Profile creation would happen in a database trigger or separate step
        return { success: true };
      }

      return { success: false, error: 'Signup failed' };
    } catch (error) {
      console.error('❌ Signup exception:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Attempting logout');

      // Sign out from both Supabase and Clerk
      await Promise.all([
        supabase.auth.signOut(),
        signOut()
      ]);

      console.log('✅ Logout successful');
      setUser(null);
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const value = {
    user,
    session: null, // We'll use Supabase session instead
    login,
    signUp,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

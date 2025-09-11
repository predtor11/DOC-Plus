import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Import Clerk components for OAuth
import { SignedIn, SignedOut, SignIn, SignUp, useUser, useClerk } from '@clerk/clerk-react';

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
  auth_user_id?: string;
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
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    userData: { username: string; name: string; registrationNo?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isCheckingProfile: boolean;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect triggered:', {
      isClerkLoaded,
      clerkUser: clerkUser ? { id: clerkUser.id, email: clerkUser.primaryEmailAddress?.emailAddress } : null
    });

    if (!isClerkLoaded) {
      console.log('⏳ Clerk not loaded yet, waiting...');
      setIsLoading(true);
      return;
    }

    if (clerkUser) {
      console.log('✅ Clerk user found, setting up Supabase OAuth');
      setupSupabaseOAuth(clerkUser);
    } else {
      console.log('❌ No Clerk user, clearing state');
      setUser(null);
      setSession(null);
      setIsLoading(false);
      setIsCheckingProfile(false);
    }
  }, [clerkUser, isClerkLoaded]);

  const setupSupabaseOAuth = async (clerkUser: any) => {
    try {
      console.log('🚀 Setting up Supabase OAuth for Clerk user:', clerkUser.id);

      // Get the JWT token from Clerk
      const token = await clerkUser.getToken({ template: 'supabase' }) || await clerkUser.getToken();
      console.log('🔑 Got Clerk JWT token:', token ? '***' + token.slice(-10) : 'null');

      if (token) {
        // Set the JWT token in Supabase auth
        // We'll use the token directly for authenticated requests
        console.log('✅ Clerk JWT token available for Supabase auth');

        // For now, let's create a minimal session object to satisfy the auth state
        // The actual authentication will happen via the JWT token in requests
        const mockSession = {
          access_token: token,
          refresh_token: '',
          user: {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
          },
        };
        setSession(mockSession as any);
      }

      // Start checking for user profile
      setIsCheckingProfile(true);
      // Fetch user profile based on Clerk user ID
      await fetchUserProfileByClerkId(clerkUser.id);

    } catch (error) {
      console.error('❌ Error setting up Supabase OAuth:', error);
      // Even if OAuth setup fails, try to fetch profile
      setIsCheckingProfile(true);
      await fetchUserProfileByClerkId(clerkUser.id);
    }
  };

  const fetchUserProfile = async (supabaseUserId: string) => {
    console.log('🚀 Fetching user profile for Supabase user:', supabaseUserId);

    try {
      // Try to fetch doctor profile first - use safe bulk query approach
      const { data: doctors } = await supabase
        .from('doctors')
        .select('*')
        .limit(10);

      const doctorProfile = doctors?.find(d => d.user_id === supabaseUserId);

      if (doctorProfile) {
        console.log('✅ Found doctor profile for Supabase user');
        setUser({
          id: supabaseUserId,
          user_id: doctorProfile.id,
          username: doctorProfile.username,
          name: doctorProfile.name,
          email: clerkUser?.primaryEmailAddress?.emailAddress,
          role: 'doctor',
          registration_no: doctorProfile.registration_no,
        });
      } else {
        // Try to fetch patient profile - use safe bulk query approach
        const { data: patients } = await supabase
          .from('patients')
          .select('*')
          .limit(10);

        const patientProfile = patients?.find(p => p.user_id === supabaseUserId);

        if (patientProfile) {
          console.log('✅ Found patient profile for Supabase user');
          setUser({
            id: supabaseUserId,
            user_id: patientProfile.id,
            name: patientProfile.name,
            email: clerkUser?.primaryEmailAddress?.emailAddress || patientProfile.email,
            role: 'patient',
            age: patientProfile.age,
            gender: patientProfile.gender,
            phone: patientProfile.phone,
            medical_history: patientProfile.medical_history,
            assigned_doctor_id: patientProfile.assigned_doctor_id,
          });
        } else {
          console.log('⚠️ No profile found for Supabase user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsCheckingProfile(false);
    }
  };

  const fetchUserProfileByClerkId = async (clerkUserId: string) => {
    console.log('🚀 Fetching user profile for Clerk user:', clerkUserId);
    console.log('🔍 Clerk user email:', clerkUser?.primaryEmailAddress?.emailAddress);

    try {
      // Try to find existing profiles using different matching strategies

      // Strategy 1: Try to match by clerk_user_id (if migration was applied)
      console.log('🔍 Strategy 1: Looking for profiles by clerk_user_id');

      // Check doctors table - use safe bulk query approach
      try {
        const { data: doctors } = await supabase
          .from('doctors')
          .select('id, user_id, username, name, registration_no')
          .limit(10);

        const doctorByClerkId = doctors?.find(d => d.user_id === clerkUserId);

        if (doctorByClerkId) {
          console.log('✅ Found doctor profile by user_id');
          const userData = {
            id: clerkUserId,
            user_id: doctorByClerkId.id,
            auth_user_id: doctorByClerkId.user_id || clerkUserId,
            username: doctorByClerkId.username,
            name: doctorByClerkId.name,
            email: clerkUser?.primaryEmailAddress?.emailAddress,
            role: 'doctor' as const,
            registration_no: doctorByClerkId.registration_no,
          };
          console.log('🔄 Setting user data:', userData);
          setUser(userData);
          setIsLoading(false);
          setIsCheckingProfile(false);
          return;
        }
      } catch (error) {
        console.log('⚠️ No doctor found by user_id');
      }

      // Check patients table by user_id (primary method) - use safe bulk query approach
      try {
        const { data: patients } = await supabase
          .from('patients')
          .select('id, user_id, name, email, age, gender, phone, medical_history, assigned_doctor_id')
          .limit(10);

        const patientByUserId = patients?.find(p => p.user_id === clerkUserId);

        if (patientByUserId) {
          console.log('✅ Found patient profile by user_id');
          const userData = {
            id: clerkUserId,
            user_id: patientByUserId.id,
            auth_user_id: patientByUserId.user_id || clerkUserId,
            name: patientByUserId.name,
            email: clerkUser?.primaryEmailAddress?.emailAddress || patientByUserId.email,
            role: 'patient' as const,
            age: patientByUserId.age,
            gender: patientByUserId.gender,
            phone: patientByUserId.phone,
            medical_history: patientByUserId.medical_history,
            assigned_doctor_id: patientByUserId.assigned_doctor_id,
          };
          console.log('🔄 Setting user data:', userData);
          setUser(userData);
          setIsLoading(false);
          setIsCheckingProfile(false);
          return;
        }
      } catch (error) {
        console.log('⚠️ No patient found by user_id');
      }

      // Fallback: Try user_id if it exists - use safe bulk query approach
      try {
        const { data: patients } = await supabase
          .from('patients')
          .select('id, user_id, name, email, age, gender, phone, medical_history, assigned_doctor_id')
          .limit(10);

        const patientByClerkId = patients?.find(p => p.user_id === clerkUserId);

        if (patientByClerkId) {
          console.log('✅ Found patient profile by user_id');
          const userData = {
            id: clerkUserId,
            user_id: patientByClerkId.id,
            auth_user_id: patientByClerkId.user_id || clerkUserId,
            name: patientByClerkId.name,
            email: clerkUser?.primaryEmailAddress?.emailAddress || patientByClerkId.email,
            role: 'patient' as const,
            age: patientByClerkId.age,
            gender: patientByClerkId.gender,
            phone: patientByClerkId.phone,
            medical_history: patientByClerkId.medical_history,
            assigned_doctor_id: patientByClerkId.assigned_doctor_id,
          };
          console.log('🔄 Setting user data:', userData);
          setUser(userData);
          setIsLoading(false);
          setIsCheckingProfile(false);
          return;
        }
      } catch (error) {
        console.log('⚠️ No patient found by user_id (column may not exist)');
      }

      // Strategy 2: Try to match by name (fallback)
      const clerkName = `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim();
      console.log('🔍 Strategy 2: Looking for profiles by name:', clerkName);

      if (clerkName && clerkName !== ' ') {
        // Check doctors by name - use safe bulk query approach
        try {
          const { data: doctors } = await supabase
            .from('doctors')
            .select('id, user_id, username, name, registration_no')
            .limit(10);

          const doctorByName = doctors?.find(d => d.name === clerkName);

          if (doctorByName) {
            console.log('✅ Found doctor profile by name');
            const userData = {
              id: clerkUserId,
              user_id: doctorByName.id,
              auth_user_id: doctorByName.user_id || clerkUserId,
              username: doctorByName.username,
              name: doctorByName.name,
              email: clerkUser?.primaryEmailAddress?.emailAddress,
              role: 'doctor' as const,
              registration_no: doctorByName.registration_no,
            };
            console.log('🔄 Setting user data:', userData);
            setUser(userData);
            setIsLoading(false);
            setIsCheckingProfile(false);
            return;
          }
        } catch (error) {
          console.log('⚠️ No doctor found by name');
        }

        // Check patients by name - use safe bulk query approach
        try {
          const { data: patients } = await supabase
            .from('patients')
            .select('id, user_id, name, email, age, gender, phone, medical_history, assigned_doctor_id')
            .limit(10);

          const patientByName = patients?.find(p => p.name === clerkName);

          if (patientByName) {
            console.log('✅ Found patient profile by name');
            const userData = {
              id: clerkUserId,
              user_id: patientByName.id,
              auth_user_id: patientByName.user_id || clerkUserId,
              name: patientByName.name,
              email: clerkUser?.primaryEmailAddress?.emailAddress || patientByName.email,
              role: 'patient' as const,
              age: patientByName.age,
              gender: patientByName.gender,
              phone: patientByName.phone,
              medical_history: patientByName.medical_history,
              assigned_doctor_id: patientByName.assigned_doctor_id,
            };
            console.log('🔄 Setting user data:', userData);
            setUser(userData);
            setIsLoading(false);
            setIsCheckingProfile(false);
            return;
          }
        } catch (error) {
          console.log('⚠️ No patient found by name');
        }
      }

      // Strategy 3: Try to match patients by email (if email column exists)
      const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;
      console.log('🔍 Strategy 3: Looking for patients by email:', userEmail);

      if (userEmail) {
        try {
          const { data: patients } = await supabase
            .from('patients')
            .select('id, user_id, name, email, age, gender, phone, medical_history, assigned_doctor_id')
            .limit(10);

          const patientByEmail = patients?.find(p => p.email === userEmail);

          if (patientByEmail) {
            console.log('✅ Found patient profile by email');
            setUser({
              id: clerkUserId,
              user_id: patientByEmail.id,
              auth_user_id: patientByEmail.user_id || clerkUserId,
              name: patientByEmail.name,
              email: userEmail,
              role: 'patient',
              age: patientByEmail.age,
              gender: patientByEmail.gender,
              phone: patientByEmail.phone,
              medical_history: patientByEmail.medical_history,
              assigned_doctor_id: patientByEmail.assigned_doctor_id,
            });
            setIsLoading(false);
            setIsCheckingProfile(false);
            return;
          }
        } catch (error) {
          console.log('⚠️ No patient found by email or email column doesn\'t exist');
        }
      }

      // Strategy 3: Try to find all doctors and match by various criteria
      console.log('🔍 Strategy 3: Checking all doctors for matches');

      try {
        const { data: allDoctors } = await supabase
          .from('doctors')
          .select('id, user_id, username, name, registration_no');

        if (allDoctors) {
          // Try to match by user_id
          const doctorByUserId = allDoctors.find(doc => doc.user_id === clerkUserId);
          if (doctorByUserId) {
            console.log('✅ Found doctor by user_id from all doctors list');
            setUser({
              id: clerkUserId,
              user_id: doctorByUserId.id,
              auth_user_id: doctorByUserId.user_id || clerkUserId,
              username: doctorByUserId.username,
              name: doctorByUserId.name,
              email: clerkUser?.primaryEmailAddress?.emailAddress,
              role: 'doctor',
              registration_no: doctorByUserId.registration_no,
            });
            setIsLoading(false);
            setIsCheckingProfile(false);
            return;
          }

          // Try to match by name
          const clerkName = `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim();
          if (clerkName && clerkName !== ' ') {
            const doctorByName = allDoctors.find(doc => doc.name === clerkName);
            if (doctorByName) {
              console.log('✅ Found doctor by name from all doctors list');
              setUser({
                id: clerkUserId,
                user_id: doctorByName.id,
                auth_user_id: doctorByName.user_id || clerkUserId,
                username: doctorByName.username,
                name: doctorByName.name,
                email: clerkUser?.primaryEmailAddress?.emailAddress,
                role: 'doctor',
                registration_no: doctorByName.registration_no,
              });
              setIsLoading(false);
              setIsCheckingProfile(false);
              return;
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Error checking all doctors:', error);
      }

      // Strategy 5: If no profile found, redirect to onboarding
      console.log('⚠️ No existing profile found, redirecting to onboarding');
      console.log('🔄 Setting user to null and isLoading to false');
      setUser(null);
      setIsLoading(false);
      setIsCheckingProfile(false);

    } catch (error) {
      console.error('❌ Error fetching user profile by Clerk ID:', error);
      setUser(null);
      setIsLoading(false);
      setIsCheckingProfile(false);
    }
  };

  // Set up Supabase auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Supabase auth state change:', event, session?.user?.id);
        setSession(session);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setIsLoading(false);
          setIsCheckingProfile(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    // With Clerk OAuth, login is handled by Clerk's components
    // This method is kept for compatibility but redirects to Clerk
    console.log('🔐 Login called - redirecting to Clerk authentication');
    return { success: true, error: 'Please use Clerk authentication' };
  };

  const signUp = async (
    email: string,
    password: string,
    userData: { username: string; name: string; registrationNo?: string }
  ) => {
    // With Clerk OAuth, signup is handled by Clerk's components
    // This method is kept for compatibility but redirects to Clerk
    console.log('📝 Signup called - redirecting to Clerk authentication');
    return { success: true, error: 'Please use Clerk authentication' };
  };

  const logout = async () => {
    console.log('🚪 Logging out from both Clerk and Supabase');
    // Sign out from both services
    await Promise.all([
      supabase.auth.signOut(),
      clerkSignOut()
    ]);
  };

  return (
    <AuthContext.Provider value={{ user, session, login, signUp, logout, isLoading, isCheckingProfile, setUser }}>
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
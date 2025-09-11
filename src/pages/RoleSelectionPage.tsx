import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RoleSelectionPage: React.FC = () => {
  const { user: clerkUser } = useUser();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelection = async (selectedRole: 'doctor' | 'patient') => {
    if (!clerkUser || !user) return;

    try {
      if (selectedRole === 'doctor') {
        // Check if doctor profile already exists
        const { data: existingDoctor } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', clerkUser.id)
          .single();

        if (existingDoctor) {
          // Update user state with existing doctor profile
          setUser({
            id: clerkUser.id,
            user_id: existingDoctor.id,
            auth_user_id: existingDoctor.user_id || clerkUser.id,
            username: existingDoctor.username,
            name: existingDoctor.name,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            role: 'doctor',
            registration_no: existingDoctor.registration_no,
          });
        } else {
          // Redirect to onboarding for new doctor
          navigate('/onboarding');
          return;
        }
      } else {
        // Check if patient profile already exists
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', clerkUser.id)
          .single();

        if (existingPatient) {
          // Update user state with existing patient profile
          setUser({
            id: clerkUser.id,
            user_id: existingPatient.id,
            auth_user_id: existingPatient.user_id || clerkUser.id,
            name: existingPatient.name,
            email: clerkUser.primaryEmailAddress?.emailAddress || existingPatient.email,
            role: 'patient',
            age: existingPatient.age,
            gender: existingPatient.gender,
            phone: existingPatient.phone,
            medical_history: existingPatient.medical_history,
            assigned_doctor_id: existingPatient.assigned_doctor_id,
          });
        } else {
          // Redirect to onboarding for new patient
          navigate('/onboarding');
          return;
        }
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error selecting role:', error);
      // If there's an error, redirect to onboarding
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back!</CardTitle>
          <CardDescription>
            Please select your role to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Signed in as: {clerkUser?.primaryEmailAddress?.emailAddress}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleRoleSelection('doctor')}
                className="w-full"
                variant="default"
              >
                I am a Doctor
              </Button>

              <Button
                onClick={() => handleRoleSelection('patient')}
                className="w-full"
                variant="outline"
              >
                I am a Patient
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                If you don't have a profile yet, you'll be redirected to create one.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelectionPage;

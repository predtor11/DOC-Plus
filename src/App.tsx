import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DashboardLayout from "./components/DashboardLayout";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AIChat from "./pages/AIChat";
import DoctorChat from "./pages/DoctorChat";
import PatientDoctorChat from "./pages/PatientDoctorChat";
import PatientRegistration from "./pages/PatientRegistration";
import Patients from "./pages/Patients";
import NotFound from "./pages/NotFound";
import PatientDetail from "./pages/PatientDetail";
import OnboardingPage from "./pages/OnboardingPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import Clerk components
import { SignedIn, SignedOut, SignIn, SignUp, useClerk } from '@clerk/clerk-react';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log('🔄 AppRoutes - Current location:', location.pathname);
  console.log('🔄 AppRoutes - user:', user, 'isLoading:', isLoading);

  // Show loading spinner while determining user state
  if (isLoading) {
    console.log('⏳ AppRoutes - Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('✅ AppRoutes - Loading complete, user:', user);

  if (user) {
    console.log('👤 AppRoutes - User found, role:', user.role);
    console.log('🏠 AppRoutes - Setting up authenticated routes');
  } else {
    console.log('❌ AppRoutes - No user found');
  }

  return (
    <Routes>
      {/* Always available routes */}
      <Route path="/onboarding" element={user ? <Navigate to="/dashboard" replace /> : <OnboardingPage />} />

      {/* Authenticated routes */}
      {user ? (
        <>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
          <Route path="/debug" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
              <div className="space-y-2">
                <p><strong>Current Path:</strong> {location.pathname}</p>
                <p><strong>User:</strong> {user ? 'Found' : 'Not Found'}</p>
                <p><strong>User Name:</strong> {user?.name}</p>
                <p><strong>User Role:</strong> {user?.role}</p>
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              </div>
              <div className="mt-4">
                <a href="/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Go to Dashboard</a>
                <a href="/test" className="bg-green-500 text-white px-4 py-2 rounded">Test Route</a>
              </div>
            </div>
          } />
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                {user.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />}
              </DashboardLayout>
            }
          />
          <Route
            path="/ai-chat"
            element={
              <DashboardLayout>
                <AIChat />
              </DashboardLayout>
            }
          />
          <Route
            path="/doctor-chat"
            element={
              <DashboardLayout>
                {user.role === 'doctor' ? <DoctorChat /> : <PatientDoctorChat />}
              </DashboardLayout>
            }
          />
          {/* Doctor-only routes */}
          {user.role === 'doctor' && (
            <>
              <Route
                path="/patients"
                element={
                  <DashboardLayout>
                    <Patients />
                  </DashboardLayout>
                }
              />
              <Route
                path="/register-patient"
                element={
                  <DashboardLayout>
                    <PatientRegistration />
                  </DashboardLayout>
                }
              />
              <Route
                path="/patient/:id"
                element={
                  <DashboardLayout>
                    <PatientDetail />
                  </DashboardLayout>
                }
              />
            </>
          )}
        </>
      ) : (
        /* Redirect to onboarding if no user */
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      )}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppContent = () => {
  const { loaded } = useClerk();
  const { user, isLoading } = useAuth();

  console.log('🔄 AppContent - Clerk loaded:', loaded, 'Auth loading:', isLoading, 'User:', user);

  if (!loaded || isLoading) {
    console.log('⏳ AppContent - Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('✅ AppContent - Loading complete');

  if (user === null) {
    console.log('📝 AppContent - No user profile, showing onboarding');
  } else {
    console.log('👤 AppContent - User profile found, showing app routes');
  }

  return (
    <>
      <SignedIn>
        {/* If user is signed in but has no profile, show onboarding */}
        {user === null ? (
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        ) : (
          <AppRoutes />
        )}
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Welcome to Doc+</h1>
              <p className="text-gray-600 mt-2">Please sign in to continue</p>
            </div>
            <SignIn
              routing="virtual"
              signUpUrl="/sign-up"
              redirectUrl="/dashboard"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                  card: 'shadow-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden'
                }
              }}
            />
          </div>
        </div>
      </SignedOut>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

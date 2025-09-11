import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import Clerk provider
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

console.log('🔧 Clerk Configuration:', {
  hasKey: !!PUBLISHABLE_KEY,
  keyLength: PUBLISHABLE_KEY?.length,
  keyPreview: PUBLISHABLE_KEY ? PUBLISHABLE_KEY.substring(0, 20) + '...' : 'undefined'
});

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    appearance={{
      baseTheme: undefined,
    }}
  >
    <App />
  </ClerkProvider>
);

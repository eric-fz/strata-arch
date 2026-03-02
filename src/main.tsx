import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.tsx';
import { useAppStore } from './store/appStore.ts';
import { idbClearAll } from './lib/idb.ts';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

async function boot() {
  // One-time wipe of previously seeded data
  const wiped = sessionStorage.getItem('strata_wiped_v1');
  if (!wiped) {
    try { await idbClearAll(); } catch { /* ok */ }
    sessionStorage.setItem('strata_wiped_v1', '1');
  }

  try {
    await useAppStore.getState().hydrate();
  } catch (e) {
    console.warn('IndexedDB hydration failed, continuing in-memory:', e);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      >
        <App />
      </ClerkProvider>
    </StrictMode>,
  );
}

boot();

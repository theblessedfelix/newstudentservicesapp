import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getStoredSession, signIn, signOut, type AppRole, type AppSession } from './authService';

type AuthContextValue = {
  session: AppSession | null;
  isAuthenticated: boolean;
  signInWithRole: (input: { identifier: string; password: string; role: AppRole }) => Promise<AppSession>;
  signOutCurrentUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AppSession | null>(() => getStoredSession());

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      signInWithRole: async (input) => {
        const nextSession = await signIn(input);
        setSession(nextSession);
        return nextSession;
      },
      signOutCurrentUser: async () => {
        await signOut();
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
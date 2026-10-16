import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ensureSeeded, getCurrentUser, signIn as backendSignIn, signOut as backendSignOut, signUp as backendSignUp } from '@/lib/backend';
import type { PublicUser } from '@/lib/types';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, displayName: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      await ensureSeeded();
      const current = await getCurrentUser();
      if (active) {
        setUser(current);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const signedIn = await backendSignIn(username, password);
    setUser(signedIn);
  }, []);

  const signUp = useCallback(async (username: string, displayName: string, password: string) => {
    const created = await backendSignUp(username, displayName, password);
    setUser(created);
  }, []);

  const signOut = useCallback(async () => {
    await backendSignOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

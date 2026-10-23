import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { getProfile, getCurrentUser, signIn as backendSignIn, signOut as backendSignOut, signUp as backendSignUp } from '@/lib/backend';
import { getSupabase } from '@/lib/supabase';
import type { PublicUser } from '@/lib/types';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, username: string, displayName: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    let active = true;
    try {
      const { data: { subscription } } = getSupabase().auth.onAuthStateChange((_event, session) => {
        const currentRequest = ++requestId.current;
        setError(null);
        if (!session) {
          setUser(null);
          setLoading(false);
          return;
        }
        setLoading(true);
        setTimeout(() => {
          void getProfile(session.user.id).then((profile) => {
            if (active && requestId.current === currentRequest) {
              setUser(profile);
              setLoading(false);
            }
          }).catch((cause: unknown) => {
            if (active && requestId.current === currentRequest) {
              setUser(null);
              setError(cause instanceof Error ? cause.message : 'Could not load your account.');
              setLoading(false);
            }
          });
        }, 0);
      });
      return () => {
        active = false;
        subscription.unsubscribe();
      };
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not initialize authentication.');
      setLoading(false);
    }
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await backendSignIn(email, password);
    setUser(await getCurrentUser());
  }, []);

  const signUp = useCallback(async (email: string, username: string, displayName: string, password: string) => {
    const hasSession = await backendSignUp(email, username, displayName, password);
    if (hasSession) setUser(await getCurrentUser());
    return hasSession;
  }, []);

  const signOut = useCallback(async () => {
    await backendSignOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, signIn, signUp, signOut }),
    [user, loading, error, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

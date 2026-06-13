import { useRouter, useSegments } from 'expo-router';
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
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';

import { ZentraColors } from '@/constants/zentra-theme';
import { registerAuthSignOutHandler, resetUnauthorizedGuard } from '@/lib/auth-session-handler';
import { isAccessTokenExpired } from '@/lib/jwt';
import { getStoredSession, saveSession, type StoredSession } from '@/lib/session';
import { withTimeout } from '@/lib/timeout';
import { supabase } from '@/lib/supabase';
import {
  refreshStoredSession,
  restoreStoredSession,
} from '@/services/auth';
import { signOutEverywhere } from '@/lib/sign-out';

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: Record<string, string | null> | null;
  signOut: () => Promise<void>;
  onAuthSuccess: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const BOOTSTRAP_TIMEOUT_MS = 12_000;

function applySession(
  session: StoredSession,
  setUser: (user: Record<string, string | null>) => void,
  setIsAuthenticated: (value: boolean) => void,
) {
  setUser(session.user);
  setIsAuthenticated(true);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Record<string, string | null> | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signingOutRef = useRef(false);

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    clearExpiryTimer();

    try {
      await signOutEverywhere();
      setIsAuthenticated(false);
      setUser(null);
      router.replace('/');
    } finally {
      signingOutRef.current = false;
    }
  }, [clearExpiryTimer, router]);

  useEffect(() => {
    if (isLoading) return;
    return registerAuthSignOutHandler(() => signOut());
  }, [isLoading, signOut]);

  const scheduleExpiryCheck = useCallback(
    (expiresAt: number | null) => {
      clearExpiryTimer();
      if (!expiresAt) return;

      const delay = Math.max(expiresAt - Date.now(), 0);
      expiryTimerRef.current = setTimeout(async () => {
        try {
          const refreshed = await withTimeout(
            refreshStoredSession(),
            BOOTSTRAP_TIMEOUT_MS,
            'Session refresh timed out.',
          );
          scheduleExpiryCheck(refreshed.expires_at);
        } catch {
          await signOut();
        }
      }, delay);
    },
    [clearExpiryTimer, signOut],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const session = await withTimeout(
          restoreStoredSession(),
          BOOTSTRAP_TIMEOUT_MS,
          'Session restore timed out.',
        );

        if (cancelled) return;

        if (!session) {
          setIsAuthenticated(false);
          setUser(null);
          clearExpiryTimer();
          router.replace('/');
          return;
        }

        applySession(session, setUser, setIsAuthenticated);
        scheduleExpiryCheck(session.expires_at);
      } catch {
        if (cancelled) return;
        await signOut();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Bootstrap once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAuthSuccess = useCallback(async () => {
    resetUnauthorizedGuard();
    const session = await getStoredSession();
    if (!session) return;

    applySession(session, setUser, setIsAuthenticated);
    scheduleExpiryCheck(session.expires_at);
    router.replace('/(tabs)');
  }, [router, scheduleExpiryCheck]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
        clearExpiryTimer();
        router.replace('/');
        return;
      }

      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        if (event === 'TOKEN_REFRESHED') {
          await saveSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_in: session.expires_in ?? null,
            expires_at: null,
            user: {
              id: session.user.id,
              email: session.user.email ?? null,
            },
          });
        }

        const stored = await getStoredSession();
        if (stored) {
          applySession(stored, setUser, setIsAuthenticated);
          scheduleExpiryCheck(stored.expires_at);
        }
      }
    });

    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;

      void (async () => {
        const session = await getStoredSession();
        if (!session) return;

        if (isAccessTokenExpired(session.expires_at)) {
          try {
            const refreshed = await withTimeout(
              refreshStoredSession(),
              BOOTSTRAP_TIMEOUT_MS,
              'Session refresh timed out.',
            );
            applySession(refreshed, setUser, setIsAuthenticated);
            scheduleExpiryCheck(refreshed.expires_at);
          } catch {
            await signOut();
          }
        }
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
      appStateListener.remove();
      clearExpiryTimer();
    };
  }, [clearExpiryTimer, scheduleExpiryCheck, signOut]);

  useEffect(() => {
    if (isLoading) return;

    const inTabs = segments[0] === '(tabs)';
    const inBucket = segments[0] === 'bucket';

    if (!isAuthenticated && (inTabs || inBucket)) {
      router.replace('/');
      return;
    }

    if (isAuthenticated && !inTabs && segments[0] !== 'bucket') {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, router, segments]);

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      user,
      signOut,
      onAuthSuccess,
    }),
    [isAuthenticated, isLoading, onAuthSuccess, signOut, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isLoading ? (
        <View pointerEvents="auto" style={styles.loadingOverlay}>
          <ActivityIndicator color={ZentraColors.accent} size="large" />
        </View>
      ) : null}
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ZentraColors.background,
    zIndex: 999,
  },
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

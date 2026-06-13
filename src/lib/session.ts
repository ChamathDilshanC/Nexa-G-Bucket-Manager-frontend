import * as SecureStore from 'expo-secure-store';

import { getJwtExpiry } from '@/lib/jwt';
import { removeSecureItem } from '@/lib/secure-storage';
import { supabase } from '@/lib/supabase';

const EXPIRES_AT_KEY = 'nexa_expires_at';
const USER_KEY = 'nexa_user';

export type StoredSession = {
  access_token: string;
  refresh_token: string | null;
  expires_at: number | null;
  expires_in?: number | null;
  user: Record<string, string | null>;
};

function resolveExpiresAt(session: StoredSession) {
  if (session.expires_at) return session.expires_at;
  if (session.expires_in) return Date.now() + session.expires_in * 1000;
  return getJwtExpiry(session.access_token);
}

async function readUserMetadata() {
  const userRaw = await SecureStore.getItemAsync(USER_KEY);
  if (!userRaw) return null;

  try {
    return JSON.parse(userRaw) as Record<string, string | null>;
  } catch {
    return null;
  }
}

export async function saveSession(session: StoredSession) {
  const expiresAt = resolveExpiresAt(session);

  if (session.access_token && session.refresh_token) {
    const { data: current } = await supabase.auth.getSession();
    const alreadySynced =
      current.session?.access_token === session.access_token &&
      current.session?.refresh_token === session.refresh_token;

    if (!alreadySynced) {
      const { error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      if (error) {
        throw new Error(error.message);
      }
    }
  }

  if (expiresAt) {
    await SecureStore.setItemAsync(EXPIRES_AT_KEY, String(expiresAt));
  } else {
    await SecureStore.deleteItemAsync(EXPIRES_AT_KEY).catch(() => undefined);
  }

  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user));

  // Remove legacy duplicate token keys from older app versions.
  await removeSecureItem('nexa_access_token').catch(() => undefined);
  await removeSecureItem('nexa_refresh_token').catch(() => undefined);
}

export async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function getRefreshToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.refresh_token ?? null;
}

export async function getStoredSession(): Promise<StoredSession | null> {
  const { data } = await supabase.auth.getSession();
  const activeSession = data.session;

  if (!activeSession?.access_token) {
    return null;
  }

  const expiresAtRaw = await SecureStore.getItemAsync(EXPIRES_AT_KEY);
  const expires_at = expiresAtRaw
    ? Number(expiresAtRaw)
    : getJwtExpiry(activeSession.access_token);

  const storedUser = await readUserMetadata();

  return {
    access_token: activeSession.access_token,
    refresh_token: activeSession.refresh_token,
    expires_at,
    user: storedUser ?? {
      id: activeSession.user.id,
      email: activeSession.user.email ?? null,
    },
  };
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(EXPIRES_AT_KEY).catch(() => undefined);
  await SecureStore.deleteItemAsync(USER_KEY).catch(() => undefined);
}

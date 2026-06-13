import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { assertAuthConfig } from '@/lib/config';
import { isAccessTokenExpired } from '@/lib/jwt';
import { withTimeout } from '@/lib/timeout';
import {
  clearSession,
  getStoredSession,
  saveSession,
  type StoredSession,
} from '@/lib/session';
import { signOutEverywhere } from '@/lib/sign-out';
import { supabase } from '@/lib/supabase';
import {
  exchangeGoogleCode,
  getGoogleAuthUrl,
  refreshAuthSession,
  toStoredSession,
} from '@/services/api';

WebBrowser.maybeCompleteAuthSession();

function getRedirectUri() {
  return Linking.createURL('auth/callback');
}

function extractCodeFromUrl(url: string) {
  const parsed = Linking.parse(url);
  const code = parsed.queryParams?.code;
  return typeof code === 'string' ? code : null;
}

function toStoredSessionFromSupabase(session: {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: { id: string; email?: string | null };
}): StoredSession {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in ?? null,
    expires_at: null,
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
    },
  };
}

export async function refreshStoredSession() {
  const refreshToken = await getStoredSession().then((session) => session?.refresh_token);
  if (!refreshToken) {
    throw new Error('Session expired.');
  }

  try {
    const session = await refreshAuthSession(refreshToken);
    const stored = toStoredSession(session);
    await saveSession(stored);
    return stored;
  } catch {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) {
      throw new Error('Session expired.');
    }

    const stored = toStoredSessionFromSupabase(data.session);
    await saveSession(stored);
    return stored;
  }
}

export async function restoreStoredSession() {
  const session = await getStoredSession();
  if (!session?.access_token) return null;

  if (isAccessTokenExpired(session.expires_at)) {
    try {
      return await withTimeout(refreshStoredSession(), 12_000, 'Session refresh timed out.');
    } catch {
      await signOutEverywhere();
      return null;
    }
  }

  return session;
}

export { signOutEverywhere } from '@/lib/sign-out';

export async function signInWithEmail(email: string, password: string) {
  assertAuthConfig();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.session) throw new Error('No session returned from Supabase.');

  const stored = toStoredSessionFromSupabase(data.session);
  await saveSession(stored);
  return stored;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
) {
  assertAuthConfig();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.session) {
    throw new Error('Check your email to confirm your account, then sign in.');
  }

  const stored = toStoredSessionFromSupabase(data.session);
  await saveSession(stored);
  return stored;
}

export async function signInWithGoogle() {
  const redirectUri = getRedirectUri();
  const { url } = await getGoogleAuthUrl(redirectUri);
  const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);

  if (result.type !== 'success' || !result.url) {
    throw new Error('Google sign-in was cancelled.');
  }

  const code = extractCodeFromUrl(result.url);
  if (!code) {
    throw new Error('Google sign-in did not return an authorization code.');
  }

  const session = await exchangeGoogleCode(code);
  const stored = toStoredSession(session);
  await saveSession(stored);
  return stored;
}

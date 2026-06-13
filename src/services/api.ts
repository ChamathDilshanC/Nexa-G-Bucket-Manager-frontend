import { config } from '@/lib/config';
import type { StoredSession } from '@/lib/session';
import { authFetch } from '@/services/api-client';
import type { AuthUserProfile } from '@/types/bucket';

export { ApiError } from '@/lib/api-error';

export type AuthSessionResponse = {
  access_token: string;
  refresh_token: string | null;
  expires_in: number | null;
  token_type: string;
  user: Record<string, string | null>;
};

export type GoogleAuthResponse = {
  provider: string;
  url: string;
};

async function parseError(response: Response) {
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail)) {
      return data.detail.map((item: { msg?: string }) => item.msg).join(', ');
    }
    if (data?.message) return data.message;
  } catch {
    // ignore parse errors
  }
  return `Request failed (${response.status})`;
}

export async function getGoogleAuthUrl(redirectTo: string) {
  const url = `${config.apiBaseUrl}/auth/google?redirect_to=${encodeURIComponent(redirectTo)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return (await response.json()) as GoogleAuthResponse;
}

export async function exchangeGoogleCode(code: string) {
  const response = await fetch(`${config.apiBaseUrl}/auth/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return (await response.json()) as AuthSessionResponse;
}

export async function refreshAuthSession(refreshToken: string) {
  const response = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return (await response.json()) as AuthSessionResponse;
}

export async function getAuthenticatedUser() {
  return authFetch<AuthUserProfile>('/auth/me');
}

export function toStoredSession(session: AuthSessionResponse): StoredSession {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: null,
    user: session.user,
  };
}

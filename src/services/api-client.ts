import { ApiError } from '@/lib/api-error';
import { handleUnauthorized } from '@/lib/auth-session-handler';
import { config } from '@/lib/config';
import { getAccessToken, getRefreshToken, saveSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export { ApiError } from '@/lib/api-error';

export async function parseApiError(response: Response) {
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

async function requestWithToken(path: string, token: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${config.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });
}

async function refreshAccessToken() {
  invalidateAccessTokenCache();
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new ApiError('Session expired.', 401);
  }

  const response = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (response.ok) {
    const session = (await response.json()) as {
      access_token: string;
      refresh_token: string | null;
      expires_in: number | null;
      user: Record<string, string | null>;
    };

    await saveSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      expires_at: null,
      user: session.user,
    });
    return;
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) {
    throw new ApiError('Session expired.', 401);
  }

  await saveSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in ?? null,
    expires_at: null,
    user: {
      id: data.session.user.id,
      email: data.session.user.email ?? null,
    },
  });
}

let cachedAccessToken: string | null = null;
let accessTokenPromise: Promise<string | null> | null = null;

function invalidateAccessTokenCache() {
  cachedAccessToken = null;
  accessTokenPromise = null;
}

async function resolveAccessToken() {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  if (!accessTokenPromise) {
    accessTokenPromise = getAccessToken().then((token) => {
      cachedAccessToken = token;
      accessTokenPromise = null;
      return token;
    });
  }

  return accessTokenPromise;
}

export async function authFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  let token = await resolveAccessToken();
  if (!token) {
    throw new ApiError('Not authenticated.', 401);
  }

  let response = await requestWithToken(path, token, options);

  if (response.status === 401) {
    try {
      await refreshAccessToken();
      token = await resolveAccessToken();
      if (!token) {
        await handleUnauthorized();
        throw new ApiError('Session expired.', 401);
      }
      response = await requestWithToken(path, token, options);
    } catch (error) {
      await handleUnauthorized();
      if (error instanceof ApiError) throw error;
      throw new ApiError('Session expired.', 401);
    }
  }

  if (response.status === 401) {
    await handleUnauthorized();
    throw new ApiError('Session expired.', 401);
  }

  if (!response.ok) {
    throw new ApiError(await parseApiError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

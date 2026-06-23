import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthErrorMessage } from '@/components/auth/auth-error-message';
import { useThemeColors } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import { getStoredSession } from '@/lib/session';
import { completeGoogleSignIn } from '@/services/auth';

WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { onAuthSuccess } = useAuth();
  const { code } = useLocalSearchParams<{ code?: string | string[] }>();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);
  const colors = useThemeColors();

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    void (async () => {
      const authCode = Array.isArray(code) ? code[0] : code;

      try {
        const existingSession = await getStoredSession();
        if (existingSession?.access_token) {
          await onAuthSuccess();
          return;
        }

        if (!authCode) {
          throw new Error('Google sign-in did not return an authorization code.');
        }

        await completeGoogleSignIn(authCode);
        await onAuthSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google sign in failed.');
        setTimeout(() => router.replace('/login'), 2500);
      }
    })();
  }, [code, onAuthSuccess, router]);

  return (
    <View className="flex-1 items-center justify-center bg-app-bg px-6">
      {error ? (
        <AuthErrorMessage message={error} />
      ) : (
        <ActivityIndicator color={colors.accent} size="large" />
      )}
    </View>
  );
}

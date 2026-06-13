import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthDivider } from '@/components/auth/auth-divider';
import { AuthErrorMessage } from '@/components/auth/auth-error-message';
import { AuthFooterLink } from '@/components/auth/auth-footer-link';
import { AuthGoogleButton } from '@/components/auth/auth-google-button';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { ZentraColors } from '@/constants/zentra-theme';
import { useAuth } from '@/contexts/auth-context';
import { signInWithEmail, signInWithGoogle } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { onAuthSuccess } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailSignIn() {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmail(email.trim(), password);
      await onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      await onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenLayout
      title="Sign In"
      subtitle="Welcome back. Sign in with Google or your email and password."
      footer={
        <AuthFooterLink
          text="Don't have an account?"
          linkText="Register"
          onPress={() => router.replace('/register')}
        />
      }>
      {loading ? (
        <View className="mb-4 items-center">
          <ActivityIndicator color={ZentraColors.accent} />
        </View>
      ) : null}

      <AuthErrorMessage message={error} />

      <AuthGoogleButton onPress={handleGoogleSignIn} disabled={loading} />
      <AuthDivider />

      <AuthInput
        label="Email"
        placeholder="eg. john@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
      <AuthInput
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      <AuthButton label="Sign In" onPress={handleEmailSignIn} disabled={loading} />
    </AuthScreenLayout>
  );
}

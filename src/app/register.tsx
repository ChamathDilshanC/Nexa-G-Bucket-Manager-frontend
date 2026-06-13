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
import { signInWithGoogle, signUpWithEmail } from '@/services/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { onAuthSuccess } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    try {
      setLoading(true);
      setError(null);
      await signUpWithEmail(email.trim(), password, firstName.trim(), lastName.trim());
      await onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
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
      title="Create Account"
      subtitle="Sign up with Google or create an account using your email and password."
      footer={
        <AuthFooterLink
          text="Already have an account?"
          linkText="Sign In"
          onPress={() => router.replace('/login')}
        />
      }>
      {loading ? (
        <View className="mb-4 items-center">
          <ActivityIndicator color={ZentraColors.accent} />
        </View>
      ) : null}

      <AuthErrorMessage message={error} />

      <AuthGoogleButton label="Sign up with Google" onPress={handleGoogleSignIn} disabled={loading} />
      <AuthDivider />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <AuthInput
            label="First Name"
            placeholder="eg. John"
            value={firstName}
            onChangeText={setFirstName}
            editable={!loading}
          />
        </View>
        <View className="flex-1">
          <AuthInput
            label="Last Name"
            placeholder="eg. Francisco"
            value={lastName}
            onChangeText={setLastName}
            editable={!loading}
          />
        </View>
      </View>
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
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      <AuthButton label="Register" onPress={handleRegister} disabled={loading} />
    </AuthScreenLayout>
  );
}

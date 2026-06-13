import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorBanner, LoadingState } from '@/components/dashboard/empty-state';
import { AppScreen, ScreenHeader } from '@/components/dashboard/screen-header';
import { SectionTitle } from '@/components/dashboard/section-title';
import { SignOutButton } from '@/components/dashboard/sign-out-button';
import { useGlassTabBarInset } from '@/components/navigation/glass-tab-bar';
import { useAuth } from '@/contexts/auth-context';
import { Fonts } from '@/constants/fonts';
import { ZentraColors, ZentraLayout } from '@/constants/zentra-theme';
import { getAuthenticatedUser } from '@/services/api';
import { ApiError } from '@/services/api';
import type { AuthUserProfile } from '@/types/bucket';

function getInitials(email?: string | null) {
  if (!email) return '?';
  const letter = email.trim()[0]?.toUpperCase();
  return letter || '?';
}

function truncateMiddle(value: string, max = 22) {
  if (value.length <= max) return value;
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

type InfoRowProps = {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
};

function InfoRow({ icon, label, value, isLast = false }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <View style={styles.infoLeft}>
        <View style={styles.infoIconWrap}>
          <Text style={styles.infoIcon}>{icon}</Text>
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function LimitChip({ label }: { label: string }) {
  return (
    <View style={styles.limitChip}>
      <Text style={styles.limitChipText}>{label}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tabBarInset = useGlassTabBarInset();

  const email = profile?.email ?? user?.email ?? '—';
  const userId = profile?.user_id ?? user?.id ?? '—';
  const role = profile?.role ?? 'authenticated';
  const signInMethod = profile?.is_google_user ? 'Google' : profile?.provider ?? 'Email';

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAuthenticatedUser();
        setProfile(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function confirmSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  }

  return (
    <AppScreen header={<ScreenHeader title="Settings" subtitle="Manage your account and app preferences" />}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarInset }]}>
        {error ? <ErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingState />
        ) : (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(email)}</Text>
              </View>
              <View style={styles.profileCopy}>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {email}
                </Text>
                <View style={styles.providerBadge}>
                  <Text style={styles.providerBadgeText}>{signInMethod} account</Text>
                </View>
              </View>
            </View>

            <SectionTitle title="Account" subtitle="Your profile details" />
            <View style={styles.card}>
              <InfoRow icon="✉️" label="Email" value={email} />
              <InfoRow icon="🆔" label="User ID" value={truncateMiddle(userId, 26)} />
              <InfoRow icon="👤" label="Role" value={role} />
              <InfoRow icon="🔐" label="Sign-in" value={signInMethod} isLast />
            </View>

            <SectionTitle title="Storage" subtitle="Upload limits and supported formats" />
            <View style={styles.card}>
              <Text style={styles.cardTitle}>File upload rules</Text>
              <Text style={styles.cardBody}>
                Keep uploads within these limits for the best experience across all your buckets.
              </Text>

              <View style={styles.limitRow}>
                <LimitChip label="50 MB max" />
                <LimitChip label="JPEG" />
                <LimitChip label="PNG" />
                <LimitChip label="PDF" />
              </View>
            </View>

            <View style={styles.dangerSection}>
              <SectionTitle title="Session" subtitle="Sign out from this device" />
              <View style={styles.sessionCard}>
                <Text style={styles.sessionHint}>
                  You will need to sign in again to access your buckets and files.
                </Text>
                <SignOutButton onPress={confirmSignOut} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ZentraLayout.horizontalPadding,
    paddingTop: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZentraColors.card,
    borderWidth: 1,
    borderColor: ZentraColors.cardBorder,
    borderRadius: 18,
    padding: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(47, 128, 237, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(47, 128, 237, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    color: ZentraColors.accent,
  },
  profileCopy: {
    flex: 1,
  },
  profileEmail: {
    fontFamily: Fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: ZentraColors.title,
  },
  providerBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: ZentraColors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: ZentraColors.cardBorder,
  },
  providerBadgeText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: ZentraColors.body,
  },
  card: {
    backgroundColor: ZentraColors.card,
    borderWidth: 1,
    borderColor: ZentraColors.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 28,
  },
  cardTitle: {
    fontFamily: Fonts.semibold,
    fontSize: 15,
    lineHeight: 22,
    color: ZentraColors.title,
    marginTop: 12,
    marginBottom: 6,
  },
  cardBody: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: ZentraColors.body,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: ZentraColors.cardBorder,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: ZentraColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoIcon: {
    fontSize: 14,
    lineHeight: 18,
  },
  infoLabel: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: ZentraColors.body,
  },
  infoValue: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: ZentraColors.title,
    maxWidth: '46%',
    textAlign: 'right',
  },
  limitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  limitChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: ZentraColors.surface,
    borderWidth: 1,
    borderColor: ZentraColors.cardBorder,
    marginRight: 8,
    marginBottom: 8,
  },
  limitChipText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: ZentraColors.accent,
  },
  dangerSection: {
    marginBottom: 8,
  },
  sessionCard: {
    backgroundColor: ZentraColors.card,
    borderWidth: 1,
    borderColor: ZentraColors.cardBorder,
    borderRadius: 16,
    padding: 16,
  },
  sessionHint: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: ZentraColors.body,
    marginBottom: 16,
  },
});

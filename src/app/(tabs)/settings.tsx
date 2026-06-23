import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorBanner, LoadingState } from '@/components/dashboard/empty-state';
import { ThemeSegmentedControl } from '@/components/settings/theme-segmented-control';
import { AppIcon, type AppIconName, AppIcons } from '@/components/ui/app-icon';
import { useGlassTabBarInset } from '@/components/navigation/glass-tab-bar';
import { useAuth } from '@/contexts/auth-context';
import { useTheme, useThemeColors } from '@/contexts/theme-context';
import { Fonts } from '@/constants/fonts';
import type { ThemePalette } from '@/constants/zentra-theme';
import { getAuthenticatedUser } from '@/services/api';
import { ApiError } from '@/services/api';
import type { AuthUserProfile } from '@/types/bucket';

function getInitials(email?: string | null) {
  if (!email) return '?';
  const letter = email.trim()[0]?.toUpperCase();
  return letter || '?';
}

function truncateMiddle(value: string, max = 28) {
  if (value.length <= max) return value;
  return `${value.slice(0, 12)}…${value.slice(-10)}`;
}

type SettingsRowProps = {
  icon: AppIconName;
  label: string;
  value: string;
  colors: ThemePalette;
  onPress?: () => void;
  isLast?: boolean;
  valueColor?: string;
};

function SettingsRow({
  icon,
  label,
  value,
  colors,
  onPress,
  isLast = false,
  valueColor,
}: SettingsRowProps) {
  const rowInner = (
    <View style={styles.settingsRowInner}>
      <View style={styles.settingsIconWrap}>
        <AppIcon name={icon} size={22} />
      </View>

      <View style={styles.settingsCopy}>
        <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.body }}>{label}</Text>
        <Text
          numberOfLines={1}
          style={{
            marginTop: 2,
            fontFamily: Fonts.medium,
            fontSize: 16,
            color: valueColor ?? colors.title,
          }}>
          {value}
        </Text>
      </View>

      <AppIcon name={AppIcons.chevronForward} size={18} color={colors.muted} />
    </View>
  );

  const borderStyle = !isLast
    ? { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }
    : null;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.settingsRowPressable, borderStyle, pressed && styles.pressed]}>
        {rowInner}
      </Pressable>
    );
  }

  return <View style={[styles.settingsRowPressable, borderStyle]}>{rowInner}</View>;
}

const styles = StyleSheet.create({
  settingsRowPressable: {
    width: '100%',
  },
  settingsRowInner: {
    width: '100%',
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingsIconWrap: {
    marginRight: 12,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsCopy: {
    minWidth: 0,
    flex: 1,
    paddingRight: 12,
  },
  pressed: {
    opacity: 0.8,
  },
});

function SectionHeading({ title, colors }: { title: string; colors: ThemePalette }) {
  return (
    <Text
      style={{
        marginBottom: 8,
        marginTop: 24,
        textAlign: 'center',
        fontFamily: Fonts.regular,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: colors.body,
      }}>
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { themePreference, setThemePreference } = useTheme();
  const colors = useThemeColors();
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tabBarInset = useGlassTabBarInset();

  const email = profile?.email ?? user?.email ?? '—';
  const userId = profile?.user_id ?? user?.id ?? '—';
  const role = profile?.role ?? 'authenticated';
  const signInMethod = profile?.is_google_user
    ? 'Google'
    : (profile?.provider ?? 'email').toLowerCase();

  const themeLabel =
    themePreference === 'system'
      ? 'System default'
      : themePreference === 'light'
        ? 'Light'
        : 'Dark';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarInset }}>
        <Text
          style={{
            paddingTop: 8,
            textAlign: 'center',
            fontFamily: Fonts.semibold,
            fontSize: 18,
            color: colors.title,
          }}>
          Settings
        </Text>

        {error ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <ErrorBanner message={error} />
          </View>
        ) : null}

        {loading ? (
          <LoadingState />
        ) : (
          <>
            <View style={{ alignItems: 'center', paddingBottom: 32, paddingTop: 24 }}>
              <View style={{ position: 'relative' }}>
                <View
                  style={{
                    height: 112,
                    width: 112,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 56,
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                    backgroundColor: colors.cardMuted,
                  }}>
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 36, color: colors.title }}>
                    {getInitials(email)}
                  </Text>
                </View>

                <Pressable
                  accessibilityLabel="Edit profile"
                  onPress={() => undefined}
                  style={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    height: 36,
                    width: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                    backgroundColor: colors.surface,
                  }}>
                  <AppIcon name={AppIcons.edit} size={16} color={colors.accent} />
                </Pressable>
              </View>
            </View>

            <View
              style={{
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                backgroundColor: colors.backgroundElevated,
                paddingHorizontal: 4,
                paddingBottom: 24,
                paddingTop: 16,
              }}>
              <SectionHeading title="Appearance" colors={colors} />

              <View
                style={{
                  overflow: 'hidden',
                  borderRadius: 16,
                  backgroundColor: colors.card,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                }}>
                <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ marginRight: 12, height: 36, width: 36, alignItems: 'center', justifyContent: 'center' }}>
                    <AppIcon name={AppIcons.phonePortrait} size={22} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.body }}>Theme</Text>
                    <Text style={{ marginTop: 2, fontFamily: Fonts.medium, fontSize: 16, color: colors.title }}>
                      {themeLabel}
                    </Text>
                  </View>
                </View>
                <ThemeSegmentedControl
                  value={themePreference}
                  onChange={setThemePreference}
                />
              </View>

              <SectionHeading title="Account info" colors={colors} />

              <View style={{ overflow: 'hidden', borderRadius: 16, backgroundColor: colors.card }}>
                <SettingsRow colors={colors} icon={AppIcons.mail} label="Email address" value={email} />
                <SettingsRow
                  colors={colors}
                  icon={AppIcons.idCard}
                  label="User ID"
                  value={truncateMiddle(userId, 30)}
                />
                <SettingsRow colors={colors} icon={AppIcons.shield} label="Role" value={role} />
                <SettingsRow
                  colors={colors}
                  icon={AppIcons.key}
                  label="Sign-in method"
                  value={signInMethod}
                  isLast
                />
              </View>

              <SectionHeading title="Storage & Uploads" colors={colors} />

              <View style={{ overflow: 'hidden', borderRadius: 16, backgroundColor: colors.card }}>
                <SettingsRow
                  colors={colors}
                  icon={AppIcons.cloudUpload}
                  label="Max upload size"
                  value="50 MB max"
                />
                <SettingsRow
                  colors={colors}
                  icon={AppIcons.images}
                  label="Supported formats"
                  value="JPEG, PNG, PDF"
                  isLast
                />
              </View>

              <SectionHeading title="Session" colors={colors} />

              <View style={{ overflow: 'hidden', borderRadius: 16, backgroundColor: colors.card }}>
                <SettingsRow
                  colors={colors}
                  icon={AppIcons.logOut}
                  label="Log out"
                  value="Sign out from this device"
                  valueColor={colors.danger}
                  onPress={confirmSignOut}
                  isLast
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

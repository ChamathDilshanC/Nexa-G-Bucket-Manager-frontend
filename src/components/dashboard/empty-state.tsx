import { ActivityIndicator, Text, View } from 'react-native';

import { AppIcon, type AppIconName, AppIcons } from '@/components/ui/app-icon';
import { Fonts } from '@/constants/fonts';
import { useThemeColors } from '@/contexts/theme-context';

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: AppIconName;
};

export function EmptyState({ title, description, icon = AppIcons.cube }: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View className="items-center justify-center px-6 py-12">
      <View
        style={{
          marginBottom: 16,
          height: 64,
          width: 64,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 32,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          backgroundColor: colors.cardMuted,
        }}>
        <AppIcon name={icon} size={32} color={colors.accent} />
      </View>
      <Text
        style={{
          fontFamily: Fonts.semibold,
          fontSize: 18,
          color: colors.title,
          textAlign: 'center',
        }}>
        {title}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: 14,
          color: colors.body,
          textAlign: 'center',
          marginTop: 8,
          lineHeight: 20,
        }}>
        {description}
      </Text>
    </View>
  );
}

export function LoadingState() {
  const colors = useThemeColors();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  const colors = useThemeColors();

  return (
    <View
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.35)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
      }}>
      <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: colors.danger }}>{message}</Text>
    </View>
  );
}

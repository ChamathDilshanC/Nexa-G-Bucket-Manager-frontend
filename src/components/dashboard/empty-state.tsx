import { ActivityIndicator, Text, View } from 'react-native';

import { Fonts } from '@/constants/fonts';
import { ZentraColors } from '@/constants/zentra-theme';

type EmptyStateProps = {
  title: string;
  description: string;
  emoji?: string;
};

export function EmptyState({ title, description, emoji = '📦' }: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 48,
      }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>{emoji}</Text>
      <Text
        style={{
          fontFamily: Fonts.semibold,
          fontSize: 18,
          color: ZentraColors.title,
          textAlign: 'center',
        }}>
        {title}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: 14,
          color: ZentraColors.body,
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
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
      <ActivityIndicator color={ZentraColors.accent} size="large" />
    </View>
  );
}

export function ErrorBanner({ message }: { message: string }) {
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
      <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: ZentraColors.danger }}>{message}</Text>
    </View>
  );
}

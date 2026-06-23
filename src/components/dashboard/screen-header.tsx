import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { Fonts } from '@/constants/fonts';
import { ZentraLayout, ZentraTypography } from '@/constants/zentra-theme';
import { useThemeColors } from '@/contexts/theme-context';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
};

export function ScreenHeader({ title, subtitle, onBack, rightAction }: ScreenHeaderProps) {
  const colors = useThemeColors();

  return (
    <View
      style={{
        paddingHorizontal: ZentraLayout.horizontalPadding,
        paddingTop: 8,
        paddingBottom: 16,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
              <AppIcon name="chevron-back" size={22} color={colors.title} />
            </Pressable>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 28,
                lineHeight: 34,
                color: colors.title,
              }}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: ZentraTypography.body.fontSize,
                  lineHeight: ZentraTypography.body.lineHeight,
                  color: colors.body,
                  marginTop: 4,
                }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {rightAction}
      </View>
    </View>
  );
}

type AppScreenProps = {
  children: ReactNode;
  header?: ReactNode;
};

export function AppScreen({ children, header }: AppScreenProps) {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {header}
      {children}
    </SafeAreaView>
  );
}

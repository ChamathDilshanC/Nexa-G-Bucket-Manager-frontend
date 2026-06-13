import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/fonts';
import { ZentraColors, ZentraLayout, ZentraTypography } from '@/constants/zentra-theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
};

export function ScreenHeader({ title, subtitle, onBack, rightAction }: ScreenHeaderProps) {
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
                backgroundColor: ZentraColors.card,
                borderWidth: 1,
                borderColor: ZentraColors.cardBorder,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
              <Text style={{ color: ZentraColors.title, fontSize: 18 }}>←</Text>
            </Pressable>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 28,
                lineHeight: 34,
                color: ZentraColors.title,
              }}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: ZentraTypography.body.fontSize,
                  lineHeight: ZentraTypography.body.lineHeight,
                  color: ZentraColors.body,
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
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZentraColors.background }}>
      {header}
      {children}
    </SafeAreaView>
  );
}

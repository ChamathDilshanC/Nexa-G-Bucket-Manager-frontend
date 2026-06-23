import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/fonts';
import { ZentraLayout, ZentraTypography } from '@/constants/zentra-theme';
import { useThemeColors } from '@/contexts/theme-context';

type AuthScreenLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreenLayout({ title, subtitle, children, footer }: AuthScreenLayoutProps) {
  const { height } = useWindowDimensions();
  const colors = useThemeColors();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <LinearGradient
        colors={[...colors.screenGradient]}
        locations={[...colors.screenGradientLocations]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height * colors.screenGradientHeight,
        }}
      />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow px-6 pb-8 pt-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="mb-8 flex-row items-center">
              <Image
                source={require('@/assets/NexaLogo.png')}
                style={{ width: 44, height: 44, tintColor: colors.title }}
                resizeMode="contain"
              />
              <Text
                style={{
                  fontFamily: Fonts.semibold,
                  fontSize: ZentraTypography.brand.fontSize,
                  lineHeight: ZentraTypography.brand.lineHeight,
                  color: colors.title,
                  marginLeft: 10,
                }}>
                Nexa
              </Text>
            </View>

            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: ZentraTypography.title.fontSize,
                lineHeight: ZentraTypography.title.lineHeight,
                letterSpacing: ZentraTypography.title.letterSpacing,
                color: colors.title,
              }}>
              {title}
            </Text>

            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: ZentraTypography.body.fontSize,
                lineHeight: ZentraTypography.body.lineHeight,
                color: colors.body,
                marginTop: 12,
              }}>
              {subtitle}
            </Text>

            <View className="mt-8">{children}</View>

            {footer ? <View className="mt-6">{footer}</View> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

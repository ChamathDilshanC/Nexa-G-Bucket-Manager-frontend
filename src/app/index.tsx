import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthFooterLink } from '@/components/auth/auth-footer-link';
import { Fonts } from '@/constants/fonts';
import { ZentraLayout, ZentraTypography } from '@/constants/zentra-theme';
import { useThemeColors } from '@/contexts/theme-context';

const HIGHLIGHTS = [
  'All your buckets in one dashboard.',
  'Upload, organize, and share fast.',
  'Secure storage you can trust.',
];

export default function GetStartedScreen() {
  const router = useRouter();
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
        <View className="flex-1 justify-end" style={{ paddingHorizontal: ZentraLayout.horizontalPadding, paddingBottom: 32 }}>
          <View style={{ marginLeft: -12, marginBottom: 8 }}>
            <Image
              source={require('@/assets/NexaLogo.png')}
              style={{ width: 100, height: 100, tintColor: colors.title }}
              resizeMode="contain"
            />
          </View>

          <View style={{ marginBottom: ZentraLayout.contentGap + 8 }}>
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: ZentraTypography.title.fontSize,
                lineHeight: ZentraTypography.title.lineHeight,
                letterSpacing: ZentraTypography.title.letterSpacing,
                color: colors.title,
              }}>
              Get Started
            </Text>

            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: ZentraTypography.body.fontSize,
                lineHeight: ZentraTypography.body.lineHeight,
                color: colors.body,
                marginTop: 12,
              }}>
              Welcome to Nexa G-Bucket — manage cloud storage simply and securely.
            </Text>

            <View style={{ marginTop: 14 }}>
              {HIGHLIGHTS.map((text, index) => (
                <View
                  key={text}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: index < HIGHLIGHTS.length - 1 ? 8 : 0,
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: ZentraTypography.bullet.fontSize,
                      lineHeight: ZentraTypography.bullet.lineHeight,
                      color: colors.body,
                      marginRight: 8,
                      width: 12,
                    }}>
                    •
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: Fonts.regular,
                      fontSize: ZentraTypography.bullet.fontSize,
                      lineHeight: ZentraTypography.bullet.lineHeight,
                      color: colors.body,
                    }}>
                    {text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/register')}
            className="overflow-hidden active:opacity-90"
            style={{ borderRadius: ZentraLayout.buttonRadius, marginTop: 8 }}>
            <LinearGradient
              colors={[colors.buttonStart, colors.buttonEnd]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                height: ZentraLayout.buttonHeight,
                borderRadius: ZentraLayout.buttonRadius,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: Fonts.semibold,
                  fontSize: ZentraTypography.button.fontSize,
                  lineHeight: ZentraTypography.button.lineHeight,
                  color: '#FFFFFF',
                }}>
                Get Started
              </Text>
            </LinearGradient>
          </Pressable>

          <AuthFooterLink
            text="Already have an account?"
            linkText="Sign In"
            onPress={() => router.push('/login')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

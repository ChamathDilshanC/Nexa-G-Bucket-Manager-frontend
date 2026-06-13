import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Fonts } from '@/constants/fonts';
import { ZentraColors, ZentraLayout, ZentraTypography } from '@/constants/zentra-theme';

type SignOutButtonProps = {
  onPress: () => void;
};

export function SignOutButton({ onPress }: SignOutButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <LinearGradient
        colors={['rgba(239, 68, 68, 0.22)', 'rgba(220, 38, 38, 0.28)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}>
        <Text style={styles.label}>Sign Out</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: ZentraLayout.buttonRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  pressed: {
    opacity: 0.88,
  },
  gradient: {
    height: ZentraLayout.buttonHeight,
    borderRadius: ZentraLayout.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontFamily: Fonts.semibold,
    fontSize: ZentraTypography.button.fontSize,
    lineHeight: ZentraTypography.button.lineHeight,
    color: '#FCA5A5',
  },
});

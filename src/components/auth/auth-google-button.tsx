import { AntDesign } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import { Fonts } from '@/constants/fonts';
import { ZentraLayout, ZentraTypography } from '@/constants/zentra-theme';
import { useThemeColors } from '@/contexts/theme-context';

type AuthGoogleButtonProps = {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
};

export function AuthGoogleButton({
  label = 'Continue with Google',
  onPress,
  disabled = false,
}: AuthGoogleButtonProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center justify-center active:opacity-90"
      style={{
        height: ZentraLayout.buttonHeight,
        borderRadius: ZentraLayout.buttonRadius,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        backgroundColor: colors.inputBackground,
        opacity: disabled ? 0.6 : 1,
      }}>
      <AntDesign name="google" size={18} color={colors.title} />
      <Text
        style={{
          fontFamily: Fonts.medium,
          fontSize: ZentraTypography.button.fontSize,
          lineHeight: ZentraTypography.button.lineHeight,
          color: colors.title,
          marginLeft: 10,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

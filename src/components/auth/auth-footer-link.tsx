import { Pressable, Text } from 'react-native';

import { Fonts } from '@/constants/fonts';
import { ZentraTypography } from '@/constants/zentra-theme';
import { useThemeColors } from '@/contexts/theme-context';

type AuthFooterLinkProps = {
  text: string;
  linkText: string;
  onPress: () => void;
};

export function AuthFooterLink({ text, linkText, onPress }: AuthFooterLinkProps) {
  const colors = useThemeColors();

  return (
    <Pressable onPress={onPress} className="items-center py-2 active:opacity-80">
      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: ZentraTypography.footer.fontSize,
          lineHeight: ZentraTypography.footer.lineHeight,
          color: colors.footer,
        }}>
        {text}{' '}
        <Text style={{ fontFamily: Fonts.medium, color: colors.accent }}>{linkText}</Text>
      </Text>
    </Pressable>
  );
}

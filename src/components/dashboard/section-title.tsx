import { Text, View } from 'react-native';

import { Fonts } from '@/constants/fonts';
import { useThemeColors } from '@/contexts/theme-context';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  const colors = useThemeColors();

  return (
    <View style={{ marginBottom: 14, marginTop: 2 }}>
      <Text
        style={{
          fontFamily: Fonts.semibold,
          fontSize: 16,
          lineHeight: 22,
          color: colors.title,
        }}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 12,
            lineHeight: 18,
            color: colors.muted,
            marginTop: 2,
          }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

import { Text, View } from 'react-native';

import { Fonts } from '@/constants/fonts';
import { ZentraColors } from '@/constants/zentra-theme';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <View style={{ marginBottom: 14, marginTop: 2 }}>
      <Text
        style={{
          fontFamily: Fonts.semibold,
          fontSize: 16,
          lineHeight: 22,
          color: ZentraColors.title,
        }}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 12,
            lineHeight: 18,
            color: ZentraColors.muted,
            marginTop: 2,
          }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

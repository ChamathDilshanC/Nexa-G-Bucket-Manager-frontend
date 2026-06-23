import { Text, View } from 'react-native';

import { Fonts } from '@/constants/fonts';
import { ZentraTypography } from '@/constants/zentra-theme';
import { useThemeColors } from '@/contexts/theme-context';

export function AuthDivider() {
  const colors = useThemeColors();

  return (
    <View className="my-6 flex-row items-center">
      <View className="h-px flex-1" style={{ backgroundColor: colors.inputBorder }} />
      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: ZentraTypography.footer.fontSize,
          color: colors.footer,
          marginHorizontal: 12,
        }}>
        or
      </Text>
      <View className="h-px flex-1" style={{ backgroundColor: colors.inputBorder }} />
    </View>
  );
}

import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { Fonts } from '@/constants/fonts';
import { ZentraTypography } from '@/constants/zentra-theme';
import { useThemeColors } from '@/contexts/theme-context';

type AuthInputProps = TextInputProps & {
  label: string;
};

export function AuthInput({ label, ...props }: AuthInputProps) {
  const colors = useThemeColors();

  return (
    <View className="mb-4">
      <Text
        style={{
          fontFamily: Fonts.medium,
          fontSize: ZentraTypography.body.fontSize,
          lineHeight: ZentraTypography.body.lineHeight,
          color: colors.title,
          marginBottom: 8,
        }}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.inputPlaceholder}
        {...props}
        style={[
          {
            fontFamily: Fonts.regular,
            fontSize: ZentraTypography.body.fontSize,
            lineHeight: ZentraTypography.body.lineHeight,
            color: colors.title,
            backgroundColor: colors.inputBackground,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
          },
          props.style,
        ]}
      />
    </View>
  );
}

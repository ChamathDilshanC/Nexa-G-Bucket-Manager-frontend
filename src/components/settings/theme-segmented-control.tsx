import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/fonts';
import type { ThemePreference } from '@/contexts/theme-context';
import { useThemeColors } from '@/contexts/theme-context';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

type ThemeSegmentedControlProps = {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
};

export function ThemeSegmentedControl({ value, onChange }: ThemeSegmentedControlProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.track, { backgroundColor: colors.surface }]}>
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.segment,
              selected && {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: 1,
              },
            ]}>
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 14,
                color: selected ? colors.title : colors.muted,
              }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    minHeight: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
});

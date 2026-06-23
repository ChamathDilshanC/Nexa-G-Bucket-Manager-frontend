import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Fragment } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName, AppIcons } from '@/components/ui/app-icon';
import { Fonts } from '@/constants/fonts';
import { useTheme } from '@/contexts/theme-context';

export const GLASS_TAB_BAR_HEIGHT = 64;
export const GLASS_TAB_BAR_BOTTOM_OFFSET = 14;

const TAB_GAP = 18;
const TAB_BUTTON_WIDTH = 96;
const TAB_BUTTON_HEIGHT = 48;

const TAB_ICONS: Record<string, AppIconName> = {
  index: AppIcons.cloud,
  shared: AppIcons.link,
  settings: AppIcons.settings,
};

export function useGlassTabBarInset(extra = 16) {
  const insets = useSafeAreaInsets();
  return insets.bottom + GLASS_TAB_BAR_BOTTOM_OFFSET + GLASS_TAB_BAR_HEIGHT + extra;
}

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, resolvedColorScheme } = useTheme();
  const blurTint = resolvedColorScheme === 'dark' ? 'dark' : 'light';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: insets.bottom + GLASS_TAB_BAR_BOTTOM_OFFSET }]}>
      <View style={[styles.barShell, { borderColor: colors.tabBarBorder }]}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 88 : 72}
          tint={blurTint}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.glassTint, { backgroundColor: colors.tabBarTint }]} />
        <View style={[styles.glassHighlight, { backgroundColor: colors.tabBarHighlight }]} />

        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : (options.title ?? route.name);
            const isFocused = state.index === index;
            const color = isFocused ? colors.accent : colors.body;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Fragment key={route.key}>
                {index > 0 ? <View style={styles.tabGap} /> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={({ pressed }) => [
                    styles.tabButton,
                    isFocused && {
                      backgroundColor:
                        resolvedColorScheme === 'dark'
                          ? 'rgba(47, 128, 237, 0.18)'
                          : 'rgba(37, 99, 235, 0.12)',
                      borderWidth: 1,
                      borderColor:
                        resolvedColorScheme === 'dark'
                          ? 'rgba(47, 128, 237, 0.28)'
                          : 'rgba(37, 99, 235, 0.22)',
                    },
                    pressed && styles.tabButtonPressed,
                  ]}>
                  <View style={styles.tabContent}>
                    <View style={styles.iconWrap}>
                      <AppIcon
                        name={TAB_ICONS[route.name] ?? 'ellipse-outline'}
                        size={20}
                        color={color}
                      />
                    </View>
                    <Text style={[styles.tabLabel, { color }]} numberOfLines={1} ellipsizeMode="tail">
                      {label}
                    </Text>
                  </View>
                </Pressable>
              </Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barShell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    height: GLASS_TAB_BAR_HEIGHT,
    minWidth: TAB_BUTTON_WIDTH * 3 + TAB_GAP * 2 + 24,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
      default: {},
    }),
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabGap: {
    width: TAB_GAP,
    flexShrink: 0,
  },
  tabButton: {
    width: TAB_BUTTON_WIDTH,
    height: TAB_BUTTON_HEIGHT,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  tabButtonPressed: {
    opacity: 0.82,
  },
  tabContent: {
    width: TAB_BUTTON_WIDTH - 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconWrap: {
    width: 28,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    marginTop: 2,
    maxWidth: TAB_BUTTON_WIDTH - 12,
    textAlign: 'center',
    fontFamily: Fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
      default: {},
    }),
  },
});

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Fragment } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/fonts';
import { ZentraColors } from '@/constants/zentra-theme';

export const GLASS_TAB_BAR_HEIGHT = 64;
export const GLASS_TAB_BAR_BOTTOM_OFFSET = 14;

const TAB_GAP = 28;
const TAB_BUTTON_WIDTH = 118;
const TAB_BUTTON_HEIGHT = 48;

const TAB_ICONS: Record<string, string> = {
  index: '☁️',
  settings: '⚙️',
};

export function useGlassTabBarInset(extra = 16) {
  const insets = useSafeAreaInsets();
  return insets.bottom + GLASS_TAB_BAR_BOTTOM_OFFSET + GLASS_TAB_BAR_HEIGHT + extra;
}

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: insets.bottom + GLASS_TAB_BAR_BOTTOM_OFFSET }]}>
      <View style={styles.barShell}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 88 : 72}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.glassTint} />
        <View style={styles.glassHighlight} />

        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : (options.title ?? route.name);
            const isFocused = state.index === index;
            const color = isFocused ? ZentraColors.accent : ZentraColors.body;

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
                    isFocused && styles.tabButtonActive,
                    pressed && styles.tabButtonPressed,
                  ]}>
                  <View style={styles.tabContent}>
                    <View style={styles.iconWrap}>
                      <Text style={[styles.tabIcon, { color }]}>{TAB_ICONS[route.name] ?? '•'}</Text>
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
    minWidth: TAB_BUTTON_WIDTH * 2 + TAB_GAP + 24,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
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
    backgroundColor: 'rgba(18, 18, 18, 0.42)',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
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
  tabButtonActive: {
    backgroundColor: 'rgba(47, 128, 237, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(47, 128, 237, 0.28)',
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
  tabIcon: {
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: 'center',
      },
      default: {},
    }),
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

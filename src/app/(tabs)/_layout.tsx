import { Tabs } from 'expo-router';

import { GlassTabBar } from '@/components/navigation/glass-tab-bar';
import { ZentraColors } from '@/constants/zentra-theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ZentraColors.accent,
        tabBarInactiveTintColor: ZentraColors.body,
        tabBarStyle: {
          position: 'absolute',
          height: 0,
          opacity: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        sceneStyle: {
          backgroundColor: ZentraColors.background,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}

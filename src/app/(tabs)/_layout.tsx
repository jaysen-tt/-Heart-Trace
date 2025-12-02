import { Tabs } from 'expo-router';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';
import React, { useRef, useEffect } from 'react';

const AnimatedTabIcon = ({ focused, iconName, color }: { focused: boolean; iconName: any; color: string }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      // Bouncy "Pop" Effect
      scaleAnim.setValue(0.5); // Start smaller
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3, // Low friction for bounciness
        tension: 100, // Higher tension for speed
        useNativeDriver: true,
      }).start();
    } else {
      // Reset for unfocused state
      scaleAnim.setValue(1);
    }
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Ionicons name={iconName} size={24} color={color} />
    </Animated.View>
  );
};

export default function TabsLayout() {
  const { colors, t, theme } = useSettings();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView intensity={80} tint={theme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ),
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_today'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.surfaceHighlight }]}>
              <AnimatedTabIcon focused={focused} iconName={focused ? "today" : "today-outline"} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: t('tab_journal'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.surfaceHighlight }]}>
              <AnimatedTabIcon focused={focused} iconName={focused ? "book" : "book-outline"} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tab_calendar'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.surfaceHighlight }]}>
              <AnimatedTabIcon focused={focused} iconName={focused ? "calendar" : "calendar-outline"} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('tab_stats'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.surfaceHighlight }]}>
              <AnimatedTabIcon focused={focused} iconName={focused ? "pie-chart" : "pie-chart-outline"} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

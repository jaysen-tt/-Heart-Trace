import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MoodProvider } from '../context/MoodContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { useFonts, BarlowCondensed_400Regular, BarlowCondensed_500Medium, BarlowCondensed_600SemiBold } from '@expo-google-fonts/barlow-condensed';
import * as SplashScreen from 'expo-splash-screen';

import { useEffect, useState } from 'react';
import React from 'react';
import { View, Text, Platform, ToastAndroid } from 'react-native';
import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';

import { syncWidgetData } from '../utils/WidgetSync';

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

function RootLayout() {
  const { theme, targetDate, birthDate } = useSettings();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // Sync widget data whenever settings change
  useEffect(() => {
    if (Platform.OS === 'android' && targetDate && birthDate) {
      console.log('Triggering widget sync from layout...');
      syncWidgetData(targetDate, birthDate);
    }
  }, [targetDate, birthDate]);
  
  useEffect(() => {
    if (isSplashVisible) {
       // We're ready to show our own animated splash, so hide the native one
       SplashScreen.hideAsync();
    }
  }, [isSplashVisible]);

  return (
    <SafeAreaProvider>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
      {isSplashVisible && (
        <AnimatedSplashScreen onAnimationComplete={() => setIsSplashVisible(false)} />
      )}
    </SafeAreaProvider>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: any }>{
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('Root error boundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>应用启动异常，请截图并发送给我</Text>
        </View>
      );
    }
    return this.props.children as any;
  }
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    BarlowCondensed_400Regular,
    BarlowCondensed_500Medium,
    BarlowCondensed_600SemiBold,
  });

  useEffect(() => {
    // Fonts loading should not block initial render
  }, [fontsLoaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <MoodProvider>
          <ErrorBoundary>
            <RootLayout />
          </ErrorBoundary>
        </MoodProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

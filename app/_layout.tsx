// app/_layout.tsx
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SidebarProvider } from '../contexts/SidebarContext';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useAuthStore from '@/store/authStore';
import Loading from '@/components/common/Loading';
// import { usePushNotifications } from '@/hooks/usePushNotifications';
import SplashProvider from '@/contexts/SplashProvider';
// import realtimeService from '@/services/realtimeService';

// // Set globally
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: true,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

// Auth guard component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isInitialized, initialize } = useAuthStore();
  // const { pushTokenInfo } = usePushNotifications();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    router.push('/(auth)/login/PersonalInfo');
  }, [])

  // // Initialize Firebase auth on app start
  // useEffect(() => {
  //   initialize();
  // }, [initialize]);


  // // Handle push token updates
  // useEffect(() => {
  //   if (user?._id && pushTokenInfo) {
  //     realtimeService.updateUserPushToken(user._id, {
  //       token: pushTokenInfo.token,
  //       platform: pushTokenInfo.platform,
  //       deviceId: pushTokenInfo.deviceId,
  //       updatedAt: new Date().toISOString()
  //     });
  //   }
  // }, [user?._id, pushTokenInfo]);

  useEffect(() => {
    if (!isInitialized) return; // Wait for auth to initialize
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // User is not signed in and not on auth screen, redirect to login
      console.log('Redirecting to login - no user');
      router.dismissAll();
      router.replace('/(auth)/login/Language');
    } else if (user && (inAuthGroup || segments.length as number === 0)) {
      //       // If user is signed in and on auth screen, redirect to home
      router.replace('/(auth)/login/Language');
    }
  }, [user, segments, isInitialized, router]);

  if (isLoading) {
    return <Loading />;
  }

  // if (user === null && segments[0] !== '(auth)') {
  if (segments[0] !== '(auth)') {
    return <Slot />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <SplashProvider>
        <ThemeProvider>
          <SidebarProvider
            userName="Simon"
            selectedCountry="PT"
          >
            <StatusBar style="auto" />
            <AuthGuard>
              <Slot />
            </AuthGuard>
          </SidebarProvider>
        </ThemeProvider>
      </SplashProvider>
    </GestureHandlerRootView>
  );
}
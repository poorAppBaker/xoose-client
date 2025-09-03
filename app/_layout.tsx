// app/_layout.tsx
import React, { useState } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useEffect } from 'react';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import useAuthStore from '@/store/authStore';
import Loading from '@/components/common/Loading';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useInvitationHandler } from '@/hooks/useInvitationHandler';
import SplashProvider from '@/contexts/SplashProvider';
import { useTranslation } from '@/hooks/useTranslation';

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
  // const user = useAuthStore(state => state.user);
  // const { pushTokenInfo } = usePushNotifications();
  // const { initialize, syncPushToken } = useAuthStore();
  // const { locale } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    router.replace('/(auth)/onboarding');
  }, [])

  // // Initialize auth store on first load
  // useEffect(() => {
  //   if (locale) {
  //     (async () => {
  //       await initialize(locale);
  //       setIsLoading(false);
  //     })()
  //   }
  // }, [initialize, locale]);

  // useEffect(() => {
  //   if (user?._id && pushTokenInfo) {
  //     syncPushToken(
  //       pushTokenInfo.token,
  //       pushTokenInfo.platform,
  //       pushTokenInfo.deviceId
  //     );
  //   }
  // }, [user?._id, pushTokenInfo])

  // useEffect(() => {
  //   console.log('segment', segments);
  //   const inAuthGroup = segments[0] === '(auth)';

  //   if (!isLoading) {
  //     // If user is not signed in and not on auth screen, redirect to login
  //     if (!user && !inAuthGroup) {
  //       console.log('Dismissing all routes');
  //       router.dismissAll();
  //       router.replace('/(auth)/login');
  //     } else if (user && (inAuthGroup || segments.length as number === 0)) {
  //       // If user is signed in and on auth screen, redirect to home
  //       console.log('User is authenticated but he/she is in auth page:', user)
  //       if (user.role === 'manager') {
  //         console.log('here: dashboard')
  //         router.replace('/(tabs)/dashboard');
  //       } else {
  //         console.log('here: worksites')
  //         router.replace('/(tabs)/worksites');
  //       }
  //     }
  //   }
  // }, [user?._id, segments, isLoading, router]);

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
    <SplashProvider>
      <ThemeProvider>
        <StatusBar style="auto" />
        <AuthGuard>
          <Slot />
        </AuthGuard>
      </ThemeProvider>
    </SplashProvider>
  );
}
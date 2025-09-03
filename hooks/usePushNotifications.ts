// hooks/usePushNotifications.ts
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { registerForPushNotificationsAsync } from '@/services/registerForPushNotificationsAsync';

import { PushTokenInfo } from '@/types/auth';

export function usePushNotifications() {
  const [pushTokenInfo, setPushTokenInfo] = useState<PushTokenInfo | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Request permission & get token with device info
    registerForPushNotificationsAsync().then((tokenInfo: PushTokenInfo | undefined) => {
      if (tokenInfo) setPushTokenInfo(tokenInfo);
    });

    // Foreground notification handler
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // When user taps the notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tap response:', response);
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return {
    pushTokenInfo,
    expoPushToken: pushTokenInfo?.token, // For backward compatibility
    notification
  };
}
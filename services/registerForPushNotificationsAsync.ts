// services/registerForPushNotificationsAsync.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { PushTokenInfo } from '@/types/auth';

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

export async function registerForPushNotificationsAsync(): Promise<PushTokenInfo | undefined> {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      
      // console.log('Push token:', pushTokenString);
      
      // Get device information
      const deviceId = await getDeviceId();
      const platform = Platform.OS as 'ios' | 'android';
      const deviceName = Device.deviceName || "";
      const deviceModel = Device.modelName || "";
      
      const tokenInfo: PushTokenInfo = {
        token: pushTokenString,
        platform,
        deviceId,
        deviceName,
        deviceModel
      };
      
      // console.log('Device info:', tokenInfo);
      
      return tokenInfo;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

// Helper function to get unique device ID
async function getDeviceId(): Promise<string> {
  try {
    if (Platform.OS === 'ios') {
      // For iOS, use identifierForVendor or create a unique ID
      const iosId = await Application.getIosIdForVendorAsync();
      if (iosId) {
        return iosId;
      }
    } else if (Platform.OS === 'android') {
      // For Android, use Android ID
      const androidId = Application.getAndroidId();
      if (androidId) {
        return androidId;
      }
    }
    
    // Fallback: create a unique ID based on device info
    const deviceInfo = `${Device.brand}-${Device.modelName}-${Device.osName}-${Device.osVersion}`;
    return deviceInfo.replace(/\s+/g, '-').toLowerCase();
  } catch (error) {
    console.warn('Error getting device ID:', error);
    // Ultimate fallback
    return `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Configure Android channel
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}
import 'dotenv/config';

export default {
  expo: {
    name: "Xoose",
    slug: "xoose-client",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "xooseclient",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,
    notification: {
      "icon": "./assets/images/notification-icon.png",
      "color": "#FD8B19"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.xoose.client",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        },
        // Camera permission (photo only)
        NSCameraUsageDescription: "Xoose needs access to your camera to take photos for your focus sessions and profile.",
        // Photo library permissions
        NSPhotoLibraryUsageDescription: "Xoose needs access to your photo library to select images for your focus sessions and profile.",
        // Document picker permission
        NSDocumentsFolderUsageDescription: "Xoose needs access to your documents to upload files for your focus sessions.",
        // iCloud documents permission
        NSUbiquitousContainers: {
          "iCloud.com.xoose.client": {
            NSUbiquitousContainerIsDocumentScopePublic: true,
            NSUbiquitousContainerName: "Xoose Documents",
            NSUbiquitousContainerSupportedFolderLevels: "Any"
          }
        },
        // Background modes for notifications
        UIBackgroundModes: ["fetch", "remote-notification"]
      },
      // Associated domains for deep linking
      associatedDomains: [
        "applinks:app.xooseapp.com"
      ]
    },
    android: {
      package: "com.xoose.client",
      usesCleartextTraffic: true,
      // Permissions for Android
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES",
        "READ_MEDIA_DOCUMENTS",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED",
        "SCHEDULE_EXACT_ALARM",
        // Notification permissions (Android 13+)
        "POST_NOTIFICATIONS"
      ],
      intentFilters: [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "app.xooseapp.com",
              "pathPrefix": "/"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        },
        // Deep linking with custom scheme
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "xooseclient"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      "googleServicesFile": "./google-services.json"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-localization",
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          },
          "ios": {
            "NSAppTransportSecurity": {
              "NSAllowsArbitraryLoads": true
            }
          }
        }
      ],
      // Image picker plugin (you have this installed)
      [
        "expo-image-picker",
        {
          "photosPermission": "The app needs access to your photos to let you select images for your profile and focus sessions.",
          "cameraPermission": "The app needs access to your camera to let you take photos for your profile and focus sessions."
        }
      ],
      // Document picker plugin (you have this installed)
      [
        "expo-document-picker",
        {
          "iCloudContainerEnvironment": "Production"
        }
      ],
      // Notifications plugin (you have this installed)
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#FD8B19",
          "defaultChannel": "default"
        }
      ],
      // // firebase
      // "@react-native-firebase/app",
      // [
      //   "@react-native-firebase/auth",
      //   {
      //     "android_client_id": process.env.EXPO_PUBLIC_FIREBASE_ANDROID_CLIENT_ID,
      //     "ios_client_id": process.env.EXPO_PUBLIC_FIREBASE_IOS_CLIENT_ID
      //   }
      // ],
      // "@react-native-firebase/firestore",
      // "@react-native-firebase/storage",
      // [
      //   "@react-native-firebase/messaging",
      //   {
      //     "ios_foreground_presentation_options": ["badge", "sound", "banner", "list"]
      //   }
      // ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "0ed46fb4-8b52-4450-84c0-ef27e18e6778"
      },
      API_URL: process.env.EXPO_PUBLIC_API_URL,
      APP_URL: process.env.EXPO_PUBLIC_APP_URL,
      FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      FIREBASE_DATABASE_URL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
      FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY
    }
  }
};

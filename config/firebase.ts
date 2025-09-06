// config/firebase.ts - React Native Firebase configuration
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

// React Native Firebase automatically initializes with the configuration
// from google-services.json (Android) and GoogleService-Info.plist (iOS)
// No manual initialization needed!

// Export the Firebase services
export { auth, database, firestore, storage, messaging };

// For backward compatibility, also export as 'app' (though it's not needed in RN Firebase)
export const app = null; // React Native Firebase doesn't expose the app instance directly
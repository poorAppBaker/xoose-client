// config/firebase.ts (Updated with environment variables)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Soft-validate required config values to avoid crashing the app on startup
const requiredConfigKeys = [
  'apiKey',
  'authDomain',
  'databaseURL',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

let app;
let auth;
let database;
let firestore;

try {
  const missing = requiredConfigKeys.filter((key) => !firebaseConfig[key]);
  if (missing.length > 0) {
    console.warn(
      `Firebase config missing keys: ${missing.join(', ')}. The app will start, but Firebase features will be disabled until env vars are set.`
    );
  }

  app = initializeApp(firebaseConfig as any);
  auth = getAuth(app);
  database = getDatabase(app);
  firestore = getFirestore(app);
} catch (e) {
  console.error('Failed to initialize Firebase. Features depending on Firebase will not work.', e);
}

export { app, auth, database, firestore };
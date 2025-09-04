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

// Validate that all required config values are present
const requiredConfigKeys = [
  'apiKey',
  'authDomain', 
  'databaseURL',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

for (const key of requiredConfigKeys) {
  if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
    throw new Error(`Missing required Firebase configuration: ${key}`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Realtime Database
const database = getDatabase(app);

// Initialize Firestore (optional)
const firestore = getFirestore(app);

export { app, auth, database, firestore };
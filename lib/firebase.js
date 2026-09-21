import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Without keys the app still runs; it just stays local-only instead of crashing on boot.
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let app = null;
let auth = null;
let db = null;

function ensureApp() {
  if (!isFirebaseConfigured) return null;
  if (!app) app = getApps().length ? getApp() : initializeApp(config);
  return app;
}

export function getFirebaseAuth() {
  if (!isFirebaseConfigured) return null;
  if (auth) return auth;
  const instance = ensureApp();

  // Metro often resolves firebase/auth to the React Native build even on web. Persist with
  // AsyncStorage everywhere it exists; otherwise use IndexedDB on web.
  const reactNativePersistence = firebaseAuth.getReactNativePersistence;
  const webPersistence = firebaseAuth.indexedDBLocalPersistence || firebaseAuth.browserLocalPersistence;
  try {
    if (typeof reactNativePersistence === 'function') {
      auth = firebaseAuth.initializeAuth(instance, {
        persistence: reactNativePersistence(AsyncStorage),
      });
    } else if (Platform.OS === 'web' && webPersistence) {
      auth = firebaseAuth.initializeAuth(instance, { persistence: webPersistence });
    } else {
      auth = firebaseAuth.getAuth(instance);
    }
  } catch {
    // initializeAuth throws if it already ran (fast refresh), so reuse the existing instance.
    auth = firebaseAuth.getAuth(instance);
  }
  return auth;
}

export function getDb() {
  if (!isFirebaseConfigured) return null;
  if (db) return db;
  const instance = ensureApp();
  try {
    // React Native's networking stack does not handle Firestore's streaming transport
    // reliably, so force long polling off the web.
    db = initializeFirestore(instance, Platform.OS === 'web' ? {} : { experimentalForceLongPolling: true });
  } catch {
    db = getFirestore(instance);
  }
  return db;
}

export const missingFirebaseKeys = Object.entries(config)
  .filter(([, value]) => !value)
  .map(([key]) => key);

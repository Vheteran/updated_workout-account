import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateAuthProfile,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured, missingFirebaseKeys } from '../lib/firebase';

const GUEST_KEY = 'workoutapp.guest.v1';

const MESSAGES = {
  'auth/invalid-email': 'That email address is not valid.',
  'auth/missing-password': 'Enter your password.',
  'auth/weak-password': 'Passwords need at least 6 characters.',
  'auth/email-already-in-use': 'That email already has an account. Try signing in instead.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'No account with that email yet.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
  'auth/network-request-failed': 'Network problem. Check your connection and retry.',
  'auth/operation-not-allowed':
    'Email/Password is still off in Firebase. Open Authentication → Sign-in method → Email/Password → Enable, then try again.',
  'auth/configuration-not-found':
    'Authentication is not turned on for this Firebase project. Open Authentication in the console, click Get started, then enable Email/Password.',
  'auth/unauthorized-domain':
    'This address is not an authorized domain. In Firebase go to Authentication → Settings → Authorized domains and add localhost and 127.0.0.1.',
  'auth/api-key-not-valid': 'The Firebase API key in .env is not valid. Copy it again from Project settings.',
  'auth/invalid-api-key': 'The Firebase API key in .env is not valid. Copy it again from Project settings.',
};

function friendlyError(error) {
  if (!error) return 'Something went wrong.';
  console.warn('Auth error', error.code || '', error.message || error);
  return MESSAGES[error.code] || error.message?.replace('Firebase: ', '') || 'Something went wrong.';
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(GUEST_KEY)
      .then((value) => {
        if (active && value === 'true') setGuest(true);
      })
      .catch(() => {})
      .finally(() => {
        if (!isFirebaseConfigured && active) setAuthReady(true);
      });

    if (!isFirebaseConfigured) return () => {
      active = false;
    };

    // If Firebase cannot answer (bad keys, no network on a cold start), fall through to the
    // sign-in screen instead of leaving the user on a spinner forever.
    const failsafe = setTimeout(() => {
      if (active) setAuthReady(true);
    }, 8000);

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      if (!active) return;
      setUser(nextUser || null);
      setAuthReady(true);
    });

    return () => {
      active = false;
      clearTimeout(failsafe);
      unsubscribe();
    };
  }, []);

  const run = useCallback(async (action) => {
    setBusy(true);
    try {
      await action();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: friendlyError(error) };
    } finally {
      setBusy(false);
    }
  }, []);

  const signUp = useCallback(
    ({ email, password, name }) =>
      run(async () => {
        const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
        try {
          if (name?.trim()) await updateAuthProfile(credential.user, { displayName: name.trim() });
        } catch {}
        await AsyncStorage.removeItem(GUEST_KEY);
        setGuest(false);
        setUser(credential.user);
      }),
    [run]
  );

  const signIn = useCallback(
    ({ email, password }) =>
      run(async () => {
        const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
        await AsyncStorage.removeItem(GUEST_KEY);
        setGuest(false);
        setUser(credential.user);
      }),
    [run]
  );

  const resetPassword = useCallback(
    (email) => run(() => sendPasswordResetEmail(getFirebaseAuth(), email.trim())),
    [run]
  );

  const signOut = useCallback(
    () =>
      run(async () => {
        await firebaseSignOut(getFirebaseAuth());
        await AsyncStorage.removeItem(GUEST_KEY);
        setGuest(false);
      }),
    [run]
  );

  const continueAsGuest = useCallback(async () => {
    await AsyncStorage.setItem(GUEST_KEY, 'true');
    setGuest(true);
  }, []);

  const value = useMemo(
    () => ({
      user,
      uid: user?.uid || null,
      email: user?.email || null,
      displayName: user?.displayName || null,
      guest,
      authReady,
      busy,
      authAvailable: isFirebaseConfigured,
      missingFirebaseKeys,
      signUp,
      signIn,
      signOut,
      resetPassword,
      continueAsGuest,
    }),
    [user, guest, authReady, busy, signUp, signIn, signOut, resetPassword, continueAsGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

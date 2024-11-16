import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with retry logic
const initializeFirebase = () => {
  try {
    const app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
    return app;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

const app = initializeFirebase();

// Initialize services with error handling
export const auth = getAuth(app);
export const db = getFirestore(app);
export let analytics;

try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Analytics initialization failed:', error);
  analytics = null;
}

// Set persistence with error handling
try {
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log('Auth persistence set successfully'))
    .catch(error => console.error('Error setting auth persistence:', error));

  // Enable offline persistence for Firestore
  enableIndexedDbPersistence(db)
    .then(() => console.log('Firestore offline persistence enabled'))
    .catch(error => {
      if (error.code === 'failed-precondition') {
        console.warn('Firestore persistence failed - multiple tabs open');
      } else if (error.code === 'unimplemented') {
        console.warn('Firestore persistence not available in this browser');
      }
    });
} catch (error) {
  console.error('Error setting up Firebase services:', error);
}

// Listen for auth state changes with error handling
auth.onAuthStateChanged((user) => {
  if (user) {
    user.getIdToken(true)
      .catch(error => console.error('Error refreshing token:', error));
  }
}, error => console.error('Auth state change error:', error));
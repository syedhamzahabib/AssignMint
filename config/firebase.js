// config/firebase.js - Fixed version with proper mock configuration
// Firebase configuration and initialization

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// FIXED: Mock Firebase configuration for development
// Replace with your actual Firebase config in production
const firebaseConfig = {
  apiKey: "mock-api-key-for-development",
  authDomain: "assignmint-demo.firebaseapp.com",
  projectId: "assignmint-demo",
  storageBucket: "assignmint-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:mock-app-id-development"
};

// FIXED: Initialize Firebase with error handling
let app;
let db;
let auth;
let storage;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');

  // Initialize Firestore
  db = getFirestore(app);
  console.log('✅ Firestore initialized');

  // Initialize Auth
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized');

  // Initialize Storage
  storage = getStorage(app);
  console.log('✅ Firebase Storage initialized');

} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  
  // Fallback: Create mock instances to prevent app crashes
  console.log('🔧 Creating mock Firebase instances...');
  
  // Create minimal mock implementations
  db = {
    _type: 'mock-firestore',
    collection: () => ({
      add: () => Promise.resolve({ id: 'mock-doc-id' }),
      doc: () => ({
        get: () => Promise.resolve({ exists: false, data: () => null }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve(),
      }),
      where: () => ({ get: () => Promise.resolve({ docs: [] }) }),
      orderBy: () => ({ get: () => Promise.resolve({ docs: [] }) }),
      limit: () => ({ get: () => Promise.resolve({ docs: [] }) }),
    }),
  };
  
  auth = {
    _type: 'mock-auth',
    currentUser: null,
    signInAnonymously: () => Promise.resolve({ user: { uid: 'mock-user' } }),
    signOut: () => Promise.resolve(),
    onAuthStateChanged: () => () => {}, // Returns unsubscribe function
  };
  
  storage = {
    _type: 'mock-storage',
    ref: () => ({
      put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } }),
      getDownloadURL: () => Promise.resolve('mock-url'),
    }),
  };
}

// ENHANCED: Development emulator setup with better error handling
if (__DEV__ && typeof window !== 'undefined') {
  console.log('🔧 Development mode detected - checking for emulators...');
  
  // Only connect to emulators if Firebase was properly initialized
  if (app && db && auth && storage) {
    try {
      // Check if emulators are already connected
      let emulatorsConnected = false;
      
      // Firestore emulator
      try {
        if (!db._delegate?._settings?.host?.includes('localhost')) {
          connectFirestoreEmulator(db, 'localhost', 8080);
          console.log('🔥 Connected to Firestore emulator on localhost:8080');
          emulatorsConnected = true;
        }
      } catch (error) {
        console.log('⚠️ Firestore emulator not available or already connected');
      }
      
      // Auth emulator
      try {
        if (!auth.config?.emulator) {
          connectAuthEmulator(auth, 'http://localhost:9099');
          console.log('🔥 Connected to Auth emulator on localhost:9099');
          emulatorsConnected = true;
        }
      } catch (error) {
        console.log('⚠️ Auth emulator not available or already connected');
      }
      
      // Storage emulator
      try {
        if (!storage._location?.bucket?.includes('localhost')) {
          connectStorageEmulator(storage, 'localhost', 9199);
          console.log('🔥 Connected to Storage emulator on localhost:9199');
          emulatorsConnected = true;
        }
      } catch (error) {
        console.log('⚠️ Storage emulator not available or already connected');
      }
      
      if (emulatorsConnected) {
        console.log('✅ Firebase emulators connected for development');
      } else {
        console.log('📱 Using Firebase production endpoints (emulators already connected or unavailable)');
      }
      
    } catch (error) {
      console.log('⚠️ Firebase emulators not available:', error.message);
      console.log('📱 Falling back to production Firebase endpoints');
    }
  } else {
    console.log('⚠️ Firebase not properly initialized - skipping emulator setup');
  }
} else {
  console.log('🚀 Production mode - using Firebase production endpoints');
}

// ENHANCED: Export with connection status
export { db, auth, storage };

// Export connection status for debugging
export const getFirebaseStatus = () => {
  return {
    isInitialized: !!app,
    isMocked: db?._type === 'mock-firestore',
    config: {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    },
    services: {
      firestore: !!db,
      auth: !!auth,
      storage: !!storage,
    }
  };
};

// Export app for cases where it's needed
export default app;

// ENHANCED: Development helper function
export const logFirebaseStatus = () => {
  if (__DEV__) {
    const status = getFirebaseStatus();
    console.log('🔥 Firebase Status:', status);
    
    if (status.isMocked) {
      console.log('⚠️ WARNING: Using mock Firebase services - data will not persist');
    }
  }
};

// Auto-log status in development
if (__DEV__) {
  setTimeout(() => {
    logFirebaseStatus();
  }, 1000);
}
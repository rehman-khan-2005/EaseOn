import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence, indexedDBLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
  // This will be filled in during setup — see README Step 2
  apiKey: "AIzaSyAkeEJoy_HPb6kWdVzeYgAsddlJFVnHn2A",
  authDomain: "easeon-380.firebaseapp.com",
  projectId: "easeon-380",
  storageBucket: "easeon-380.firebasestorage.app",
  messagingSenderId: "1030514505302",
  appId: "1:1030514505302:web:d55bb57b7baa2154eaedf7",
};

const app = initializeApp(firebaseConfig);

// Use browserLocalPersistence for Capacitor (iOS WKWebView can't use indexedDB reliably)
let auth;
const isCapacitor = typeof window !== "undefined" && window.Capacitor;
try {
  if (isCapacitor) {
    auth = initializeAuth(app, { persistence: browserLocalPersistence });
  } else {
    auth = getAuth(app);
  }
} catch (e) {
  // If already initialized, just get the existing instance
  auth = getAuth(app);
}

const googleProvider = new GoogleAuthProvider();

// FCM — disabled on mobile, only used on web
let messaging = null;
let getFcmToken = null;
let onMessage = null;

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, googleProvider, signInWithPopup, sendPasswordResetEmail, messaging, getFcmToken, onMessage };

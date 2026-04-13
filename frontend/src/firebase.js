import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";

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
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// FCM — only works in regular browsers, not Capacitor/native webviews
let messaging = null;
let getFcmToken = null;
let onMessage = null;

const isNativeApp = typeof window !== "undefined" && (window.Capacitor || navigator.userAgent.includes("CapacitorHttp"));
const hasServiceWorker = typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window;

// Lazy-load FCM for supported environments only
const initFcm = async () => {
  if (isNativeApp || !hasServiceWorker) return;
  try {
    const fcm = await import("firebase/messaging");
    messaging = fcm.getMessaging(app);
    getFcmToken = fcm.getToken;
    onMessage = fcm.onMessage;
  } catch (e) { console.log("FCM not available:", e.message); }
};
initFcm();

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, googleProvider, signInWithPopup, sendPasswordResetEmail, messaging, getFcmToken, onMessage };

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { getMessaging, getToken as getFcmToken, onMessage } from "firebase/messaging";

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

// FCM — may fail on unsupported browsers or mobile webviews
let messaging = null;
try { messaging = getMessaging(app); } catch (e) { console.log("FCM not supported in this environment"); }

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, googleProvider, signInWithPopup, sendPasswordResetEmail, messaging, getFcmToken, onMessage };

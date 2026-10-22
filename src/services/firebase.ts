// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC-MNZ92aqcewIjchaNQCtFMOVT65-x0pA",
  authDomain: "plant-ai-bd4a4.firebaseapp.com",
  projectId: "plant-ai-bd4a4",
  storageBucket: "plant-ai-bd4a4.firebasestorage.app",
  messagingSenderId: "1778306162",
  appId: "1:1778306162:web:7fe13d0b6d9b9a3a5946eb",
  measurementId: "G-D4VX401WF9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally (safely works across client/browser environments)
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => null) 
  : null;

// ── Firestore User Persistence ──────────────────────────────────────────────

/**
 * Save a new user profile document to Firestore under /users/{uid}.
 * Uses setDoc with merge:true so it won't overwrite existing fields.
 */
export async function saveUserToFirestore(uid: string, userData: {
  name?: string;
  email?: string;
  avatar?: string;
  gardenType?: string;
  experienceLevel?: string;
  [key: string]: any;
}): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log('[Firebase] User details saved to Firestore:', uid);
  } catch (error) {
    console.error('[Firebase] Failed to save user to Firestore:', error);
  }
}

/**
 * Update specific fields of an existing user document in Firestore.
 */
export async function updateUserInFirestore(uid: string, updates: Record<string, any>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log('[Firebase] User details updated in Firestore:', uid);
  } catch (error) {
    console.error('[Firebase] Failed to update user in Firestore:', error);
  }
}

/**
 * Fetch a user profile document from Firestore.
 */
export async function getUserFromFirestore(uid: string): Promise<Record<string, any> | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (error) {
    console.error('[Firebase] Failed to fetch user from Firestore:', error);
    return null;
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateFirebaseProfile,
  firebaseSignOut,
  onAuthStateChanged
};

export default app;

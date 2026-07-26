import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Publishable Firebase web config (safe for client bundle).
export const firebaseConfig = {
  apiKey: "AIzaSyCuewdN18yFhikmd2b7HsdN7ZX4jl3J3nU",
  authDomain: "aisle-spy.firebaseapp.com",
  projectId: "aisle-spy",
  storageBucket: "aisle-spy.firebasestorage.app",
  messagingSenderId: "705527015503",
  appId: "1:705527015503:web:5ecdd565bef73543a0623a",
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

export function getFirebaseApp(): FirebaseApp {
  if (!isBrowser()) throw new Error("Firebase can only be used in the browser");
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}

export function getStorageBucket(): FirebaseStorage {
  if (!storageInstance) storageInstance = getStorage(getFirebaseApp());
  return storageInstance;
}

export const googleProvider = new GoogleAuthProvider();
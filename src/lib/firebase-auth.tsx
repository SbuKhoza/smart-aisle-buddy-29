import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as fbUpdateProfile,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User as FbUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getDb, googleProvider } from "./firebase";
import type { Profile } from "@/models";

interface AuthContextValue {
  ready: boolean;
  user: FbUser | null;
  profile: Profile | null;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

async function loadProfile(uid: string): Promise<Profile | null> {
  const snap = await getDoc(doc(getDb(), "profiles", uid));
  return snap.exists() ? (snap.data() as Profile) : null;
}

async function ensureUserDoc(u: FbUser, firstName?: string, lastName?: string) {
  const db = getDb();
  const userRef = doc(db, "users", u.uid);
  const existing = await getDoc(userRef);
  const [fn, ...rest] = (u.displayName ?? "").split(" ");
  if (!existing.exists()) {
    await setDoc(userRef, {
      id: u.uid,
      email: u.email,
      firstName: firstName ?? fn ?? "",
      lastName: lastName ?? rest.join(" ") ?? "",
      emailVerified: u.emailVerified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  const profileRef = doc(db, "profiles", u.uid);
  const profSnap = await getDoc(profileRef);
  if (!profSnap.exists()) {
    const initial: Profile = {
      userId: u.uid,
      firstName: firstName ?? fn ?? "",
      lastName: lastName ?? rest.join(" ") ?? "",
      photoURL: u.photoURL ?? undefined,
      country: "ZA",
      favouriteStores: [],
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(profileRef, initial);
  }
  const settingsRef = doc(db, "settings", u.uid);
  const settingsSnap = await getDoc(settingsRef);
  if (!settingsSnap.exists()) {
    await setDoc(settingsRef, {
      userId: u.uid,
      notifications: {
        promotions: true,
        priceDrops: true,
        weeklyDigest: false,
        push: true,
        email: true,
      },
      location: { enabled: false },
      privacy: { analytics: true, crashReports: true, shareUsage: false },
      theme: "system",
      language: "en",
    });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<FbUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          await ensureUserDoc(u);
          setProfile(await loadProfile(u.uid));
        } catch (err) {
          console.error("[auth] profile hydrate failed", err);
        }
      } else {
        setProfile(null);
      }
      setReady(true);
    });
    return () => unsub();
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    setProfile(await loadProfile(user.uid));
  };

  const value: AuthContextValue = {
    ready,
    user,
    profile,
    refreshProfile,
    async register({ firstName, lastName, email, password }) {
      const auth = getFirebaseAuth();
      await setPersistence(auth, browserLocalPersistence);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await fbUpdateProfile(cred.user, { displayName: `${firstName} ${lastName}` });
      await ensureUserDoc(cred.user, firstName, lastName);
      try {
        await sendEmailVerification(cred.user);
      } catch (err) {
        console.warn("[auth] verification email failed", err);
      }
      setProfile(await loadProfile(cred.user.uid));
    },
    async login(email, password, remember) {
      const auth = getFirebaseAuth();
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence,
      );
      await signInWithEmailAndPassword(auth, email, password);
    },
    async loginWithGoogle() {
      const auth = getFirebaseAuth();
      await setPersistence(auth, browserLocalPersistence);
      const cred = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(cred.user);
    },
    async logout() {
      await fbSignOut(getFirebaseAuth());
    },
    async resetPassword(email) {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
    },
    async saveProfile(updates) {
      if (!user) throw new Error("Not signed in");
      const ref = doc(getDb(), "profiles", user.uid);
      const merged: Profile = {
        ...(profile as Profile),
        ...updates,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(ref, merged, { merge: true });
      setProfile(merged);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
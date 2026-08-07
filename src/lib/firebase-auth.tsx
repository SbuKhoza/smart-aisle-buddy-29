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
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  getAdditionalUserInfo,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  type User,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  getFirebaseAuth,
  getDb,
  googleProvider,
} from "./firebase";

import type { Profile } from "@/models";

interface AuthContextValue {
  ready: boolean;
  user: User | null;
  profile: Profile | null;

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;

  login: (
    email: string,
    password: string,
    remember: boolean
  ) => Promise<void>;

  loginWithGoogle: (opts?: { allowCreate?: boolean }) => Promise<void>;

  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;

  logout: () => Promise<void>;

  resetPassword: (email: string) => Promise<void>;

  refreshProfile: () => Promise<void>;

  saveProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}

async function loadProfile(uid: string): Promise<Profile |null> {
  const ref = doc(getDb(), "profiles", uid);

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    console.warn("Profile not found:", uid);
    return null;
  }

  return snap.data() as Profile;
}

async function ensureUserDoc(
  user: User,
  firstName?: string,
  lastName?: string
) {
  const db = getDb();

  const [displayFirst = "", ...rest] = (user.displayName ?? "").split(" ");

  const first = firstName ?? displayFirst;
  const last = lastName ?? rest.join(" ");

  // USERS

  const userRef = doc(db, "users", user.uid);

  if (!(await getDoc(userRef)).exists()) {
    await setDoc(userRef, {
      id: user.uid,
      email: user.email,
      firstName: first,
      lastName: last,
      emailVerified: user.emailVerified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("Created users document");
  }

  // PROFILE

  const profileRef = doc(db, "profiles", user.uid);

  if (!(await getDoc(profileRef)).exists()) {
    const profile: Profile = {
      userId: user.uid,
      firstName: first,
      lastName: last,
      photoURL: user.photoURL ?? undefined,

      country: "ZA",
      favouriteStores: [],

      onboardingComplete: false,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(profileRef, profile);

    console.log("Created profile");
  }

  // SETTINGS

  const settingsRef = doc(db, "settings", user.uid);

  if (!(await getDoc(settingsRef)).exists()) {
    await setDoc(settingsRef, {
      userId: user.uid,

      notifications: {
        promotions: true,
        priceDrops: true,
        weeklyDigest: false,
        push: true,
        email: true,
      },

      location: {
        enabled: false,
      },

      privacy: {
        analytics: true,
        crashReports: true,
        shareUsage: false,
      },

      theme: "system",
      language: "en",
    });

    console.log("Created settings");
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();

    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setReady(true);
        return;
      }

      try {
        await ensureUserDoc(firebaseUser);

        const p = await loadProfile(firebaseUser.uid);

        setProfile(p);
      } catch (err) {
        console.error("Profile hydration failed", err);
      }

      setReady(true);
    });
  }, []);

  async function refreshProfile() {
    if (!user) return;

    const p = await loadProfile(user.uid);

    setProfile(p);
  }

  async function register({
    firstName,
    lastName,
    email,
    password,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const auth = getFirebaseAuth();

    await setPersistence(auth, browserLocalPersistence);

    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(cred.user, {
      displayName: `${firstName} ${lastName}`,
    });

    await ensureUserDoc(
      cred.user,
      firstName,
      lastName
    );

    await setDoc(
      doc(getDb(), "users", cred.user.uid),
      {
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: "1.0",
      },
      { merge: true }
    );

    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      console.warn(e);
    }

    const p = await loadProfile(cred.user.uid);

    setUser(cred.user);
    setProfile(p);
  }

  async function login(
    email: string,
    password: string,
    remember: boolean
  ) {
    const auth = getFirebaseAuth();

    await setPersistence(
      auth,
      remember
        ? browserLocalPersistence
        : browserSessionPersistence
    );

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
  }

  async function loginWithGoogle(opts?: { allowCreate?: boolean }) {
    const auth = getFirebaseAuth();

    await setPersistence(
      auth,
      browserLocalPersistence
    );

    const cred = await signInWithPopup(
      auth,
      googleProvider
    );

    const isNewUser = getAdditionalUserInfo(cred)?.isNewUser ?? false;

    if (isNewUser && !opts?.allowCreate) {
      // Login page is for existing users only — undo the accidental signup.
      try {
        await deleteUser(cred.user);
      } catch {
        await signOut(auth);
      }

      throw new Error(
        "No AISLE SPY account found for that Google account. Please create an account first."
      );
    }

    await ensureUserDoc(cred.user);

    if (isNewUser) {
      await setDoc(
        doc(getDb(), "users", cred.user.uid),
        {
          termsAcceptedAt: new Date().toISOString(),
          termsVersion: "1.0",
        },
        { merge: true }
      );
    }

    const p = await loadProfile(cred.user.uid);

    setUser(cred.user);
    setProfile(p);
  }

  async function changePassword(
    currentPassword: string,
    newPassword: string
  ) {
    const auth = getFirebaseAuth();
    const current = auth.currentUser;

    if (!current) throw new Error("Not signed in");

    const hasPassword = current.providerData.some(
      (p) => p.providerId === "password"
    );

    if (hasPassword) {
      if (!current.email) throw new Error("No email on this account");

      await reauthenticateWithCredential(
        current,
        EmailAuthProvider.credential(current.email, currentPassword)
      );
    } else {
      await reauthenticateWithPopup(current, googleProvider);
    }

    await updatePassword(current, newPassword);
  }

  async function logout() {
    await signOut(getFirebaseAuth());
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(
      getFirebaseAuth(),
      email
    );
  }

  async function saveProfile(
    updates: Partial<Profile>
  ) {
    if (!user) {
      throw new Error("Not signed in");
    }

    const ref = doc(
      getDb(),
      "profiles",
      user.uid
    );

    const merged: Profile = {
      ...(profile as Profile),
      ...updates,

      userId: user.uid,

      updatedAt: new Date().toISOString(),
    };

    // Firestore rejects `undefined` values — strip them before writing.
    const payload = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== undefined),
    );

    await setDoc(ref, payload, {
      merge: true,
    });

    setProfile(merged);
  }

  return (
    <AuthContext.Provider
      value={{
        ready,
        user,
        profile,
        register,
        login,
        loginWithGoogle,
        changePassword,
        logout,
        resetPassword,
        refreshProfile,
        saveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
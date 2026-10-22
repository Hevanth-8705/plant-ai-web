import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/index.ts';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../services/api.ts';
import { 
  auth as firebaseAuth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateFirebaseProfile,
  firebaseSignOut,
  onAuthStateChanged,
  saveUserToFirestore,
  updateUserInFirestore
} from '../services/firebase.ts';

interface AuthContextType {
  user: User | null;
  firebaseUser: any | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; gardenType?: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginWithFirebase: (credentials: { email: string; password: string }) => Promise<void>;
  registerWithFirebase: (data: { name: string; email: string; password: string; gardenType?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.auth.getMe();
      if (res && res.user) {
        setUser(res.user);
      } else {
        removeStoredToken();
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('User session check unauthenticated:', err);
      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    // Listen to Firebase Auth state persistence
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email && !getStoredToken()) {
        try {
          const res = await api.auth.firebaseSync({
            email: fbUser.email,
            name: fbUser.displayName || undefined,
            avatar: fbUser.photoURL || undefined,
            firebaseUid: fbUser.uid,
          });
          setStoredToken(res.token);
          setToken(res.token);
          setUser(res.user);

          // ✅ Persist user details to Firestore
          await saveUserToFirestore(fbUser.uid, {
            name: fbUser.displayName || fbUser.email.split('@')[0],
            email: fbUser.email,
            avatar: fbUser.photoURL || '',
            provider: 'firebase_auto_sync',
          });
        } catch (err) {
          console.error('Failed auto-sync on Firebase auth change:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.auth.login(credentials);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string; gardenType?: string }) => {
    const res = await api.auth.register(data);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const fbUser = result.user;
    if (!fbUser.email) throw new Error('No email associated with Google account.');

    const res = await api.auth.firebaseSync({
      email: fbUser.email,
      name: fbUser.displayName || undefined,
      avatar: fbUser.photoURL || undefined,
      firebaseUid: fbUser.uid,
    });

    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);

    // ✅ Persist user details to Firestore
    await saveUserToFirestore(fbUser.uid, {
      name: fbUser.displayName || fbUser.email.split('@')[0],
      email: fbUser.email,
      avatar: fbUser.photoURL || '',
      provider: 'google',
    });
  };

  const loginWithFirebase = async (credentials: { email: string; password: string }) => {
    const result = await signInWithEmailAndPassword(firebaseAuth, credentials.email, credentials.password);
    const fbUser = result.user;
    if (!fbUser.email) throw new Error('No email found for account.');

    const res = await api.auth.firebaseSync({
      email: fbUser.email,
      name: fbUser.displayName || undefined,
      avatar: fbUser.photoURL || undefined,
      firebaseUid: fbUser.uid,
    });

    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);

    // ✅ Persist user details to Firestore
    await saveUserToFirestore(fbUser.uid, {
      name: fbUser.displayName || fbUser.email.split('@')[0],
      email: fbUser.email,
      avatar: fbUser.photoURL || '',
      provider: 'email',
    });
  };

  const registerWithFirebase = async (data: { name: string; email: string; password: string; gardenType?: string }) => {
    const result = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password);
    const fbUser = result.user;

    if (data.name) {
      await updateFirebaseProfile(fbUser, { displayName: data.name }).catch(() => {});
    }

    const res = await api.auth.firebaseSync({
      email: data.email,
      name: data.name,
      firebaseUid: fbUser.uid,
      gardenType: data.gardenType,
    });

    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);

    // ✅ Persist user details to Firestore
    await saveUserToFirestore(fbUser.uid, {
      name: data.name,
      email: data.email,
      gardenType: data.gardenType || 'Balcony & Indoor Urban Oasis',
      experienceLevel: 'beginner',
      provider: 'email',
    });
  };

  const logout = () => {
    firebaseSignOut(firebaseAuth).catch(() => {});
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    const res = await api.auth.updateUser(updates);
    setUser(res.user);

    // ✅ Also sync profile updates to Firestore
    const fbUser = firebaseAuth.currentUser;
    if (fbUser) {
      await updateUserInFirestore(fbUser.uid, updates);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        signInWithGoogle,
        loginWithFirebase,
        registerWithFirebase,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};


import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUserDocument, getUserDocument } from '../services/firebase.service';

interface User {
  id: string;
  name: string;
  email: string | null;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email,
    role: 'user' // You can fetch this from your database if needed
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAndSetAdminStatus = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getUserDocument(firebaseUser.uid);
      const isAdminEmail = firebaseUser.email === 'naik97059@gmail.com';
      const role = isAdminEmail ? 'admin' : (userDoc?.role || 'user');
      
      const userData = {
        id: firebaseUser.uid,
        name: userDoc?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email,
        role
      };

      if (!userDoc || userDoc.role !== role) {
        // Create or update user document with correct role
        await createUserDocument(firebaseUser.uid, {
          ...userData,
          role
        });
      }

      setUser(userData);
      setIsAdmin(role === 'admin');
      return userData;
    } catch (error) {
      console.error('Error checking admin status:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          await checkAndSetAdminStatus(firebaseUser);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError('Error setting up user profile');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await checkAndSetAdminStatus(result.user);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await checkAndSetAdminStatus(result.user);
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to sign up');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('user');
      sessionStorage.clear();
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to log out');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAdmin,
    signIn,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
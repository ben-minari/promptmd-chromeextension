import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged,
  signOut,
  signInWithCustomToken,
  type User 
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { signInWithChromeIdentity, signOutChromeIdentity } from '../services/auth-service';
import { getStoredAuthToken, storeAuthToken, removeAuthToken } from '../utils/storage';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get stored token first
        const storedToken = await getStoredAuthToken(currentUser?.uid || '');
        if (storedToken) {
          // Verify token with Firebase
          const userCredential = await signInWithCustomToken(auth, storedToken);
          setCurrentUser(userCredential.user);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get and store new token when user signs in
        const token = await user.getIdToken();
        await storeAuthToken(user.uid, token);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // Ensure we're signed out of Firebase first
      await signOut(auth);
      // Then sign in with Chrome Identity
      await signInWithChromeIdentity();
    } catch (error) {
      console.error("Google sign in failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // First sign out from Chrome Identity
      await signOutChromeIdentity();
      // Then sign out from Firebase
      await signOut(auth);
      // Clear the current user state and remove stored token
      if (currentUser) {
        await removeAuthToken(currentUser.uid);
      }
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const switchAccount = async () => {
    try {
      setLoading(true);
      // First sign out completely
      await logout();
      // Then start a new sign in flow
      await signInWithGoogle();
    } catch (error) {
      console.error("Switch account failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    logout,
    switchAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

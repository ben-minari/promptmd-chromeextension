Chrome Extension Authentication Architecture Spec
Project Overview
Create a Chrome extension using Plasmo framework with Firebase authentication that:

Supports Google OAuth (with multiple account handling)
Maintains authentication state securely
Will share authentication with a future web application
Uses reactive data synchronization

Technology Stack

Framework: Plasmo
Authentication: Firebase Authentication
Database: Firebase Firestore
Storage: Firebase Storage (optional for user assets)
Backend Functions: Firebase Functions (for custom auth logic)
State Management: React Context API + Custom Hooks

Core Components
1. Authentication Provider
Create a React Context provider that:

Initializes Firebase SDK
Manages authentication state
Provides login/logout functionality
Handles token refresh
Supports account switching

2. Secure Storage Layer
Implement a secure storage layer that:

Encrypts and stores authentication tokens in chrome.storage.local
Manages token expiration and refresh cycles
Syncs authentication state between extension components

3. Multiple Account Manager
Build an account management system that:

Stores multiple Google account credentials
Allows fast switching between accounts
Properly scopes data per user account
Handles Google OAuth's account selection flow

4. Data Synchronization Module
Create a data sync module that:

Establishes real-time Firestore listeners
Implements offline capabilities
Handles conflict resolution
Provides consistent data across platforms

5. Extension-Web Bridge (Future)
Design a bridge architecture that:

Uses the same Firebase project for extension and web app
Maintains consistent authentication state
Synchronizes user preferences and settings
Handles cross-platform notifications

Detailed Implementation Plan
Firebase Configuration
javascript// Firebase config structure
const firebaseConfig = {
  apiKey: process.env.PLASMO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.PLASMO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PLASMO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PLASMO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PLASMO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PLASMO_PUBLIC_FIREBASE_APP_ID
};
Authentication Flow

User clicks "Sign in with Google" in extension
Extension launches OAuth popup using Firebase's signInWithPopup
User selects Google account
Firebase returns authentication tokens
Store tokens securely in Chrome storage
Initialize Firestore listeners for user data
Update UI to reflect authenticated state

Directory Structure
src/
├── background/
│   └── auth-listener.ts       # Background authentication listener
├── contents/
│   └── auth-content-script.ts # Optional content script for auth
├── popup/
│   ├── index.tsx              # Main popup component
│   ├── AuthenticatedApp.tsx   # App content when authenticated
│   └── UnauthenticatedApp.tsx # Login screen
├── components/
│   ├── AccountSelector.tsx    # Account switching UI
│   ├── AuthForm.tsx           # Authentication form components
│   └── ProfileInfo.tsx        # Display user profile information
├── hooks/
│   ├── useAuth.ts             # Authentication hook
│   ├── useFirestore.ts        # Firestore data hook
│   └── useMultiAccount.ts     # Multi-account management hook
├── contexts/
│   ├── AuthContext.tsx        # Authentication context provider
│   └── FirestoreContext.tsx   # Database access context
├── utils/
│   ├── storage.ts             # Chrome storage utilities
│   ├── firebase.ts            # Firebase initialization
│   └── auth-helpers.ts        # Authentication helper functions
└── services/
    ├── auth-service.ts        # Authentication service functions
    └── firestore-service.ts   # Firestore service functions
Key Code Components
1. Authentication Context
typescript// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User 
} from 'firebase/auth'
import { firebaseConfig } from '../utils/firebase'
import { storeAuthToken, getStoredAuthToken, removeAuthToken } from '../utils/storage'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  switchAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    
    // Check for stored tokens on startup
    const initializeFromStorage = async () => {
      const storedToken = await getStoredAuthToken()
      // If token exists but no current user, try to initialize auth
      // Implementation depends on your token storage approach
    }
    
    initializeFromStorage()
    return unsubscribe
  }, [auth])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    
    try {
      const result = await signInWithPopup(auth, provider)
      // Store the token
      await storeAuthToken(result.user.uid, await result.user.getIdToken())
    } catch (error) {
      console.error("Google sign in failed", error)
    }
  }
  
  const logout = async () => {
    await signOut(auth)
    await removeAuthToken()
  }
  
  const switchAccount = async () => {
    // First sign out
    await signOut(auth)
    // Then start a new sign in flow that forces account selection
    return signInWithGoogle()
  }
  
  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    logout,
    switchAccount
  }
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
2. Secure Storage Utilities
typescript// src/utils/storage.ts
import { Storage } from "@plasmohq/storage"

// Create a storage instance
const storage = new Storage()

// Key for storing the auth token
const AUTH_TOKEN_KEY = "auth_token"
const CURRENT_USER_KEY = "current_user"

// Store auth token safely
export const storeAuthToken = async (userId: string, token: string) => {
  // In a real implementation, consider encrypting the token
  await storage.set(AUTH_TOKEN_KEY, token)
  await storage.set(CURRENT_USER_KEY, userId)
}

// Get stored auth token
export const getStoredAuthToken = async (): Promise<string | null> => {
  return await storage.get(AUTH_TOKEN_KEY)
}

// Get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  return await storage.get(CURRENT_USER_KEY)
}

// Remove auth token on logout
export const removeAuthToken = async () => {
  await storage.remove(AUTH_TOKEN_KEY)
  await storage.remove(CURRENT_USER_KEY)
}

// Store multiple account information
export const storeAccountInfo = async (accounts) => {
  await storage.set("user_accounts", accounts)
}

// Get stored accounts
export const getStoredAccounts = async () => {
  return await storage.get("user_accounts") || []
}
3. Firestore Data Hook
typescript// src/hooks/useFirestore.ts
import { useState, useEffect } from 'react'
import { getFirestore, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from './useAuth'

export function useUserData(path = "userData") {
  const { currentUser } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    if (!currentUser) {
      setData(null)
      setLoading(false)
      return
    }
    
    const db = getFirestore()
    const docRef = doc(db, path, currentUser.uid)
    
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        setData(doc.exists() ? doc.data() : null)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    
    return unsubscribe
  }, [currentUser, path])
  
  const updateUserData = async (updates) => {
    if (!currentUser) return
    
    const db = getFirestore()
    const docRef = doc(db, path, currentUser.uid)
    
    if (!data) {
      // Document doesn't exist yet, create it
      await setDoc(docRef, updates)
    } else {
      // Update existing document
      await updateDoc(docRef, updates)
    }
  }
  
  return { data, loading, error, updateUserData }
}
4. Multiple Account Manager Hook
typescript// src/hooks/useMultiAccount.ts
import { useState, useEffect } from 'react'
import { getStoredAccounts, storeAccountInfo } from '../utils/storage'
import { useAuth } from './useAuth'

export function useMultiAccount() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser, switchAccount } = useAuth()
  
  useEffect(() => {
    const loadAccounts = async () => {
      const storedAccounts = await getStoredAccounts()
      setAccounts(storedAccounts)
      setLoading(false)
    }
    
    loadAccounts()
  }, [])
  
  useEffect(() => {
    if (currentUser && !accounts.find(a => a.uid === currentUser.uid)) {
      // Add current user to accounts if not already there
      const newAccount = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL
      }
      
      const updatedAccounts = [...accounts, newAccount]
      setAccounts(updatedAccounts)
      storeAccountInfo(updatedAccounts)
    }
  }, [currentUser, accounts])
  
  const switchToAccount = async (accountUid) => {
    if (currentUser?.uid === accountUid) return
    
    // This will trigger a new sign-in popup
    await switchAccount()
  }
  
  const removeAccount = async (accountUid) => {
    const updatedAccounts = accounts.filter(a => a.uid !== accountUid)
    setAccounts(updatedAccounts)
    await storeAccountInfo(updatedAccounts)
    
    // If removing current account, trigger logout or switch
    if (currentUser?.uid === accountUid) {
      await switchAccount()
    }
  }
  
  return { 
    accounts, 
    currentAccountId: currentUser?.uid,
    loading, 
    switchToAccount,
    removeAccount
  }
}
5. Main Popup Component
typescript// src/popup/index.tsx
import { useState } from "react"
import { AuthProvider } from "../contexts/AuthContext"
import { useAuth } from "../hooks/useAuth"
import AuthenticatedApp from "./AuthenticatedApp"
import UnauthenticatedApp from "./UnauthenticatedApp"

function AuthContent() {
  const { currentUser, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return currentUser ? <AuthenticatedApp /> : <UnauthenticatedApp />
}

function IndexPopup() {
  return (
    <div style={{ width: 320, padding: 16 }}>
      <AuthProvider>
        <AuthContent />
      </AuthProvider>
    </div>
  )
}

export default IndexPopup
Security Considerations

Token Storage

Store authentication tokens in chrome.storage.local rather than localStorage
Consider using the Chrome extension's identity API for additional security
Never expose Firebase API keys in client-side code without proper restrictions


OAuth Security

Set appropriate OAuth redirect URLs in Firebase console
Configure correct content security policy in manifest
Add Firebase domain to extension's permissions


Data Access Rules

Implement strict Firestore security rules based on user authentication
Use Firebase Storage rules to limit access to user-specific files
Consider implementing additional server-side validation for sensitive operations



Extensibility for Web Application

Shared Firebase Project

Use the same Firebase project for both extension and web app
Configure appropriate origins in Firebase console


Authentication Persistence

Use Firebase's setPersistence() with appropriate settings per platform
Implement secure token exchange if needed between platforms


Data Structure

Design Firestore collections with platform-agnostic schema
Include metadata fields to track origin of data changes



Next Steps & Implementation Roadmap

Set up Plasmo project and Firebase integration
Implement basic authentication flow
Develop secure token storage mechanism
Build account selection and management UI
Implement Firestore data synchronization
Add offline capabilities and error handling
Develop extension-specific features
Plan for web application compatibility
Test across multiple devices and accounts
Deploy and publish extension

Authentication Architecture
┌─────────────────┐     ┌─────────────────┐     ┌────────────────────┐
│ Chrome Extension│     │  Firebase Auth  │     │ Firebase Firestore │
│  (Plasmo App)   │◄─┬─►│  Google OAuth   │◄───►│   User Profiles    │
└─────────────────┘  │  └─────────────────┘     │   Synced States    │
                     │                          └────────────────────┘
                     │
                     │  ┌─────────────────┐
                     └─►│  Future Web App │
                        │  (React/Next)   │
                        └─────────────────┘
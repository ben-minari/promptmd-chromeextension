import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../utils/firebase'
import { storeAuthToken, removeAuthToken } from '../utils/storage'
import { signInWithChromeIdentity, signOutChromeIdentity } from '../services/auth-service'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  switchAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    
    return unsubscribe
  }, [])

  const clearAllTokens = async () => {
    // Remove all cached tokens if the API exists
    if (chrome.identity.clearAllCachedAuthTokens) {
      await new Promise<void>((resolve) => {
        chrome.identity.clearAllCachedAuthTokens(() => resolve())
      })
    } else {
      // Fallback: try to remove the current token
      const token = await new Promise<string | null>((resolve) => {
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
          if (chrome.runtime.lastError) {
            resolve(null)
          } else {
            resolve(token)
          }
        })
      })
      if (token) {
        await new Promise<void>((resolve) => {
          chrome.identity.removeCachedAuthToken({ token }, () => resolve())
        })
      }
    }
  }

  const signInWithGoogle = async () => {
    await clearAllTokens()
    // Now do the interactive sign-in
    try {
      const result = await signInWithChromeIdentity()
      await storeAuthToken(result.user.uid, await result.user.getIdToken())
    } catch (error) {
      console.error("Google sign in failed", error)
      throw error
    }
  }
  
  const logout = async () => {
    await signOutChromeIdentity()
    await signOut(auth)
    await removeAuthToken()
    await clearAllTokens()
    // Optionally, force Google-wide logout:
    // chrome.tabs.create({ url: "https://accounts.google.com/Logout" })
  }
  
  const switchAccount = async () => {
    await logout()
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
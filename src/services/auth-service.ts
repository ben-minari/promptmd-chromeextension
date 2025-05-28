import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { auth, db } from '../utils/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export const signInWithChromeIdentity = async () => {
  try {
    // Get a new token with interactive mode
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ 
        interactive: true,
        scopes: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ]
      }, (token) => {
        if (chrome.runtime.lastError) {
          // If there's an error, try to clear the token and retry once
          chrome.identity.removeCachedAuthToken({ token: '' }, () => {
            chrome.identity.getAuthToken({ 
              interactive: true,
              scopes: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
              ]
            }, (retryToken) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
              } else if (retryToken) {
                resolve(retryToken)
              } else {
                reject(new Error('Failed to get auth token'))
              }
            })
          })
        } else if (token) {
          resolve(token)
        } else {
          reject(new Error('Failed to get auth token'))
        }
      })
    })

    // Create a credential with the token
    const credential = GoogleAuthProvider.credential(null, token)

    // Sign in to Firebase with the credential
    const result = await signInWithCredential(auth, credential)

    // Create or update user document in Firestore
    const userRef = doc(db, 'users', result.user.uid)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      // Create new user document
      await setDoc(userRef, {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        createdAt: new Date()
      })
    } else {
      // Update existing user document
      await setDoc(userRef, {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        updatedAt: new Date()
      }, { merge: true })
    }

    return result
  } catch (error) {
    console.error('Chrome identity sign in failed:', error)
    throw error
  }
}

export const signOutChromeIdentity = async () => {
  try {
    // Get all tokens that might be cached
    const tokens = await new Promise<string[]>((resolve) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (token) {
          resolve([token])
        } else {
          resolve([])
        }
      })
    })

    // Revoke and remove all tokens
    for (const token of tokens) {
      // Remove from Chrome's cache
      await new Promise<void>((resolve, reject) => {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve()
          }
        })
      })

      // Revoke on Google's servers
      try {
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
      } catch (error) {
        console.error('Error revoking token:', error)
      }
    }

    // Clear Chrome's identity cache completely
    await new Promise<void>((resolve, reject) => {
      chrome.identity.clearAllCachedAuthTokens(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  } catch (error) {
    console.error('Chrome identity sign out failed:', error)
    throw error
  }
} 
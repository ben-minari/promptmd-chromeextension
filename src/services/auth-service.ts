import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { auth } from '../utils/firebase'

export const signInWithChromeIdentity = async () => {
  try {
    // Get the OAuth token using Chrome's identity API
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(token)
        }
      })
    })

    // Create a credential with the token
    const credential = GoogleAuthProvider.credential(null, token)

    // Sign in to Firebase with the credential
    const result = await signInWithCredential(auth, credential)
    return result
  } catch (error) {
    console.error('Chrome identity sign in failed:', error)
    throw error
  }
}

export const signOutChromeIdentity = async () => {
  try {
    // Get the current token
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(token)
        }
      })
    })

    // Revoke the token
    if (token) {
      await new Promise<void>((resolve, reject) => {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve()
          }
        })
      })
    }
  } catch (error) {
    console.error('Chrome identity sign out failed:', error)
    throw error
  }
} 
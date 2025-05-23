import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      PLASMO_PUBLIC_GOOGLE_CLIENT_ID_PROD?: string
      PLASMO_PUBLIC_GOOGLE_CLIENT_ID_DEV?: string
      PLASMO_PUBLIC_FIREBASE_API_KEY?: string
      PLASMO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string
      PLASMO_PUBLIC_FIREBASE_PROJECT_ID?: string
      PLASMO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string
      PLASMO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string
      PLASMO_PUBLIC_FIREBASE_APP_ID?: string
      PLASMO_PUBLIC_MEASUREMENT_ID?: string
    }
  }
}

// Get client ID based on environment
const isProd = process.env.NODE_ENV === 'production'
const clientId = isProd 
  ? process.env.PLASMO_PUBLIC_GOOGLE_CLIENT_ID_PROD
  : process.env.PLASMO_PUBLIC_GOOGLE_CLIENT_ID_DEV

if (!clientId) {
  throw new Error(`Missing Google client ID for ${isProd ? 'production' : 'development'} environment`)
}

// Check for required environment variables
const requiredEnvVars = {
  apiKey: process.env.PLASMO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.PLASMO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PLASMO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PLASMO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PLASMO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PLASMO_PUBLIC_FIREBASE_APP_ID
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

const firebaseConfig = {
  ...requiredEnvVars,
  measurementId: process.env.PLASMO_PUBLIC_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  client_id: clientId
})

export default app 
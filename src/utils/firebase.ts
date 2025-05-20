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

// Determine which client ID to use based on the environment
const isProd = process.env.NODE_ENV === 'production'
const clientId = isProd 
  ? "725964297899-ph030pbskpcmrqvaemsmo93pp6an3keo.apps.googleusercontent.com"
  : "725964297899-rne9qvn8ecd3kn9mo555vhi5442384kc.apps.googleusercontent.com"

// Log environment information for debugging
console.log('Environment:', process.env.NODE_ENV)
console.log('Using client ID:', clientId)

// Check for required environment variables
const requiredEnvVars = {
  apiKey: process.env.PLASMO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.PLASMO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PLASMO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PLASMO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PLASMO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PLASMO_PUBLIC_FIREBASE_APP_ID
}

// Log missing environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`)
  }
})

const firebaseConfig = {
  ...requiredEnvVars,
  measurementId: process.env.PLASMO_PUBLIC_MEASUREMENT_ID,
  clientId
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
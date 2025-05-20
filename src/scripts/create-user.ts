import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: "promptmd-28c39",
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
})

const auth = getAuth(app)

async function createUser(email: string, password: string) {
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true
    })
    
    console.log(`Successfully created user: ${email}`)
    return userRecord
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// Get email and password from command line arguments
const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Please provide both email and password as arguments')
  process.exit(1)
}

createUser(email, password) 
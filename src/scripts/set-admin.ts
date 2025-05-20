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

async function setAdminPrivileges(email: string) {
  try {
    // Get the user by email
    const user = await auth.getUserByEmail(email)
    
    // Set custom claims
    await auth.setCustomUserClaims(user.uid, { admin: true })
    
    console.log(`Successfully set admin privileges for user: ${email}`)
  } catch (error) {
    console.error('Error setting admin privileges:', error)
  }
}

// Get email from command line argument
const email = process.argv[2]
if (!email) {
  console.error('Please provide an email address as an argument')
  process.exit(1)
}

setAdminPrivileges(email) 
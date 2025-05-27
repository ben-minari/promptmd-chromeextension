import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.PLASMO_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
})

const db = getFirestore(app)

async function resetFirestore() {
  try {
    console.log('Starting Firestore reset...')

    // 1. Get all users' savedTools subcollections
    const usersSnapshot = await db.collection('users').get()
    for (const userDoc of usersSnapshot.docs) {
      const savedToolsSnapshot = await userDoc.ref.collection('savedTools').get()
      
      // Delete all saved tools for each user
      const batch = db.batch()
      savedToolsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
      await batch.commit()
      console.log(`Cleared saved tools for user ${userDoc.id}`)
    }

    // 2. Reset all tools' saveCount to 0 and update authorId
    const toolsSnapshot = await db.collection('tools').get()
    const batch = db.batch()
    
    toolsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        saveCount: 0,
        authorId: 'ZNj1ih3OH3bSocssKQLBUbqPXln1'
      })
    })
    
    await batch.commit()
    console.log(`Reset ${toolsSnapshot.size} tools' saveCount and updated authorId`)

    console.log('Firestore reset completed successfully!')
  } catch (error) {
    console.error('Error during Firestore reset:', error)
  }
}

// Run the reset
resetFirestore() 
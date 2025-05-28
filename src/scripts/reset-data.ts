import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
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

async function resetData() {
  try {
    // Get all tools
    const toolsSnapshot = await db.collection('tools').get()
    
    // Create a batch for updating tools
    const toolsBatch = db.batch()
    
    // Reset all tools' ratings and save counts
    toolsSnapshot.forEach(doc => {
      toolsBatch.update(doc.ref, {
        saveCount: 0,
        ratingAvg: 0,
        ratingCount: 0
      })
    })
    
    // Delete all ratings
    const ratingsSnapshot = await db.collection('ratings').get()
    const ratingsBatch = db.batch()
    ratingsSnapshot.forEach(doc => {
      ratingsBatch.delete(doc.ref)
    })
    
    // Delete all saved tools for all users
    const usersSnapshot = await db.collection('users').get()
    const savedToolsBatches: FirebaseFirestore.WriteBatch[] = []
    
    for (const userDoc of usersSnapshot.docs) {
      const savedToolsSnapshot = await userDoc.ref.collection('savedTools').get()
      if (savedToolsSnapshot.size > 0) {
        const batch = db.batch()
        savedToolsSnapshot.forEach(doc => {
          batch.delete(doc.ref)
        })
        savedToolsBatches.push(batch)
      }
    }
    
    // Commit all batches
    await toolsBatch.commit()
    await ratingsBatch.commit()
    for (const batch of savedToolsBatches) {
      await batch.commit()
    }
    
    console.log('Successfully reset all data!')
  } catch (error) {
    console.error('Error resetting data:', error)
  }
}

// Run the reset
resetData() 
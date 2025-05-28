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

const NEW_AUTHOR_ID = 'onFyxZxm9mUsYSXqHUEl4fxegTH2'

async function setAllToolsAuthor() {
  try {
    const toolsSnapshot = await db.collection('tools').get()
    if (toolsSnapshot.empty) {
      console.log('No tools found.')
      return
    }

    const batch = db.batch()
    let count = 0

    toolsSnapshot.forEach(doc => {
      batch.update(doc.ref, { authorId: NEW_AUTHOR_ID })
      count++
    })

    await batch.commit()
    console.log(`Updated authorId for ${count} tools.`)
  } catch (error) {
    console.error('Error updating authorId:', error)
  }
}

setAllToolsAuthor()
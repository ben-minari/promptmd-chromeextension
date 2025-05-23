import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, cert } from 'firebase-admin/app'
import * as dotenv from 'dotenv'
import { categorizeTag } from '../utils/tag-utils'

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

async function migrateTagsToHumanReadable() {
  const toolsRef = db.collection('tools')
  const snapshot = await toolsRef.get()
  let updatedCount = 0
  let skippedCount = 0

  for (const doc of snapshot.docs) {
    const data = doc.data()
    if (!data.tags || typeof data.tags !== 'object') {
      skippedCount++
      continue
    }
    const newTags = { specialty: [], useCase: [], userType: [], appModel: [] }
    let changed = false
    for (const category of Object.keys(newTags)) {
      if (!Array.isArray(data.tags[category])) continue
      for (const tag of data.tags[category]) {
        const { category: newCategory, tag: humanTag } = categorizeTag(tag)
        if (!newTags[newCategory].includes(humanTag)) {
          newTags[newCategory].push(humanTag)
        }
        if (tag !== humanTag || category !== newCategory) {
          changed = true
        }
      }
    }
    if (changed) {
      await doc.ref.update({ tags: newTags })
      updatedCount++
      console.log(`Updated ${doc.id}`)
    } else {
      skippedCount++
    }
  }
  console.log(`Migration complete. Updated: ${updatedCount}, Skipped: ${skippedCount}`)
}

migrateTagsToHumanReadable().catch(console.error) 
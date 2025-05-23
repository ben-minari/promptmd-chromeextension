import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, cert } from 'firebase-admin/app'
import * as dotenv from 'dotenv'

dotenv.config()

const app = initializeApp({
  credential: cert({
    projectId: process.env.PLASMO_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
})

const db = getFirestore(app)

async function fixGpt4UseCaseToAppModel() {
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
    let changed = false
    let useCase = Array.isArray(data.tags.useCase) ? [...data.tags.useCase] : []
    let appModel = Array.isArray(data.tags.appModel) ? [...data.tags.appModel] : []

    // Remove any 'GPT-4' (case-insensitive) from useCase
    const newUseCase = useCase.filter(tag => tag.toLowerCase() !== 'gpt-4')
    if (newUseCase.length !== useCase.length) {
      changed = true
    }
    // Add 'ChatGPT' to appModel if 'GPT-4' was present and 'ChatGPT' is not already present
    if (useCase.some(tag => tag.toLowerCase() === 'gpt-4') && !appModel.includes('ChatGPT')) {
      appModel.push('ChatGPT')
      changed = true
    }
    if (changed) {
      await doc.ref.update({
        'tags.useCase': newUseCase,
        'tags.appModel': appModel
      })
      updatedCount++
      console.log(`Fixed ${doc.id}`)
    } else {
      skippedCount++
    }
  }
  console.log(`Fix complete. Updated: ${updatedCount}, Skipped: ${skippedCount}`)
}

fixGpt4UseCaseToAppModel().catch(console.error) 
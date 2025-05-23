import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'

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

async function migrateTools() {
  try {
    // Read and parse CSV
    const csvContent = readFileSync('promptmd impromptu roadmap - Sheet3 (2).csv', 'utf-8')
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    })

    console.log(`Found ${records.length} tools to migrate`)

    // Process in batches of 500 (Firestore batch limit)
    const batchSize = 500
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = db.batch()
      const chunk = records.slice(i, i + batchSize)

      for (const record of chunk) {
        // Create new tool document
        const toolRef = db.collection('tools').doc(uuidv4())
        
        // Transform data to match schema
        const tool = {
          type: "prompt",
          status: "published",
          title: record.title,
          description: record.description,
          content: record.content,
          tags: {
            specialty: [record.specialty.toLowerCase()],
            useCase: [record.category.toLowerCase()],
            appModel: JSON.parse(record.tools)
          },
          authorId: "system",
          version: 1,
          createdAt: new Date(record.created_at),
          updatedAt: new Date(record.created_at),
          saveCount: 0,
          ratingAvg: 0,
          ratingCount: 0
        }

        batch.set(toolRef, tool)
      }

      // Commit batch
      await batch.commit()
      console.log(`Migrated batch ${i / batchSize + 1} of ${Math.ceil(records.length / batchSize)}`)
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Error during migration:', error)
  }
}

// Run migration
migrateTools() 
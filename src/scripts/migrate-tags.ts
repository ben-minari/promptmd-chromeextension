import { toolsService } from "../services/tools-service"

async function migrateTags() {
  console.log("Starting tag migration...")
  
  try {
    const result = await toolsService.migrateTags()
    
    console.log("Migration completed!")
    console.log(`Total documents processed: ${result.totalDocuments}`)
    console.log(`Successfully migrated: ${result.migratedCount}`)
    console.log(`Errors encountered: ${result.errorCount}`)
  } catch (error) {
    console.error("Migration failed:", error)
  }
}

// Run the migration
migrateTags() 
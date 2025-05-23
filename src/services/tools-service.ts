import { db } from "../utils/firebase"
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp, writeBatch } from "firebase/firestore"
import { categorizeTag } from '../utils/tag-utils'

export interface Tool {
  id?: string
  type: "prompt" | "mcp" | "custom_gpt"
  status: "draft" | "published"
  title: string
  description: string
  content: string
  tags: {
    specialty: string[]
    useCase: string[]
    userType: string[]
    appModel: string[]
  }
  authorId: string
  organizationId?: string
  version: number
  createdAt: Timestamp
  updatedAt: Timestamp
  saveCount: number
  ratingAvg: number
  ratingCount: number
  isSaved?: boolean
  sources?: Array<{
    type: "url" | "user" | "text" | string
    value: string
    label?: string
  }>
}

export const toolsService = {
  async getPublishedTools(limitCount = 20) {
    const q = query(
      collection(db, "tools"),
      where("status", "==", "published"),
      where("type", "==", "prompt"),
      orderBy("updatedAt", "desc"),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool))
  },

  async getToolsByTag(category: keyof Tool['tags'], tag: string, limitCount = 20) {
    const q = query(
      collection(db, "tools"),
      where("status", "==", "published"),
      where("type", "==", "prompt"),
      where(`tags.${category}`, "array-contains", tag),
      orderBy("ratingAvg", "desc"),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool))
  },

  async getToolById(id: string) {
    const docRef = doc(db, "tools", id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as Tool
  },

  async createTool(tool: Omit<Tool, "id" | "createdAt" | "updatedAt" | "saveCount" | "ratingAvg" | "ratingCount">) {
    const now = Timestamp.now()
    const newTool = {
      ...tool,
      createdAt: now,
      updatedAt: now,
      saveCount: 0,
      ratingAvg: 0,
      ratingCount: 0
    }
    const docRef = await addDoc(collection(db, "tools"), newTool)
    return { id: docRef.id, ...newTool } as Tool
  },

  async updateTool(id: string, updates: Partial<Tool>) {
    const docRef = doc(db, "tools", id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    })
  },

  async deleteTool(id: string) {
    const docRef = doc(db, "tools", id)
    await deleteDoc(docRef)
  },

  async saveTool(userId: string, toolId: string) {
    const savedToolRef = doc(db, "users", userId, "savedTools", toolId)
    await addDoc(collection(db, "savedTools"), {
      toolId,
      userId,
      savedAt: Timestamp.now()
    })
    
    const toolRef = doc(db, "tools", toolId)
    const toolSnap = await getDoc(toolRef)
    if (toolSnap.exists()) {
      await updateDoc(toolRef, {
        saveCount: (toolSnap.data().saveCount || 0) + 1
      })
    }
  },

  async unsaveTool(userId: string, toolId: string) {
    const savedToolRef = doc(db, "users", userId, "savedTools", toolId)
    await deleteDoc(savedToolRef)
    
    const toolRef = doc(db, "tools", toolId)
    const toolSnap = await getDoc(toolRef)
    if (toolSnap.exists()) {
      const currentCount = toolSnap.data().saveCount || 0
      await updateDoc(toolRef, {
        saveCount: Math.max(0, currentCount - 1)
      })
    }
  },

  async getSavedTools(userId: string) {
    const savedToolsRef = await getDocs(
      collection(db, "users", userId, "savedTools")
    )
    const toolIds = savedToolsRef.docs.map(doc => doc.id)
    
    if (toolIds.length === 0) return []
    
    const toolsRef = await getDocs(
      query(
        collection(db, "tools"),
        where("__name__", "in", toolIds)
      )
    )
    
    return toolsRef.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool))
  },

  async migrateTags() {
    const batch = writeBatch(db)
    const toolsRef = collection(db, "tools")
    const snapshot = await getDocs(toolsRef)
    
    let migratedCount = 0
    let errorCount = 0

    for (const doc of snapshot.docs) {
      const data = doc.data()
      
      // Skip if already using new format
      if (typeof data.tags === 'object' && !Array.isArray(data.tags)) {
        continue
      }

      try {
        // Convert old tags array to new format
        const oldTags = data.tags as string[]
        const newTags = {
          specialty: [] as string[],
          useCase: [] as string[],
          userType: [] as string[],
          appModel: [] as string[]
        }

        // Categorize each tag
        oldTags.forEach(tag => {
          const { category, tag: normalizedTag } = categorizeTag(tag)
          if (!newTags[category].includes(normalizedTag)) {
            newTags[category].push(normalizedTag)
          }
        })

        // Update document with new tag structure
        batch.update(doc.ref, { tags: newTags })
        migratedCount++
      } catch (error) {
        console.error(`Error migrating document ${doc.id}:`, error)
        errorCount++
      }
    }

    // Commit all changes
    if (migratedCount > 0) {
      await batch.commit()
    }

    return {
      migratedCount,
      errorCount,
      totalDocuments: snapshot.size
    }
  },

  async getToolsByAuthor(userId: string) {
    const q = query(
      collection(db, "tools"),
      where("authorId", "==", userId),
      orderBy("updatedAt", "desc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool))
  },

  async getDraftTools(userId: string) {
    const q = query(
      collection(db, "tools"),
      where("authorId", "==", userId),
      where("status", "==", "draft"),
      orderBy("updatedAt", "desc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool))
  }
} 
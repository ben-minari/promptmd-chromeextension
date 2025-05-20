import { db } from "../utils/firebase"
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore"

export interface Rating {
  id?: string
  toolId: string
  userId: string
  value: number
  comment?: string
  createdAt: Timestamp
}

export const ratingsService = {
  async getRatingsForTool(toolId: string) {
    const q = query(
      collection(db, "ratings"),
      where("toolId", "==", toolId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rating))
  },

  async getUserRating(userId: string, toolId: string) {
    const q = query(
      collection(db, "ratings"),
      where("userId", "==", userId),
      where("toolId", "==", toolId)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Rating
  },

  async createRating(rating: Omit<Rating, "id" | "createdAt">) {
    const newRating = {
      ...rating,
      createdAt: Timestamp.now()
    }
    const docRef = await addDoc(collection(db, "ratings"), newRating)
    
    // Update tool's rating stats
    const toolRef = doc(db, "tools", rating.toolId)
    const toolSnap = await getDoc(toolRef)
    if (toolSnap.exists()) {
      const tool = toolSnap.data()
      const newCount = (tool.ratingCount || 0) + 1
      const newAvg = ((tool.ratingAvg || 0) * (tool.ratingCount || 0) + rating.value) / newCount
      
      await updateDoc(toolRef, {
        ratingCount: newCount,
        ratingAvg: newAvg
      })
    }
    
    return { id: docRef.id, ...newRating } as Rating
  },

  async updateRating(id: string, updates: Partial<Rating>) {
    const ratingRef = doc(db, "ratings", id)
    const ratingSnap = await getDoc(ratingRef)
    if (!ratingSnap.exists()) return null
    
    const oldRating = ratingSnap.data() as Rating
    await updateDoc(ratingRef, updates)
    
    // Update tool's rating stats if value changed
    if (updates.value !== undefined && updates.value !== oldRating.value) {
      const toolRef = doc(db, "tools", oldRating.toolId)
      const toolSnap = await getDoc(toolRef)
      if (toolSnap.exists()) {
        const tool = toolSnap.data()
        const newAvg = ((tool.ratingAvg * tool.ratingCount) - oldRating.value + updates.value) / tool.ratingCount
        
        await updateDoc(toolRef, {
          ratingAvg: newAvg
        })
      }
    }
    
    return { id, ...oldRating, ...updates } as Rating
  },

  async deleteRating(id: string) {
    const ratingRef = doc(db, "ratings", id)
    const ratingSnap = await getDoc(ratingRef)
    if (!ratingSnap.exists()) return
    
    const rating = ratingSnap.data() as Rating
    await deleteDoc(ratingRef)
    
    // Update tool's rating stats
    const toolRef = doc(db, "tools", rating.toolId)
    const toolSnap = await getDoc(toolRef)
    if (toolSnap.exists()) {
      const tool = toolSnap.data()
      const newCount = tool.ratingCount - 1
      const newAvg = newCount === 0 ? 0 : ((tool.ratingAvg * tool.ratingCount) - rating.value) / newCount
      
      await updateDoc(toolRef, {
        ratingCount: newCount,
        ratingAvg: newAvg
      })
    }
  }
} 
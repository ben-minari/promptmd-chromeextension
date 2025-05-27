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
      console.log('Current tool data:', tool)
      
      // Initialize with safe defaults
      const currentCount = Math.max(0, Number(tool.ratingCount || 0))
      const currentAvg = Math.max(0, Number(tool.ratingAvg || 0))
      const newCount = currentCount + 1
      
      // Calculate new average
      let newAvg: number
      if (currentCount === 0) {
        // First rating
        newAvg = rating.value
      } else {
        // Add to existing average
        const currentTotal = currentAvg * currentCount
        newAvg = (currentTotal + rating.value) / newCount
      }
      
      console.log('Rating calculation:', {
        currentCount,
        currentAvg,
        newCount,
        newAvg,
        ratingValue: rating.value
      })
      
      await updateDoc(toolRef, {
        ratingCount: newCount,
        ratingAvg: Number(newAvg.toFixed(2)),
        updatedAt: Timestamp.now()
      })
    }
    
    return { id: docRef.id, ...newRating } as Rating
  },

  async updateRating(id: string, updates: Partial<Rating>) {
    const ratingRef = doc(db, "ratings", id)
    const ratingSnap = await getDoc(ratingRef)
    if (!ratingSnap.exists()) return null
    
    const oldRating = ratingSnap.data() as Rating
    await updateDoc(ratingRef, {
      ...updates,
      updatedAt: Timestamp.now()
    })
    
    // Update tool's rating stats if value changed
    if (updates.value !== undefined && updates.value !== oldRating.value) {
      const toolRef = doc(db, "tools", oldRating.toolId)
      const toolSnap = await getDoc(toolRef)
      if (toolSnap.exists()) {
        const tool = toolSnap.data()
        console.log('Current tool data:', tool)
        
        // Initialize with safe defaults
        const currentCount = Math.max(0, Number(tool.ratingCount || 0))
        const currentAvg = Math.max(0, Number(tool.ratingAvg || 0))
        
        // Calculate new average
        let newAvg: number
        if (currentCount === 0) {
          // No ratings (shouldn't happen, but just in case)
          newAvg = updates.value
        } else {
          // Update existing average
          const currentTotal = currentAvg * currentCount
          newAvg = (currentTotal - oldRating.value + updates.value) / currentCount
        }
        
        console.log('Rating update calculation:', {
          currentCount,
          currentAvg,
          oldRatingValue: oldRating.value,
          newRatingValue: updates.value,
          newAvg
        })
        
        await updateDoc(toolRef, {
          ratingAvg: Number(newAvg.toFixed(2)),
          updatedAt: Timestamp.now()
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
      console.log('Current tool data:', tool)
      
      // Initialize with safe defaults
      const currentCount = Math.max(0, Number(tool.ratingCount || 0))
      const currentAvg = Math.max(0, Number(tool.ratingAvg || 0))
      const newCount = Math.max(0, currentCount - 1)
      
      // Calculate new average
      let newAvg = 0
      if (newCount > 0) {
        const currentTotal = currentAvg * currentCount
        newAvg = (currentTotal - rating.value) / newCount
      }
      
      console.log('Rating deletion calculation:', {
        currentCount,
        currentAvg,
        newCount,
        deletedRatingValue: rating.value,
        newAvg
      })
      
      await updateDoc(toolRef, {
        ratingCount: newCount,
        ratingAvg: Number(newAvg.toFixed(2)),
        updatedAt: Timestamp.now()
      })
    }
  }
} 
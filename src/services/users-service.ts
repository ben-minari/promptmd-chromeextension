import { db } from "../utils/firebase"
import { doc, getDoc } from "firebase/firestore"

export interface User {
  id: string
  displayName: string
  email: string
  photoURL?: string
}

export const usersService = {
  async getUserById(userId: string): Promise<User | null> {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return null
    return { id: userSnap.id, ...userSnap.data() } as User
  }
} 
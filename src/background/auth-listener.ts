import { auth } from "../utils/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { storeAuthToken, removeAuthToken } from "../utils/storage"

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in
    const token = await user.getIdToken()
    await storeAuthToken(user.uid, token)
    
    // You can also set up any other background tasks here
    // For example, setting up Firestore listeners
  } else {
    // User is signed out
    await removeAuthToken()
  }
}) 
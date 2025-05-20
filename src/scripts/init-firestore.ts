import { db, auth } from "../utils/firebase"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { signInWithEmailAndPassword } from "firebase/auth"
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Log configuration (without sensitive values)
console.log("Firebase Configuration:")
console.log("Project ID:", process.env.PLASMO_PUBLIC_FIREBASE_PROJECT_ID)
console.log("Auth Domain:", process.env.PLASMO_PUBLIC_FIREBASE_AUTH_DOMAIN)
console.log("API Key exists:", !!process.env.PLASMO_PUBLIC_FIREBASE_API_KEY)
console.log("Storage Bucket:", process.env.PLASMO_PUBLIC_FIREBASE_STORAGE_BUCKET)
console.log("Messaging Sender ID exists:", !!process.env.PLASMO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)
console.log("App ID exists:", !!process.env.PLASMO_PUBLIC_FIREBASE_APP_ID)

const sampleTools = [
  {
    type: "prompt",
    status: "published",
    title: "Patient Handoff Summary",
    description: "Creates a structured summary for shift handoffs",
    content: "Write a concise handoff summary:\n– Patient Name: …\n– Diagnoses: …\n– Medications: …",
    tags: {
      specialty: ["primary_care"],
      useCase: ["handoff"],
      userType: ["clinician"],
      appModel: ["gpt-4"]
    },
    authorId: "system",
    version: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    saveCount: 0,
    ratingAvg: 0,
    ratingCount: 0
  },
  {
    type: "prompt",
    status: "published",
    title: "Triage Assessment",
    description: "Structured assessment for patient triage",
    content: "Conduct a triage assessment:\n– Chief Complaint: …\n– Vital Signs: …\n– Initial Assessment: …",
    tags: {
      specialty: ["emergency"],
      useCase: ["triage"],
      userType: ["nurse"],
      appModel: ["gpt-4"]
    },
    authorId: "system",
    version: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    saveCount: 0,
    ratingAvg: 0,
    ratingCount: 0
  }
]

async function initializeFirestore() {
  console.log("Starting Firestore initialization...")
  
  try {
    // First, authenticate with Firebase
    const email = "admin@example.com"  // Use the admin email we created
    const password = "your-secure-password"  // Use the password we set
    
    console.log("Authenticating with Firebase...")
    await signInWithEmailAndPassword(auth, email, password)
    console.log("Authentication successful!")
    
    const toolsRef = collection(db, "tools")
    
    for (const tool of sampleTools) {
      await addDoc(toolsRef, tool)
      console.log(`Added tool: ${tool.title}`)
    }
    
    console.log("Firestore initialization completed successfully!")
  } catch (error) {
    console.error("Error initializing Firestore:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
    }
  }
}

// Run the initialization
initializeFirestore() 
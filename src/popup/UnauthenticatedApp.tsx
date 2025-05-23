import React from "react"
import { useAuth } from "../contexts/AuthContext"

export default function UnauthenticatedApp() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Welcome to PromptMD</h1>
      <p className="text-gray-600 mb-8 text-center">
        Sign in to access your healthcare AI tools and collaborate with others.
      </p>
      <button
        onClick={signInWithGoogle}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
          className="w-5 h-5"
        />
        <span>Sign in with Google</span>
      </button>
    </div>
  )
} 
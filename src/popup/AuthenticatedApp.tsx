import React from "react"
import { useAuth } from "../contexts/AuthContext"

export default function AuthenticatedApp() {
  const { currentUser, logout, switchAccount } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <img
            src={currentUser?.photoURL || ""}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <span className="font-medium">{currentUser?.displayName}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={switchAccount}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            Switch Account
          </button>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex-1">
        {/* Main app content will go here */}
        <p className="text-gray-600">Welcome to PromptMD!</p>
      </div>
    </div>
  )
} 
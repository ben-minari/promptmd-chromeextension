import React from "react"
import { AuthProvider } from "../contexts/AuthContext"
import AuthenticatedApp from "./AuthenticatedApp"
import UnauthenticatedApp from "./UnauthenticatedApp"
import { useAuth } from "../contexts/AuthContext"

function PopupContent() {
  const { currentUser } = useAuth()

  return currentUser ? <AuthenticatedApp /> : <UnauthenticatedApp />
}

function IndexPopup() {
  return (
    <AuthProvider>
      <div className="w-[400px] h-[500px] p-4">
        <PopupContent />
      </div>
    </AuthProvider>
  )
}

export default IndexPopup 
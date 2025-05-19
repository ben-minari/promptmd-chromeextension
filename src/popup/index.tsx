<<<<<<< HEAD
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { AccountSwitcher } from '../components/AccountSwitcher';

const Popup: React.FC = () => {
  return (
    <div className="w-[400px] p-4 bg-slate-50">
      <AuthProvider>
        <AccountSwitcher />
      </AuthProvider>
    </div>
  );
};

export default Popup; 
=======
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
>>>>>>> c9885d634bba93b9fd048655c9b172206cc95e03

import "../style.css"
import React from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import AuthenticatedApp from './AuthenticatedApp';
import PublicApp from './PublicApp';

const PopupContent = () => {
  const { currentUser } = useAuth();

  return currentUser ? <AuthenticatedApp /> : <PublicApp />;
};

const IndexPopup = () => {
  return (
    <AuthProvider>
      <div className="w-[400px] h-[600px] bg-white">
        <PopupContent />
      </div>
    </AuthProvider>
  );
};

export default IndexPopup;

import "../style.css"
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import AuthenticatedApp from './AuthenticatedApp';
import PublicApp from './PublicApp';

const PopupContent = () => {
  const { currentUser } = useAuth();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  return currentUser ? (
    <AuthenticatedApp isFiltersOpen={isFiltersOpen} setIsFiltersOpen={setIsFiltersOpen} />
  ) : (
    <PublicApp isFiltersOpen={isFiltersOpen} setIsFiltersOpen={setIsFiltersOpen} />
  );
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

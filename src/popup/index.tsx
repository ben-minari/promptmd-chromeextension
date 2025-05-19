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
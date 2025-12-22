
import React from 'react';
import { SignupWizard } from '../components/auth/SignupWizard';
import { User } from '../types';

interface RegisterProps {
  onLogin: (user: User) => void;
}

export const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignupWizard onLogin={onLogin} />
    </div>
  );
};

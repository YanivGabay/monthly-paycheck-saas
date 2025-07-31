import React from 'react';
import { Shield } from 'lucide-react';
import { useAppStore } from '@/store';
import { LoginButton } from './LoginButton';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { auth } = useAppStore();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h1>
          
          <p className="text-gray-600 mb-8">
            Please sign in to access the Monthly Paycheck SaaS application. 
            We use secure Google authentication to protect your data.
          </p>
          
          <LoginButton />
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              🔒 Your data is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 
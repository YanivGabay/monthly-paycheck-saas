import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, FileText } from 'lucide-react';
import { LoginButton } from '@/components/auth/LoginButton';
import { UsageStats } from '@/components/auth/UsageStats';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 font-hebrew" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600 ml-3" />
              <h1 className="text-xl font-bold text-gray-900">
                עיבוד תלושי שכר
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <nav className="flex space-x-reverse space-x-8">
                <Link
                  to="/"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Home className="h-4 w-4 ml-2" />
                  דף הבית
                </Link>
                
                <Link
                  to="/setup"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/setup') 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-4 w-4 ml-2" />
                  הגדרת חברה
                </Link>
              </nav>
              
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="flex-1">
            {children}
          </div>
          
          <div className="w-80 hidden lg:block">
            <UsageStats />
          </div>
        </div>
      </main>
    </div>
  );
}; 
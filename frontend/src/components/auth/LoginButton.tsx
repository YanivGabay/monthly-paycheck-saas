
import { LogIn, User } from 'lucide-react';
import { useAppStore } from '@/store';

export function LoginButton() {
  const { auth, signIn, signOut } = useAppStore();

  if (auth.isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {auth.user?.picture ? (
            <img 
              src={auth.user.picture} 
              alt={auth.user.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-8 h-8 p-1 bg-gray-200 rounded-full" />
          )}
          <div className="text-sm">
            <div className="font-medium">{auth.user?.name}</div>
            <div className="text-gray-500">{auth.user?.email}</div>
          </div>
        </div>
        
        <button
          onClick={signOut}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      disabled={auth.isLoading}
      className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {auth.isLoading ? (
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <LogIn className="w-5 h-5 text-blue-600" />
      )}
      <span className="font-medium text-gray-700">
        {auth.isLoading ? 'Signing in...' : 'Sign in with Google'}
      </span>
    </button>
  );
} 
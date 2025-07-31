import React from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface StatusMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ 
  type, 
  message, 
  onClose 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'info':
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-md ${getStyles()}`}>
      <div className="flex items-center">
        {getIcon()}
        <span className="mr-3 text-sm font-medium">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="mr-auto p-1 rounded-md hover:bg-black hover:bg-opacity-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}; 
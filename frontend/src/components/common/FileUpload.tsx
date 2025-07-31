import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  accept: string;
  maxSize?: number; // in bytes
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  selectedFile?: File | null;
  isUploading?: boolean;
  disabled?: boolean;
  label: string;
  helpText?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  onFileSelect,
  onRemove,
  selectedFile,
  isUploading = false,
  disabled = false,
  label,
  helpText,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `הקובץ גדול מדי. גודל מקסימלי: ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedTypes.includes(fileExtension)) {
      return `סוג קובץ לא נתמך. קבצים מותרים: ${accept}`;
    }
    
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    onFileSelect(file);
  }, [onFileSelect, accept, maxSize]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || isUploading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile, disabled, isUploading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-lg font-medium text-gray-700">
        {label}
      </label>
      
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />
          
          <Upload className={`h-12 w-12 mx-auto mb-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          
          <p className="text-lg font-medium text-gray-900 mb-2">
            {dragActive ? 'שחרר כדי להעלות' : 'גרור קובץ לכאן או לחץ לבחירה'}
          </p>
          
          {helpText && (
            <p className="text-sm text-gray-500">{helpText}</p>
          )}
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-3">
              <FileText className="h-8 w-8 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            
            {onRemove && !isUploading && (
              <button
                onClick={onRemove}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                disabled={disabled}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
          
          {isUploading && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>מעלה...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full animate-pulse w-1/3"></div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="flex items-center space-x-reverse space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}; 
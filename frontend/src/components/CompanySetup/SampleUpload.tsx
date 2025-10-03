import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { FileUpload } from '@/components/common/FileUpload';
import { useAppStore } from '@/store';
import { setupApi } from '@/services/api';

export const SampleUpload: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const {
    setLoading,
    setError,
    setSuccessMessage,
    setPreviewUrl,
    setUploadedSampleId,
    setSetupStep,
    setCurrentCompany,
    saveCompanyToStorage
  } = useAppStore();

  const handleUpload = async () => {
    if (!selectedFile || !companyName.trim()) {
      setError('נא להזין שם חברה ולבחור קובץ PDF');
      return;
    }

    try {
      setIsUploading(true);
      setLoading(true);
      setError(null);

      const response = await setupApi.uploadSample(selectedFile, companyName.trim());
      
      // Create initial company template
      const initialTemplate = {
        company_id: response.company_id,
        company_name: companyName.trim(),
        name_crop_area: { x: 0, y: 0, width: 300, height: 80 }, // Default values
        employee_emails: {},
        ocr_confidence_threshold: 80,
        created_at: new Date().toISOString()
      };
      
      // Update store with response data
      setPreviewUrl(response.preview_url);
      setUploadedSampleId(response.company_id);
      setCurrentCompany(initialTemplate);
      
      // Save to localStorage (development will also save to server)
      saveCompanyToStorage(initialTemplate);
      
      setSuccessMessage('תלוש הדוגמה הועלה בהצלחה ונשמר במחשב שלך!');
      
      // Move to next step
      setSetupStep('crop');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.response?.data?.detail || 'שגיאה בהעלאת הקובץ');
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  const canUpload = companyName.trim() && selectedFile && !isUploading;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">העלאת תלוש דוגמה</h3>
        <p className="text-gray-600">
          העלה קובץ PDF של תלוש שכר לדוגמה כדי להגדיר את התבנית של החברה
        </p>
      </div>

      {/* Company Name Input */}
      <div className="space-y-2">
        <label className="block text-lg font-medium text-gray-700">
          שם החברה
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="לדוגמה: חברת הטכנולוגיה"
          className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          disabled={isUploading}
        />
      </div>

      {/* File Upload */}
      <FileUpload
        accept=".pdf"
        maxSize={10 * 1024 * 1024} // 10MB
        onFileSelect={setSelectedFile}
        onRemove={() => setSelectedFile(null)}
        selectedFile={selectedFile}
        isUploading={isUploading}
        disabled={isUploading}
        label="העלה תלוש שכר לדוגמה"
        helpText="קובץ PDF בלבד, עד 10MB"
      />

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          disabled={isUploading}
        >
          <ArrowLeft className="h-5 w-5 ml-2" />
          חזור
        </button>
        
        <button
          onClick={handleUpload}
          disabled={!canUpload}
          className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors ${
            canUpload
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isUploading ? 'מעלה...' : 'העלה ותמשיך'}
        </button>
      </div>
    </div>
  );
}; 
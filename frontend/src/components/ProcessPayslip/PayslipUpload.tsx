import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/store';
import { processingApi } from '@/services/api';
import { authService } from '@/services/authService';
import { FileUpload } from '@/components/common/FileUpload';
import { Results } from './Results';
import { RefreshCw } from 'lucide-react';

export function PayslipUpload() {
  const { companyId } = useParams<{ companyId: string }>();
  const {
    isLoading,
    setLoading,
    setError,
    setSuccessMessage,
    setProcessId,
    setPreviewResults,
    setEmailSendResults,
    clearProcessing,
    processId,
    previewResults,
    emailSendResults,
    setUsageStats,
  } = useAppStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Validate company ID
  if (!companyId || companyId.length < 3 || /^[^a-zA-Z0-9_-]+$/.test(companyId)) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-4">
            מזהה חברה לא תקין
          </h2>
          <p className="text-red-600 mb-4">
            מזהה החברה "{companyId}" אינו תקין או חסר.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            חזור לדף הבית
          </a>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Clear previous results when the component mounts or company changes
    clearProcessing();
    setSelectedFile(null);
  }, [companyId, clearProcessing]);

  const handleFileSelect = async (file: File) => {
    if (!companyId) return;

    setSelectedFile(file);
    setLoading(true);
    setError(null);
    // We clear previous results upon selection of a new file
    clearProcessing();

    try {
      const response = await processingApi.uploadAndPreview(file, companyId);
      setProcessId(response.process_id);
      setPreviewResults(response.preview);
      
      // Refresh usage stats after successful AI processing
      await refreshUsageStats();
      
      const matchedCount = response.preview.filter(r => r.found_match).length;
      if (matchedCount > 0) {
        setSuccessMessage(`עיבוד הושלם! נמצאו ${matchedCount} התאמות.`);
      } else {
        setError('לא נמצאו התאמות. בדוק את הגדרות החברה.');
      }
    } catch (err) {
      setError('עיבוד התלוש נכשל. אנא נסה שוב.');
      console.error(err);
      setSelectedFile(null); // Clear file on error
    } finally {
      setLoading(false);
    }
  };

  const refreshUsageStats = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUsageStats(userData.usage);
      }
    } catch (error) {
      console.error('Failed to refresh usage stats:', error);
    }
  };

  const handleSendEmails = async () => {
    if (!companyId || !processId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await processingApi.sendEmails(processId, companyId);
      setEmailSendResults(response.email_results);
      
      // Refresh usage stats after successful email sending
      await refreshUsageStats();
      
      const successCount = response.email_results.filter(r => r.email_sent).length;
      if (successCount > 0) {
        setSuccessMessage(`${successCount} מיילים נשלחו בהצלחה!`);
      }
    } catch (err) {
      setError('שליחת המיילים נכשלה. אנא נסה שוב.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryEmails = async () => {
    // Clear previous email results and try again
    setEmailSendResults([]);
    await handleSendEmails();
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    clearProcessing();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">עיבוד תלושי שכר</h1>
            <p className="text-gray-600 mt-2">חברה: <span className="font-medium">{companyId}</span></p>
          </div>
          
          {(processId || emailSendResults.length > 0) && (
            <button
              onClick={handleStartOver}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              התחל מחדש
            </button>
          )}
        </div>
      </div>
      
      {/* File Upload */}
      {!processId && emailSendResults.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <FileUpload
            label="העלה קובץ PDF של תלושי השכר"
            accept=".pdf"
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onRemove={() => {
              setSelectedFile(null);
              clearProcessing();
            }}
            isUploading={isLoading}
            helpText="העלה קובץ PDF רב-עמודים להתחלת העיבוד."
          />
        </div>
      )}

      {/* Results */}
      {(previewResults.length > 0 || emailSendResults.length > 0) && (
        <Results 
          onSendEmails={handleSendEmails}
          onRetryEmails={handleRetryEmails}
          isLoading={isLoading}
          processId={processId}
        />
      )}
    </div>
  );
} 
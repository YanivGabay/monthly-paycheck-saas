import React, { useState } from 'react';
import { ArrowLeft, Play, CheckCircle, XCircle, User, Mail, Eye, Zap } from 'lucide-react';
import { useAppStore } from '@/store';
import { setupApi } from '@/services/api';
import { ProcessingResult } from '@/types';
import { FileUpload } from '@/components/common/FileUpload';

export const TestTemplate: React.FC = () => {
  const [testResults, setTestResults] = useState<ProcessingResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [testFile, setTestFile] = useState<File | null>(null);

  const {
    currentCompany,
    setLoading,
    setError,
    setSuccessMessage,
    setSetupStep,
    addCompany,
    saveCompanyToStorage
  } = useAppStore();

  const runTest = async () => {
    if (!currentCompany) {
      setError('לא נמצאו נתוני חברה');
      return;
    }

    if (!testFile) {
      setError('נא לבחור קובץ PDF לבדיקה');
      return;
    }

    try {
      setIsTesting(true);
      setLoading(true);
      setError(null);

      const response = await setupApi.testTemplate(testFile, currentCompany);
      
      setTestResults(response.results);
      setHasRun(true);
      
      const successCount = response.results.filter(r => r.matched_employee).length;
      if (successCount > 0) {
        setSuccessMessage(`בדיקה הושלמה! נמצאו ${successCount} התאמות.`);
      } else {
        setError('לא נמצאו התאמות. בדוק את הגדרות החברה.');
      }

    } catch (error: any) {
      console.error('Test template error:', error);
      setError(error.response?.data?.detail || 'שגיאה בבדיקת התבנית');
    } finally {
      setIsTesting(false);
      setLoading(false);
    }
  };

  const completeSetup = () => {
    if (currentCompany) {
      // Ensure company is saved to localStorage
      saveCompanyToStorage(currentCompany);
      
      // Add company to the global list in store
      addCompany(currentCompany);
      
      setSuccessMessage('הגדרת החברה הושלמה בהצלחה ונשמרה במחשב שלך!');
    }
    setSetupStep('complete');
  };

  const goBack = () => {
    setSetupStep('employees');
  };

  const getResultIcon = (result: ProcessingResult) => {
    if (result.matched_employee) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (result.extracted_name) {
      return <XCircle className="h-5 w-5 text-yellow-600" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getResultStatus = (result: ProcessingResult): { text: string; color: string } => {
    if (result.matched_employee) {
      return { text: 'עובד זוהה בהצלחה', color: 'text-green-700' };
    } else if (result.extracted_name) {
      return { text: 'שם חולץ אך לא נמצא ברשימה', color: 'text-yellow-700' };
    } else {
      return { text: 'לא זוהה שם', color: 'text-red-700' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">בדיקת התבנית</h3>
        <p className="text-gray-600">
          בדוק את התבנית עם תלוש הדוגמה כדי לוודא שהיא עובדת תקין
        </p>
      </div>

      {/* Company Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">סיכום ההגדרות:</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>שם החברה:</strong> {currentCompany?.company_name}</p>
          <p>• <strong>אזור השם:</strong> {currentCompany?.name_crop_area.width}×{currentCompany?.name_crop_area.height} פיקסלים</p>
          <p>• <strong>מספר עובדים:</strong> {Object.keys(currentCompany?.employee_emails || {}).length}</p>
        </div>
      </div>

      {/* File Upload for Testing */}
      {!hasRun && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">העלה קובץ PDF לבדיקה</h4>
          <FileUpload
            label="בחר קובץ PDF לבדיקת התבנית"
            accept=".pdf"
            onFileSelect={setTestFile}
            selectedFile={testFile}
            onRemove={() => setTestFile(null)}
            helpText="העלה קובץ PDF דוגמה לבדיקת התבנית"
          />
        </div>
      )}

      {/* Test Button */}
      {!hasRun && testFile && (
        <div className="text-center py-8">
          <button
            onClick={runTest}
            disabled={isTesting}
            className={`inline-flex items-center px-8 py-4 rounded-lg text-lg font-semibold transition-colors ${
              isTesting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                בודק התבנית...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 ml-2" />
                בדוק התבנית עם AI Vision
              </>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            זה ייקח כמה שניות לעיבוד עם Gemini AI
          </p>
        </div>
      )}

      {/* Test Results */}
      {hasRun && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-gray-900">תוצאות הבדיקה</h4>
            <button
              onClick={runTest}
              disabled={isTesting}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              בדוק שוב
            </button>
          </div>

          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <XCircle className="h-12 w-12 mx-auto mb-2 text-red-400" />
              <p>לא נמצאו תוצאות. ייתכן שצריך לכוון את אזור השם.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-reverse space-x-3">
                      {getResultIcon(result)}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-reverse space-x-2">
                          <span className="font-medium text-gray-900">
                            עמוד {result.page}
                          </span>
                          <span className={`text-sm ${getResultStatus(result).color}`}>
                            {getResultStatus(result).text}
                          </span>
                        </div>
                        
                        {result.extracted_name && (
                          <div className="flex items-center space-x-reverse space-x-2 text-sm text-gray-600">
                            <Zap className="h-4 w-4" />
                            <span>שם שחולץ: <strong>{result.extracted_name}</strong></span>
                            <span className="text-blue-600">({result.confidence}% ביטחון)</span>
                          </div>
                        )}
                        
                        {result.matched_employee && (
                          <div className="bg-green-50 rounded p-2 mt-2">
                            <div className="flex items-center space-x-reverse space-x-2 text-sm text-green-700">
                              <User className="h-4 w-4" />
                              <span>עובד: {result.matched_employee.name}</span>
                            </div>
                            <div className="flex items-center space-x-reverse space-x-2 text-sm text-green-700">
                              <Mail className="h-4 w-4" />
                              <span>אימייל: {result.matched_employee.email}</span>
                            </div>
                          </div>
                        )}
                        
                        {result.ai_crop_image_path && (
                          <div className="mt-2">
                            <button className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700">
                              <Eye className="h-3 w-3 ml-1" />
                              הצג תמונת חיתוך AI
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Summary */}
          {testResults.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">סיכום:</h5>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.filter(r => r.matched_employee).length}
                  </div>
                  <div className="text-gray-600">עובדים זוהו</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {testResults.filter(r => r.extracted_name && !r.matched_employee).length}
                  </div>
                  <div className="text-gray-600">שמות לא מזוהים</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {testResults.filter(r => !r.extracted_name).length}
                  </div>
                  <div className="text-gray-600">אזורים ריקים</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          disabled={isTesting}
        >
          <ArrowLeft className="h-5 w-5 ml-2" />
          חזור לעריכה
        </button>
        
        <button
          onClick={completeSetup}
          disabled={isTesting || !hasRun}
          className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-semibold transition-colors ${
            hasRun && !isTesting
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="h-5 w-5 ml-2" />
          סיים הגדרה
        </button>
      </div>
    </div>
  );
}; 
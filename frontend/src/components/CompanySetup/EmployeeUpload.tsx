import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Users, Download, AlertCircle } from 'lucide-react';
import { FileUpload } from '@/components/common/FileUpload';
import { useAppStore } from '@/store';
import { setupApi } from '@/services/api';

interface ParsedEmployee {
  name: string;
  email: string;
  lineNumber: number;
}

export const EmployeeUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedEmployees, setParsedEmployees] = useState<ParsedEmployee[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    currentCompany,
    setLoading,
    setError,
    setSuccessMessage,
    setSetupStep,
    updateCompany,
    saveCompanyToStorage
  } = useAppStore();

  const parseCSV = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length < 2) {
        setParseErrors(['קובץ ה-CSV חייב להכיל לפחות שורת כותרת ושורה אחת של נתונים']);
        setParsedEmployees([]);
        return;
      }

      const employees: ParsedEmployee[] = [];
      const errors: string[] = [];

      // Skip header line (assume first line is header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(',').map(part => part.trim());
        
        if (parts.length >= 2) {
          const name = parts[0];
          const email = parts[1];
          
          if (name && email) {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(email)) {
              employees.push({
                name,
                email,
                lineNumber: i + 1
              });
            } else {
              errors.push(`שורה ${i + 1}: כתובת אימייל לא תקינה - ${email}`);
            }
          } else {
            errors.push(`שורה ${i + 1}: חסרים נתונים (שם או אימייל)`);
          }
        } else {
          errors.push(`שורה ${i + 1}: פורמט לא תקין - נדרשים לפחות 2 שדות מופרדים בפסיק`);
        }
      }

      setParsedEmployees(employees);
      setParseErrors(errors);
      
    } catch (error) {
      setParseErrors(['שגיאה בקריאת קובץ ה-CSV']);
      setParsedEmployees([]);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    parseCSV(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentCompany) {
      setError('לא נבחר קובץ או לא נמצאו נתוני חברה');
      return;
    }

    if (parsedEmployees.length === 0) {
      setError('לא נמצאו עובדים תקינים בקובץ');
      return;
    }

    try {
      setIsUploading(true);
      setLoading(true);
      setError(null);

      // Pass current company config to API
      const response = await setupApi.uploadEmployees(selectedFile, currentCompany);
      
      // Save the returned updated template to localStorage
      if (response.template) {
        saveCompanyToStorage(response.template);
        
        // Update company in store with employee data
        const employeeEmails = parsedEmployees.reduce((acc, emp) => {
          acc[emp.name] = emp.email;
          return acc;
        }, {} as Record<string, string>);

        updateCompany(currentCompany.company_id, {
          employee_emails: employeeEmails
        });
      }

      setSuccessMessage(`${response.message} (נשמר במחשב שלך)`);
      setSetupStep('test');

    } catch (error: any) {
      console.error('Upload employees error:', error);
      setError(error.response?.data?.detail || 'שגיאה בהעלאת רשימת העובדים');
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'שם,אימייל\nיוסף כהן,yosef@company.com\nמרים לוי,miriam@company.com\nדוד שלמה,david@company.com';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employees_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goBack = () => {
    setSetupStep('crop');
  };

  const canUpload = selectedFile && parsedEmployees.length > 0 && !isUploading;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">העלאת רשימת עובדים</h3>
        <p className="text-gray-600 mb-4">
          העלה קובץ CSV עם רשימת העובדים של החברה (שם ואימייל)
        </p>
      </div>

      {/* CSV Format Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">פורמט הקובץ:</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• קובץ CSV עם שורת כותרת</p>
          <p>• עמודה ראשונה: שם העובד</p>
          <p>• עמודה שנייה: כתובת אימייל</p>
          <p>• הפרדה בפסיק (,)</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="mt-3 inline-flex items-center text-sm text-blue-700 hover:text-blue-900"
        >
          <Download className="h-4 w-4 ml-1" />
          הורד תבנית לדוגמה
        </button>
      </div>

      {/* File Upload */}
      <FileUpload
        accept=".csv"
        maxSize={5 * 1024 * 1024} // 5MB
        onFileSelect={handleFileSelect}
        onRemove={() => {
          setSelectedFile(null);
          setParsedEmployees([]);
          setParseErrors([]);
        }}
        selectedFile={selectedFile}
        isUploading={isUploading}
        disabled={isUploading}
        label="העלה קובץ CSV עם עובדים"
        helpText="קובץ CSV בלבד, עד 5MB"
      />

      {/* Parse Errors */}
      {parseErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-600 ml-2" />
            <h4 className="font-semibold text-red-900">שגיאות בקובץ:</h4>
          </div>
          <ul className="text-sm text-red-800 space-y-1">
            {parseErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Parsed Employees Preview */}
      {parsedEmployees.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-green-600 ml-2" />
              <h4 className="font-semibold text-green-900">
                נמצאו {parsedEmployees.length} עובדים תקינים
              </h4>
            </div>
          </div>
          
          <div className="max-h-40 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-200">
                  <th className="text-right py-1 text-green-800">שם</th>
                  <th className="text-right py-1 text-green-800">אימייל</th>
                </tr>
              </thead>
              <tbody>
                {parsedEmployees.slice(0, 10).map((employee, index) => (
                  <tr key={index} className="border-b border-green-100">
                    <td className="py-1 text-green-700">{employee.name}</td>
                    <td className="py-1 text-green-700">{employee.email}</td>
                  </tr>
                ))}
                {parsedEmployees.length > 10 && (
                  <tr>
                    <td colSpan={2} className="py-1 text-green-600 text-center">
                      ועוד {parsedEmployees.length - 10} עובדים...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          disabled={isUploading}
        >
          <ArrowLeft className="h-5 w-5 ml-2" />
          חזור
        </button>
        
        <button
          onClick={handleUpload}
          disabled={!canUpload}
          className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-semibold transition-colors ${
            canUpload
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isUploading ? 'מעלה...' : `העלה ${parsedEmployees.length} עובדים`}
          <ArrowRight className="h-5 w-5 mr-2" />
        </button>
      </div>
    </div>
  );
}; 
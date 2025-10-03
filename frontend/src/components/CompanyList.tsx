import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CompanyTemplate } from '@/types';
import { useAppStore } from '@/store';
import { CompanyConfigService } from '@/services/companyConfigService';
import { Building2, FileText, Users, Settings, ArrowLeft, Trash2, CheckCircle, Download, Upload } from 'lucide-react';

export const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setError, setSuccessMessage, auth } = useAppStore();

  const loadCompanies = () => {
    try {
      setIsLoading(true);
      const loadedCompanies = CompanyConfigService.getCompanyList();
      setCompanies(loadedCompanies);
    } catch (error: any) {
      console.error('Error loading companies:', error);
      setError('Failed to load companies from storage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל ההגדרות ולהתחיל מחדש?')) {
      try {
        CompanyConfigService.clearAllConfigs();
        setCompanies([]);
        setSuccessMessage('כל ההגדרות נמחקו בהצלחה');
      } catch (error: any) {
        setError('Failed to delete configurations');
      }
    }
  };

  const handleDeleteCompany = (companyId: string, companyName: string) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את החברה "${companyName}"?`)) {
      try {
        CompanyConfigService.deleteConfig(companyId);
        setCompanies(companies.filter(c => c.company_id !== companyId));
        setSuccessMessage(`החברה "${companyName}" נמחקה בהצלחה`);
      } catch (error: any) {
        setError('Failed to delete company');
      }
    }
  };

  const handleExportConfigs = () => {
    try {
      CompanyConfigService.exportConfigs();
      setSuccessMessage('הגדרות החברות יוצאו בהצלחה');
    } catch (error: any) {
      setError('Failed to export configurations');
    }
  };

  const handleImportConfigs = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedCount = await CompanyConfigService.importConfigs(file);
      loadCompanies(); // Reload companies after import
      setSuccessMessage(`${importedCount} הגדרות חברות יובאו בהצלחה`);
    } catch (error: any) {
      setError('Failed to import configurations');
    }
    
    // Reset file input
    event.target.value = '';
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">טוען חברות...</p>
      </div>
    );
  }

  // Empty state for first-time users
  if (companies.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
            <Building2 className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ברוכים הבאים למערכת עיבוד תלושי השכר! 🎉
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            כדי להתחיל לעבד תלושי שכר באופן אוטומטי, תחילה צריך להגדיר את החברה שלך
          </p>
        </div>

        {/* Getting Started Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Settings className="h-6 w-6 text-primary-600 ml-3" />
            בואו נתחיל!
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">העלאת דוגמה</h3>
              <p className="text-sm text-gray-600">העלה קובץ PDF לדוגמה של תלוש שכר</p>
            </div>
            
            <div className="text-center p-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">הגדרת אזור</h3>
              <p className="text-sm text-gray-600">סמן את האזור שבו מופיע שם העובד</p>
            </div>
            
            <div className="text-center p-4">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">רשימת עובדים</h3>
              <p className="text-sm text-gray-600">העלה רשימה של שמות ומיילים של העובדים</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/setup"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
            >
              <Settings className="h-5 w-5 ml-2" />
              התחל הגדרת חברה
              <ArrowLeft className="h-5 w-5 mr-2" />
            </Link>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-l from-blue-50 to-primary-50 rounded-xl p-6 border border-primary-200">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {auth.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="mr-4">
              <h3 className="font-semibold text-gray-900">שלום, {auth.user?.name}!</h3>
              <p className="text-sm text-gray-600">{auth.user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Companies list view
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">החברות שלי</h1>
          <p className="text-gray-600 mt-2">נהל את הגדרות עיבוד תלושי השכר (נשמר במחשב שלך)</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/setup"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
          >
            <Settings className="h-4 w-4 ml-2" />
            הוסף חברה חדשה
          </Link>
          
          {companies.length > 0 && (
            <>
              <button
                onClick={handleExportConfigs}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Download className="h-4 w-4 ml-2" />
                יצא הגדרות
              </button>
              
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center cursor-pointer">
                <Upload className="h-4 w-4 ml-2" />
                יבא הגדרות
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportConfigs}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                מחק הכל
              </button>
            </>
          )}
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {companies.map((company) => (
          <div key={company.company_id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{company.company_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">מזהה: {company.company_id}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                    <span className="text-sm text-green-600">מוכן לעיבוד</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link
                  to={`/process/${company.company_id}`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center text-sm"
                >
                  <FileText className="h-4 w-4 ml-2" />
                  עבד תלושים
                </Link>
                <button
                  onClick={() => handleDeleteCompany(company.company_id, company.company_name)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center text-sm"
                  title="מחק חברה"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Company Details */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">עובדים רשומים:</span>
                  <span className="font-medium mr-2">
                    {Object.keys(company.employee_emails || {}).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">נוצר:</span>
                  <span className="font-medium mr-2">
                    {company.created_at 
                      ? new Date(company.created_at).toLocaleDateString('he-IL')
                      : 'לא זמין'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 
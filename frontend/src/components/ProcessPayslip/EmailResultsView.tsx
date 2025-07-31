import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import { EmailSendResult } from '@/types';

interface EmailResultsViewProps {
  emailSendResults: EmailSendResult[];
  onRetryEmails?: () => void;
  isLoading?: boolean;
}

export function EmailResultsView({ emailSendResults, onRetryEmails, isLoading }: EmailResultsViewProps) {
  const successCount = emailSendResults.filter(r => r.email_sent).length;
  const failedCount = emailSendResults.length - successCount;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Mail className="h-6 w-6 text-blue-600 ml-3" />
            תוצאות שליחת מיילים
          </h2>
          
          {failedCount > 0 && onRetryEmails && (
            <button
              onClick={onRetryEmails}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
              נסה שוב לכושלים
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-sm text-green-700">נשלחו בהצלחה</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="text-sm text-red-700">נכשלו</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{emailSendResults.length}</div>
            <div className="text-sm text-blue-700">סה"כ ניסיונות</div>
          </div>
        </div>

        {/* Results table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">עמוד</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">שם עובד</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">מייל</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סטטוס</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פרטים</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {emailSendResults.map((result, index) => (
                <tr key={index} className={result.email_sent ? 'bg-green-50' : 'bg-red-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-right">{result.page}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">{result.employee_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-blue-600">{result.employee_email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {result.email_sent ? (
                      <span className="flex items-center text-green-600 justify-end">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        נשלח
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 justify-end">
                        <XCircle className="h-5 w-5 mr-2" />
                        נכשל
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {result.email_detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
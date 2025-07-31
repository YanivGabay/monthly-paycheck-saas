import { CheckCircle, XCircle, User } from 'lucide-react';
import { PreviewResult } from '@/types';

interface PreviewResultsTableProps {
  previewResults: PreviewResult[];
  matchedResults: PreviewResult[];
  selectedResults: Set<number>;
  onSelectResult: (index: number, checked: boolean) => void;
}

export function PreviewResultsTable({
  previewResults,
  matchedResults,
  selectedResults,
  onSelectResult
}: PreviewResultsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">בחר</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">עמוד</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">שם עובד</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">מייל</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סטטוס</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {previewResults.map((result, index) => {
            const isMatched = result.found_match;
            const matchedIndex = matchedResults.findIndex(m => m.page === result.page);
            
            return (
              <tr key={index} className={isMatched ? 'bg-green-50' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {isMatched && (
                    <input
                      type="checkbox"
                      checked={selectedResults.has(matchedIndex)}
                      onChange={(e) => onSelectResult(matchedIndex, e.target.checked)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">{result.page}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {isMatched ? (
                    <div className="flex items-center justify-end">
                      <User className="h-4 w-4 text-green-600 mr-2" />
                      <span className="font-medium">{result.employee_name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">לא נמצא</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {isMatched ? (
                    <span className="text-blue-600">{result.employee_email}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {isMatched ? (
                    <span className="flex items-center text-green-600 justify-end">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      התאמה נמצאה
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 justify-end">
                      <XCircle className="h-5 w-5 mr-2" />
                      אין התאמה
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
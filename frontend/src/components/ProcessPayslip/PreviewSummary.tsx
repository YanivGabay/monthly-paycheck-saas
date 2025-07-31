import { Eye, FileText } from 'lucide-react';

interface PreviewSummaryProps {
  totalPages: number;
  matchedCount: number;
  selectedCount: number;
  processId?: string | null;
  showPdfPreview: boolean;
  onTogglePdfPreview: () => void;
}

export function PreviewSummary({ 
  totalPages, 
  matchedCount, 
  selectedCount, 
  processId, 
  showPdfPreview, 
  onTogglePdfPreview 
}: PreviewSummaryProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Eye className="h-6 w-6 text-primary-600 ml-3" />
          תצוגה מקדימה - תוצאות עיבוד
        </h2>
        
        {processId && (
          <button
            onClick={onTogglePdfPreview}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <FileText className="h-4 w-4 ml-2" />
            {showPdfPreview ? 'הסתר PDF' : 'הצג PDF'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalPages}</div>
          <div className="text-sm text-blue-700">סה"כ עמודים</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{matchedCount}</div>
          <div className="text-sm text-green-700">התאמות נמצאו</div>
        </div>
        <div className="bg-primary-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{selectedCount}</div>
          <div className="text-sm text-primary-700">נבחרו לשליחה</div>
        </div>
      </div>
    </div>
  );
}
import { FileText } from 'lucide-react';

interface PdfPreviewSectionProps {
  processId: string;
  isVisible: boolean;
}

export function PdfPreviewSection({ processId, isVisible }: PdfPreviewSectionProps) {
  if (!isVisible) return null;

  return (
    <div className="mb-6 bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">תצוגה מקדימה של הקובץ</h3>
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">תצוגה מקדימה של PDF תתווסף בעדכון הבא</p>
        <p className="text-sm text-gray-500 mt-2">מזהה עיבוד: {processId}</p>
      </div>
    </div>
  );
}
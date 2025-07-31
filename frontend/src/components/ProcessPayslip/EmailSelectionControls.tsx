import { Mail } from 'lucide-react';

interface EmailSelectionControlsProps {
  selectedCount: number;
  totalMatched: number;
  isSelectAll: boolean;
  isLoading: boolean;
  onSelectAll: (checked: boolean) => void;
  onSendEmails: () => void;
}

export function EmailSelectionControls({
  selectedCount,
  totalMatched,
  isSelectAll,
  isLoading,
  onSelectAll,
  onSendEmails
}: EmailSelectionControlsProps) {
  if (totalMatched === 0) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">בחירת מיילים לשליחה</h3>
        
        <div className="flex gap-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isSelectAll}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="ml-2 text-primary-600 focus:ring-primary-500"
            />
            בחר הכל
          </label>
          
          <button
            onClick={onSendEmails}
            disabled={selectedCount === 0 || isLoading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 flex items-center"
          >
            <Mail className="h-4 w-4 ml-2" />
            {isLoading ? 'שולח...' : `שלח ${selectedCount} מיילים`}
          </button>
        </div>
      </div>
    </div>
  );
}
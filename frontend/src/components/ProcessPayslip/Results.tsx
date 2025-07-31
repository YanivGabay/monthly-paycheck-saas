import { useState } from 'react';
import { useAppStore } from '@/store';
import { EmailResultsView } from './EmailResultsView';
import { PreviewSummary } from './PreviewSummary';
import { PdfPreviewSection } from './PdfPreviewSection';
import { EmailSelectionControls } from './EmailSelectionControls';
import { PreviewResultsTable } from './PreviewResultsTable';
import { EmptyMatchesState } from './EmptyMatchesState';

interface ResultsProps {
  onSendEmails?: (selectedResults: any[]) => void;
  onRetryEmails?: () => void;
  isLoading?: boolean;
  processId?: string | null;
}

export function Results({ onSendEmails, onRetryEmails, isLoading, processId }: ResultsProps) {
  const { previewResults, emailSendResults } = useAppStore();
  
  const isEmailSendView = emailSendResults.length > 0;
  const matchedResults = previewResults.filter(r => r.found_match);
  
  // State for checkbox selections
  const [selectedResults, setSelectedResults] = useState<Set<number>>(
    new Set(matchedResults.map((_, index) => index))
  );
  
  // State for PDF preview
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(new Set(matchedResults.map((_, index) => index)));
    } else {
      setSelectedResults(new Set());
    }
  };

  const handleSelectResult = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedResults);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedResults(newSelected);
  };

  const handleSendSelected = () => {
    const selected = matchedResults.filter((_, index) => selectedResults.has(index));
    onSendEmails?.(selected);
  };

  if (previewResults.length === 0 && emailSendResults.length === 0) {
    return <p className="text-center text-gray-500">אין תוצאות להציג עדיין.</p>;
  }

  // Email send results view
  if (isEmailSendView) {
    return (
      <EmailResultsView 
        emailSendResults={emailSendResults}
        onRetryEmails={onRetryEmails}
        isLoading={isLoading}
      />
    );
  }

  // Preview view with checkboxes
  return (
    <div className="space-y-6">
      <PreviewSummary
        totalPages={previewResults.length}
        matchedCount={matchedResults.length}
        selectedCount={selectedResults.size}
        processId={processId}
        showPdfPreview={showPdfPreview}
        onTogglePdfPreview={() => setShowPdfPreview(!showPdfPreview)}
      />

      <PdfPreviewSection 
        processId={processId || ''}
        isVisible={showPdfPreview && !!processId}
      />

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <EmailSelectionControls
          selectedCount={selectedResults.size}
          totalMatched={matchedResults.length}
          isSelectAll={selectedResults.size === matchedResults.length}
          isLoading={isLoading || false}
          onSelectAll={handleSelectAll}
          onSendEmails={handleSendSelected}
        />

        <PreviewResultsTable
          previewResults={previewResults}
          matchedResults={matchedResults}
          selectedResults={selectedResults}
          onSelectResult={handleSelectResult}
        />

        {matchedResults.length === 0 && <EmptyMatchesState />}
      </div>
    </div>
  );
} 
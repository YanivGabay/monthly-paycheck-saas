import { XCircle } from 'lucide-react';

export function EmptyMatchesState() {
  return (
    <div className="text-center py-8">
      <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">לא נמצאו התאמות</h3>
      <p className="text-gray-600">
        אף עובד לא זוהה בתלושי השכר. בדוק את הגדרות החברה ונסה שוב.
      </p>
    </div>
  );
}
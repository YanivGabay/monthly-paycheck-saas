import React from 'react';
import { useAppStore } from '@/store';
import { SampleUpload } from './SampleUpload';
import { CropAreaSelector } from './CropAreaSelector';
import { EmployeeUpload } from './EmployeeUpload';
import { TestTemplate } from './TestTemplate';

export const SetupWizard: React.FC = () => {
  const { setupStep } = useAppStore();

  const renderStep = () => {
    switch (setupStep) {
      case 'upload':
        return <SampleUpload />;
      case 'crop':
        return <CropAreaSelector />;
      case 'employees':
        return <EmployeeUpload />;
      case 'test':
        return <TestTemplate />;
      case 'complete':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              הגדרת החברה הושלמה בהצלחה! ✅
            </h2>
            <p className="text-gray-600">
              כעת תוכל לעבד תלושי שכר עבור החברה שלך
            </p>
          </div>
        );
      default:
        return <SampleUpload />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          הגדרת חברה חדשה
        </h1>
        <p className="text-lg text-gray-600">
          הגדר את התבנית של תלושי השכר של החברה שלך
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-center">
          <div className="flex items-center space-x-reverse space-x-4">
            {[
              { step: 'upload', label: 'העלאת דוגמה' },
              { step: 'crop', label: 'בחירת אזור' },
              { step: 'employees', label: 'העלאת עובדים' },
              { step: 'test', label: 'בדיקה' },
            ].map(({ step, label }, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    setupStep === step
                      ? 'bg-primary-600 text-white'
                      : index < ['upload', 'crop', 'employees', 'test'].indexOf(setupStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="mr-3 text-sm font-medium text-gray-700">
                  {label}
                </span>
                {index < 3 && (
                  <div className="w-8 h-px bg-gray-300 mx-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {renderStep()}
      </div>
    </div>
  );
}; 
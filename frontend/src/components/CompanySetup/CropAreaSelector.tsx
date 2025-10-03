import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Crosshair } from 'lucide-react';
import { useAppStore } from '@/store';
import { setupApi } from '@/services/api';

export const CropAreaSelector: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 300, height: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const {
    previewUrl,
    currentCompany,
    setLoading,
    setError,
    setSuccessMessage,
    setSetupStep,
    updateCompany,
    saveCompanyToStorage
  } = useAppStore();

  useEffect(() => {
    if (previewUrl && imgRef.current) {
      imgRef.current.onload = () => {
        setImageLoaded(true);
        drawCanvas();
        // Set initial crop area to center
        if (imgRef.current) {
          const img = imgRef.current;
          setCropArea({
            x: Math.max(0, (img.width - 300) / 2),
            y: Math.max(0, (img.height - 80) / 2),
            width: 300,
            height: 80
          });
        }
      };
    }
  }, [previewUrl]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [cropArea, imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image
    ctx.drawImage(img, 0, 0);

    // Draw overlay (darken everything except crop area)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear the crop area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Draw crop border
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    // Check if click is inside crop area
    if (pos.x >= cropArea.x && pos.x <= cropArea.x + cropArea.width &&
        pos.y >= cropArea.y && pos.y <= cropArea.y + cropArea.height) {
      setIsDragging(true);
      setDragStart({
        x: pos.x - cropArea.x,
        y: pos.y - cropArea.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newX = Math.max(0, Math.min(pos.x - dragStart.x, canvas.width - cropArea.width));
    const newY = Math.max(0, Math.min(pos.y - dragStart.y, canvas.height - cropArea.height));

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    if (!currentCompany) {
      setError('לא נמצאו נתוני חברה');
      return;
    }

    try {
      setIsSaving(true);
      setLoading(true);
      setError(null);

      const response = await setupApi.saveCropArea(
        currentCompany.company_id,
        currentCompany.company_name,
        cropArea
      );

      // Save the returned template to localStorage
      if (response.template) {
        saveCompanyToStorage(response.template);
        
        // Update company in store
        updateCompany(currentCompany.company_id, {
          name_crop_area: cropArea
        });
      }

      setSuccessMessage('אזור השם נשמר בהצלחה במחשב שלך!');
      setSetupStep('employees');

    } catch (error: any) {
      console.error('Save crop area error:', error);
      setError(error.response?.data?.detail || 'שגיאה בשמירת אזור השם');
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const goBack = () => {
    setSetupStep('upload');
  };

  if (!previewUrl) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">לא נמצא תלוש לתצוגה מקדימה</p>
        <button onClick={goBack} className="mt-4 text-primary-600 hover:text-primary-700">
          חזור לשלב הקודם
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">בחירת אזור השם</h3>
        <p className="text-gray-600 mb-4">
          גרור את המלבן הכחול למקום שבו מופיע שם העובד בתלוש השכר
        </p>
        <div className="flex items-center space-x-reverse space-x-2 text-sm text-gray-600">
          <Crosshair className="h-4 w-4" />
          <span>גודל קבוע: 300×80 פיקסלים - אופטימלי לזיהוי שמות</span>
        </div>
      </div>

      {/* Image and Canvas Container */}
      <div className="relative border border-gray-300 rounded-lg overflow-hidden">
        <img
          ref={imgRef}
          src={previewUrl}
          alt="תצוגה מקדימה של התלוש"
          className="hidden"
        />
        
        {imageLoaded && (
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        )}
        
        {!imageLoaded && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="mr-3 text-gray-600">טוען תצוגה מקדימה...</span>
          </div>
        )}
      </div>

      {/* Crop Area Info */}
      {imageLoaded && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">פרטי אזור השם:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>מיקום X: {Math.round(cropArea.x)}</div>
            <div>מיקום Y: {Math.round(cropArea.y)}</div>
            <div>רוחב: {cropArea.width}</div>
            <div>גובה: {cropArea.height}</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          disabled={isSaving}
        >
          <ArrowLeft className="h-5 w-5 ml-2" />
          חזור
        </button>
        
        <button
          onClick={handleSave}
          disabled={!imageLoaded || isSaving}
          className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-semibold transition-colors ${
            imageLoaded && !isSaving
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSaving ? 'שומר...' : 'שמור ותמשיך'}
          <ArrowRight className="h-5 w-5 mr-2" />
        </button>
      </div>
    </div>
  );
}; 
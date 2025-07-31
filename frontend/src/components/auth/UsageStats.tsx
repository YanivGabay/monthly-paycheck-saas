import { Brain, Mail, Upload } from 'lucide-react';
import { useAppStore } from '@/store';

export function UsageStats() {
  const { auth } = useAppStore();

  if (!auth.isAuthenticated || !auth.usage) {
    return null;
  }

  const { usage } = auth;

  const getProgressColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const stats = [
    {
      icon: Brain,
      label: 'AI Calls',
      used: usage.ai_calls.used,
      limit: usage.ai_calls.limit,
      color: 'text-purple-600',
    },
    {
      icon: Mail,
      label: 'Emails',
      used: usage.email_sends.used,
      limit: usage.email_sends.limit,
      color: 'text-blue-600',
    },
    {
      icon: Upload,
      label: 'Uploads',
      used: usage.pdf_uploads.used,
      limit: usage.pdf_uploads.limit,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Today's Usage</h3>
      
      <div className="space-y-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const percentage = (stat.used / stat.limit) * 100;
          
          return (
            <div key={stat.label} className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${stat.color}`} />
              
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{stat.label}</span>
                  <span className="text-gray-900 font-medium">
                    {stat.used}/{stat.limit}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(stat.used, stat.limit)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Limits reset daily at midnight
        </p>
      </div>
    </div>
  );
} 
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationSettingsProps {
  onClose: () => void;
}

const NotificationSettings = ({ onClose }: NotificationSettingsProps) => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState(user?.notificationSettings || {
    email: {
      courseUpdates: true,
      progressReports: true,
      newFeatures: true
    },
    push: {
      lessonReminders: true,
      assessmentResults: true,
      achievements: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateUser({ notificationSettings: settings });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
        checked ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
      onClick={onChange}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-lg relative">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>

      <h3 className="text-xl font-semibold mb-4">Notification Settings</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Email Notifications</h4>
          <div className="space-y-3">
            {Object.entries(settings.email).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <Toggle
                  checked={value}
                  onChange={() => setSettings(prev => ({
                    ...prev,
                    email: { ...prev.email, [key]: !value }
                  }))}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Push Notifications</h4>
          <div className="space-y-3">
            {Object.entries(settings.push).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <Toggle
                  checked={value}
                  onChange={() => setSettings(prev => ({
                    ...prev,
                    push: { ...prev.push, [key]: !value }
                  }))}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : success ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            'Save Preferences'
          )}
        </button>
      </form>
    </div>
  );
};

export default NotificationSettings;
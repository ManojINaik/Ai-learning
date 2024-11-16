import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileSettingsProps {
  onClose: () => void;
}

const ProfileSettings = ({ onClose }: ProfileSettingsProps) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    preferences: user?.preferences || {
      emailNotifications: true,
      pushNotifications: true
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
      await updateUser({
        name: formData.name,
        bio: formData.bio,
        preferences: formData.preferences
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg relative">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>

      <h3 className="text-xl font-semibold mb-4">Profile Settings</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Preferences</h4>
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Email Notifications</span>
            <input
              type="checkbox"
              checked={formData.preferences.emailNotifications}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  emailNotifications: e.target.checked
                }
              }))}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Push Notifications</span>
            <input
              type="checkbox"
              checked={formData.preferences.pushNotifications}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  pushNotifications: e.target.checked
                }
              }))}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
          </label>
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
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
import React, { useState } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    maintenanceMode: false,
    userRegistration: true,
    contentModeration: true,
    analyticsTracking: true,
    backupFrequency: 'daily'
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // In a real app, you would save these settings to Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600">Configure global platform settings and preferences</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
          <CheckCircle className="h-5 w-5 mr-2" />
          Settings saved successfully
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailNotifications: e.target.checked
                    }))}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Maintenance Mode</span>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maintenanceMode: e.target.checked
                    }))}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">User Registration</span>
                  <input
                    type="checkbox"
                    checked={settings.userRegistration}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      userRegistration: e.target.checked
                    }))}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security & Privacy</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Content Moderation</span>
                  <input
                    type="checkbox"
                    checked={settings.contentModeration}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      contentModeration: e.target.checked
                    }))}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Analytics Tracking</span>
                  <input
                    type="checkbox"
                    checked={settings.analyticsTracking}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      analyticsTracking: e.target.checked
                    }))}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      backupFrequency: e.target.value
                    }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
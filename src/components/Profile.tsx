import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, BookOpen, Award, LogOut, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import ProfileSettings from './settings/ProfileSettings';
import NotificationSettings from './settings/NotificationSettings';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSettings, setActiveSettings] = useState<'profile' | 'notifications' | null>(null);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading state while user data is being fetched
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onGetStarted={() => {}} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-indigo-100">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* Learning Progress */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold">Learning Progress</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Course Completion</span>
                    <span className="text-sm text-gray-500">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  You've completed 3 out of 5 modules
                </p>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold">Achievements</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Award className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Quick Learner</p>
                    <p className="text-sm text-gray-500">Completed first module</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold">Account Settings</h2>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={() => setActiveSettings('profile')}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => setActiveSettings('notifications')}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Notification Settings
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Modals */}
        {activeSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="max-w-md w-full mx-4">
              {activeSettings === 'profile' ? (
                <ProfileSettings onClose={() => setActiveSettings(null)} />
              ) : (
                <NotificationSettings onClose={() => setActiveSettings(null)} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
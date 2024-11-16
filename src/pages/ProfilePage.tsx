import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserDocument } from '../services/firebase.service';
import { Timestamp } from 'firebase/firestore';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  assessments: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getUserDocument(user.id);
        if (userDoc) {
          // Ensure we have default values for optional fields
          const profileData: UserProfile = {
            name: userDoc.name || user.name || 'User',
            email: userDoc.email || user.email || '',
            role: userDoc.role || 'user',
            assessments: userDoc.assessments || [],
            createdAt: userDoc.createdAt || Timestamp.now(),
            updatedAt: userDoc.updatedAt || Timestamp.now()
          };
          setProfile(profileData);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const formatDate = (timestamp: Timestamp) => {
    try {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Date not available';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <div className="mt-1 text-gray-900">{profile.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <div className="mt-1 text-gray-900">{profile.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Role</label>
                  <div className="mt-1 text-gray-900 capitalize">{profile.role}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Member Since</label>
                  <div className="mt-1 text-gray-900">
                    {formatDate(profile.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Assessment History</h2>
              {profile.assessments && profile.assessments.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">
                    Completed Assessments: {profile.assessments.length}
                  </div>
                  {/* We can add more detailed assessment history here */}
                </div>
              ) : (
                <div className="text-gray-600">No assessments completed yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

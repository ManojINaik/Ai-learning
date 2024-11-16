import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, AlertCircle, Code, Database, Globe, Terminal, Server, Layout } from 'lucide-react';
import { getProfileData, updateProfileData, type ProfileData } from '../../services/profile.service';

interface ProfileSetupProps {
  onComplete?: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    strengths: [],
    weaknesses: [],
    learningStyle: ''
  });

  // Load user's existing profile data from Firestore
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        const data = await getProfileData(user.id);
        if (data) {
          setProfileData({
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            learningStyle: data.learningStyle || ''
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  const programmingSkills = [
    { id: 'frontend', label: 'Frontend Development', icon: Layout },
    { id: 'backend', label: 'Backend Development', icon: Server },
    { id: 'databases', label: 'Databases', icon: Database },
    { id: 'algorithms', label: 'Algorithms & Data Structures', icon: Code },
    { id: 'web', label: 'Web Technologies', icon: Globe },
    { id: 'cli', label: 'Command Line & Tools', icon: Terminal }
  ];

  const learningStyles = [
    { 
      id: 'visual', 
      label: 'Visual Learning', 
      description: 'Learn through diagrams, flowcharts, and visual documentation' 
    },
    { 
      id: 'reading', 
      label: 'Reading/Writing', 
      description: 'Learn through reading documentation and writing code' 
    },
    { 
      id: 'kinesthetic', 
      label: 'Hands-on Coding', 
      description: 'Learn by building projects and practicing code' 
    }
  ];

  const handleToggle = (skill: string, type: 'strengths' | 'weaknesses') => {
    setProfileData(prev => ({
      ...prev,
      [type]: prev[type].includes(skill)
        ? prev[type].filter(s => s !== skill)
        : [...prev[type], skill]
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await updateProfileData(user.id, {
        ...profileData,
        setupCompleted: true
      });
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Programming Strengths</h2>
            <p className="text-gray-600">Select the areas you're most confident in:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {programmingSkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => handleToggle(skill.id, 'strengths')}
                  className={`p-4 rounded-lg border ${
                    profileData.strengths.includes(skill.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  } transition-colors`}
                >
                  <skill.icon className="h-6 w-6 text-indigo-600 mb-2" />
                  <span className="font-medium">{skill.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Areas to Improve</h2>
            <p className="text-gray-600">Select the programming areas you'd like to strengthen:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {programmingSkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => handleToggle(skill.id, 'weaknesses')}
                  className={`p-4 rounded-lg border ${
                    profileData.weaknesses.includes(skill.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  } transition-colors`}
                >
                  <skill.icon className="h-6 w-6 text-indigo-600 mb-2" />
                  <span className="font-medium">{skill.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Learning Style</h2>
            <p className="text-gray-600">How do you prefer to learn programming?</p>
            <div className="space-y-4">
              {learningStyles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setProfileData(prev => ({ 
                    ...prev, 
                    learningStyle: style.id as ProfileData['learningStyle']
                  }))}
                  className={`w-full p-4 rounded-lg border ${
                    profileData.learningStyle === style.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  } transition-colors text-left`}
                >
                  <p className="font-medium">{style.label}</p>
                  <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return profileData.strengths.length > 0;
      case 2:
        return profileData.weaknesses.length > 0;
      case 3:
        return !!profileData.learningStyle;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Step {step} of 3</p>
        </div>

        {renderStep()}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-700"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (step < 3) {
                setStep(prev => prev + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={isLoading || !canContinue()}
            className={`ml-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Saving...
              </>
            ) : step === 3 ? (
              'Complete Setup'
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
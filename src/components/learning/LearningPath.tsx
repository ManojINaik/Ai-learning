import React, { useState, useEffect, useCallback } from 'react';
import { learningPathService } from '../../services/learningPathService';

interface LearningStep {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  modules: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  relevanceScore?: number;
}

interface LearningProfile {
  completedCourses: string[];
  interests: string[];
  currentSkillLevel: string;
  preferredLearningStyle: string;
  goals: string[];
}

export const LearningPath: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LearningProfile>({
    completedCourses: [],
    interests: [],
    currentSkillLevel: 'beginner',
    preferredLearningStyle: 'visual',
    goals: []
  });

  const generateLearningPath = useCallback(async () => {
    if (profile.interests.length === 0 && profile.goals.length === 0) {
      return; // Don't generate if no interests or goals are set
    }

    try {
      setLoading(true);
      setError(null);
      const steps = await learningPathService.generateRecommendedPaths(profile);
      setLearningPath(steps);
    } catch (err) {
      setError('Failed to generate learning path. Please try again.');
      console.error('Error generating learning path:', err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Auto-generate learning path when profile changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      generateLearningPath();
    }, 1000); // Wait 1 second after changes before generating

    return () => clearTimeout(debounceTimer);
  }, [generateLearningPath]);

  const handleProfileChange = (field: keyof LearningProfile, value: string | string[]) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInput = (field: keyof LearningProfile) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (e.key === 'Enter' && input.value.trim()) {
      handleProfileChange(field, [...(profile[field] as string[]), input.value.trim()]);
      input.value = '';
    }
  };

  const removeItem = (field: keyof LearningProfile, index: number) => {
    const newArray = [...(profile[field] as string[])];
    newArray.splice(index, 1);
    handleProfileChange(field, newArray);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600';
      case 'intermediate':
        return 'text-yellow-600';
      case 'advanced':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Learning Path Recommendations</h2>
        
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Skill Level
            </label>
            <select
              value={profile.currentSkillLevel}
              onChange={(e) => handleProfileChange('currentSkillLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Learning Style
            </label>
            <select
              value={profile.preferredLearningStyle}
              onChange={(e) => handleProfileChange('preferredLearningStyle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="reading">Reading/Writing</option>
              <option value="kinesthetic">Hands-on</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completed Courses (Press Enter to add)
            </label>
            <input
              type="text"
              placeholder="Enter completed course names"
              onKeyDown={handleArrayInput('completedCourses')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.completedCourses.map((course, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  {course}
                  <button
                    onClick={() => removeItem('completedCourses', index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests (Press Enter to add)
            </label>
            <input
              type="text"
              placeholder="Enter your interests"
              onKeyDown={handleArrayInput('interests')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  {interest}
                  <button
                    onClick={() => removeItem('interests', index)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Goals (Press Enter to add)
            </label>
            <input
              type="text"
              placeholder="Enter your learning goals"
              onKeyDown={handleArrayInput('goals')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.goals.map((goal, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  {goal}
                  <button
                    onClick={() => removeItem('goals', index)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={generateLearningPath}
            disabled={loading || (profile.interests.length === 0 && profile.goals.length === 0)}
            className={`w-full px-6 py-3 rounded-md text-white font-medium ${
              loading || (profile.interests.length === 0 && profile.goals.length === 0)
                ? 'bg-gray-400'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Generating Recommendations...' : 'Generate Personalized Learning Path'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {learningPath.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800">Your Personalized Learning Path</h3>
          <div className="space-y-4">
            {learningPath.map((step, index) => (
              <div
                key={step.id}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800">{step.title}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(step.difficulty)} bg-opacity-10`}>
                      {step.difficulty}
                    </span>
                    <span className="text-gray-600 text-sm">
                      ⏱️ {step.duration}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <p className="text-gray-600">{step.description}</p>

                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Key Modules:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {step.modules.map((module, idx) => (
                        <li key={idx} className="text-gray-600">{module}</li>
                      ))}
                    </ul>
                  </div>

                  {step.prerequisites && step.prerequisites.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-700 mb-2">Prerequisites:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {step.prerequisites.map((prereq, idx) => (
                          <li key={idx} className="text-gray-600">{prereq}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {step.learningOutcomes && step.learningOutcomes.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-700 mb-2">Learning Outcomes:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {step.learningOutcomes.map((outcome, idx) => (
                          <li key={idx} className="text-gray-600">{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {step.relevanceScore !== undefined && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">
                          🎯 Relevance Score:
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(step.relevanceScore / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-600 text-sm">
                          {step.relevanceScore.toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPath;
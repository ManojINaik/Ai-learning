import React, { useState } from 'react';
import { Target, ArrowRight, Brain, Code, Database, Globe } from 'lucide-react';
import ProfileSetup from '../components/onboarding/ProfileSetup';

interface Assessment {
  strengths: string[];
  weaknesses: string[];
  learningStyle: string;
}

const LearningPathsPage = () => {
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [assessment, setAssessment] = useState<Assessment>({
    strengths: [],
    weaknesses: [],
    learningStyle: ''
  });

  const getRecommendedPaths = () => {
    return [
      {
        title: assessment.strengths.includes('frontend') ? 'Frontend Development Master Path' : 'Full-Stack Development Path',
        description: `Personalized path focusing on your ${assessment.weaknesses.join(', ')} with ${assessment.learningStyle} approach`,
        level: assessment.strengths.length > 3 ? 'Advanced' : 'Intermediate',
        duration: '4-6 months',
        style: assessment.learningStyle,
        modules: [
          'Core Fundamentals',
          ...assessment.weaknesses.map(w => `${w.charAt(0).toUpperCase() + w.slice(1)} Mastery`),
          'Advanced Projects'
        ]
      },
      {
        title: 'Specialized Technical Path',
        description: `Deep dive into ${assessment.strengths.join(', ')} with advanced concepts`,
        level: 'Advanced',
        duration: '3 months',
        style: assessment.learningStyle,
        modules: [
          'Advanced Concepts',
          'Real-world Projects',
          'Industry Best Practices'
        ]
      }
    ];
  };

  const LearningPaths = () => {
    const recommendedPaths = getRecommendedPaths();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recommended Learning Paths</h2>
          <button
            onClick={() => setShowProfileSetup(true)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Update Learning Profile
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {recommendedPaths.map((path, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold">{path.title}</h2>
              </div>
              <p className="text-gray-600 mb-4">{path.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span className="mr-4">Level: {path.level}</span>
                <span>Duration: {path.duration}</span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Key Modules:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {path.modules.map((module, idx) => (
                    <li key={idx} className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-indigo-600" />
                      {module}
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
                Start Learning
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Custom Learning Paths</h1>
        <p className="text-gray-600">Let's create a learning path tailored to your needs.</p>
      </div>

      {showProfileSetup ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative">
            <button
              onClick={() => setShowProfileSetup(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
            <ProfileSetup onComplete={() => setShowProfileSetup(false)} />
          </div>
        </div>
      ) : (
        <LearningPaths />
      )}
    </div>
  );
};

export default LearningPathsPage;
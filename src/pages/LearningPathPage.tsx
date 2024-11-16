import React, { useState, useEffect } from 'react';
import { generateLearningPath, LearningStep, LearningProfile } from '../services/learningPathService';
import { BookOpen, Clock, Target, CheckCircle, AlertCircle } from 'lucide-react';

const LearningPathPage: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        setLoading(true);
        // Example profile - in a real app, this would come from user data
        const userProfile: LearningProfile = {
          completedCourses: ['Introduction to Programming', 'Basic Web Development'],
          interests: ['AI/ML', 'Web Development', 'Mobile Apps'],
          currentSkillLevel: 'intermediate',
          preferredLearningStyle: 'visual',
          learningGoals: ['Become a Full Stack Developer', 'Learn AI Development']
        };

        const path = await generateLearningPath(userProfile);
        setLearningPath(path);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate learning path');
      } finally {
        setLoading(false);
      }
    };

    fetchLearningPath();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Personalized Learning Path</h1>
        <p className="text-gray-600 mt-2">
          Follow this AI-generated path to achieve your learning goals efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Steps Navigation */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Learning Steps</h3>
            <div className="space-y-2">
              {learningPath.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeStep === index
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">
                      {index < activeStep ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Target className="w-5 h-5 text-gray-400" />
                      )}
                    </span>
                    <span className="truncate">{step.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Step Content */}
        <div className="lg:col-span-9">
          {learningPath[activeStep] && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {learningPath[activeStep].title}
                </h2>
                <div className="flex items-center text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    {learningPath[activeStep].difficulty}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {learningPath[activeStep].duration}
                  </span>
                </div>
              </div>

              <div className="prose max-w-none">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{learningPath[activeStep].description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Key Modules</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {learningPath[activeStep].modules.map((module, index) => (
                      <li key={index} className="text-gray-600">{module}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Prerequisites</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {learningPath[activeStep].prerequisites.map((prereq, index) => (
                      <li key={index} className="text-gray-600">{prereq}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Learning Outcomes</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {learningPath[activeStep].learningOutcomes.map((outcome, index) => (
                      <li key={index} className="text-gray-600">{outcome}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className={`px-4 py-2 rounded-lg ${
                    activeStep === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  Previous Step
                </button>
                <button
                  onClick={() => setActiveStep(Math.min(learningPath.length - 1, activeStep + 1))}
                  disabled={activeStep === learningPath.length - 1}
                  className={`px-4 py-2 rounded-lg ${
                    activeStep === learningPath.length - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Next Step
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPathPage;

import React, { useState, useEffect } from 'react';
import { Brain, BookOpen, Target, Award, Clock, Code, ArrowRight, Lightbulb } from 'lucide-react';
import AssessmentModal from '../components/assessment/AssessmentModal';
import { useAuth } from '../contexts/AuthContext';
import { getUserAssessments, Assessment } from '../services/firebase.service';
import { useNavigate } from 'react-router-dom';

interface AssessmentType {
  icon: any;
  title: string;
  description: string;
  duration: string;
  route: string;
}

const AssessmentPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getUserAssessments(user.id, (data) => {
      setAssessments(data.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()));
    });

    return () => unsubscribe();
  }, [user]);

  const assessmentTypes: AssessmentType[] = [
    {
      icon: Brain,
      title: 'Knowledge Assessment',
      description: 'Evaluate your current understanding and knowledge level',
      duration: '20-30 minutes',
      route: '/assessments/knowledge'
    },
    {
      icon: Code,
      title: 'Skills Assessment',
      description: 'Test your practical skills and problem-solving abilities',
      duration: '30-45 minutes',
      route: '/assessments/skills'
    },
    {
      icon: Lightbulb,
      title: 'Learning Style Assessment',
      description: 'Discover your optimal learning approach',
      duration: '15-20 minutes',
      route: '/assessments/learning-style'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Smart Assessment</h1>
        <p className="text-gray-600">Take our adaptive assessment to personalize your learning journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessmentTypes.map((type, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(type.route)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <type.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-500">{type.duration}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
            <p className="text-gray-600 mb-4">{type.description}</p>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center">
              Start Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Recent Results */}
      {assessments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Recent Results</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{assessment.type}</p>
                  <p className="text-sm text-gray-500">
                    {assessment.completedAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{assessment.score}%</p>
                    {assessment.improvement && (
                      <p className="text-sm text-green-600">{assessment.improvement}</p>
                    )}
                  </div>
                  <Award className={`h-6 w-6 ${
                    assessment.score >= 80 ? 'text-yellow-400' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-indigo-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Assessment Tips</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 mt-0.5">1</span>
            <span>Find a quiet space where you can focus without interruptions</span>
          </li>
          <li className="flex items-start">
            <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 mt-0.5">2</span>
            <span>Read each question carefully before answering</span>
          </li>
          <li className="flex items-start">
            <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 mt-0.5">3</span>
            <span>Don't rush - take your time to demonstrate your best understanding</span>
          </li>
        </ul>
      </div>

      <AssessmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default AssessmentPage;
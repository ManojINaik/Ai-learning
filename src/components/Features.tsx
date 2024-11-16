import React, { useState } from 'react';
import { BookOpen, BarChart3, UserCircle, Target, Brain, Star } from 'lucide-react';
import AssessmentModal from './assessment/AssessmentModal';

interface FeaturesProps {
  onGetStarted: () => void;
}

const Features = ({ onGetStarted }: FeaturesProps) => {
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Supercharge Your Learning Experience
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI technology with proven learning methodologies
            to deliver an unmatched educational experience.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="h-6 w-6" />,
              title: "Smart Assessment",
              description: "AI-powered evaluations that adapt to your knowledge level and learning pace.",
              action: () => setIsAssessmentOpen(true)
            },
            {
              icon: <Target className="h-6 w-6" />,
              title: "Custom Learning Paths",
              description: "Personalized curriculum designed to help you achieve your specific goals."
            },
            {
              icon: <BarChart3 className="h-6 w-6" />,
              title: "Progress Analytics",
              description: "Detailed insights and visualizations to track your learning journey."
            },
            {
              icon: <BookOpen className="h-6 w-6" />,
              title: "Rich Content Library",
              description: "Access to diverse, high-quality learning materials and resources."
            },
            {
              icon: <UserCircle className="h-6 w-6" />,
              title: "1-on-1 Mentoring",
              description: "Connect with expert mentors for personalized guidance and support."
            },
            {
              icon: <Star className="h-6 w-6" />,
              title: "Gamified Learning",
              description: "Earn rewards and achievements as you progress through your courses."
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className={`bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 ${
                feature.action ? 'cursor-pointer' : ''
              }`}
              onClick={feature.action}
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-100 px-4 py-2 rounded-full text-indigo-700">
            <span className="text-sm font-medium">Ready to transform your learning?</span>
          </div>
          <button 
            onClick={onGetStarted}
            className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
          >
            Get Started Now
          </button>
        </div>
      </div>

      <AssessmentModal 
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
      />
    </div>
  );
}

export default Features;
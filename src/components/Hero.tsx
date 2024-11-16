import React from 'react';
import { Brain, Sparkles, Target } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            <span className="block text-gray-900">Transform Your Learning Journey with</span>
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mt-2">
              AI-Powered Education
            </span>
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Experience personalized learning paths, adaptive assessments, and real-time feedback
            tailored to your unique learning style and goals.
          </p>
          
          <div className="mt-8 flex justify-center space-x-4">
            <button 
              onClick={onGetStarted}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
            >
              Start Learning
            </button>
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors text-lg font-medium">
              Watch Demo
            </button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Brain className="h-6 w-6" />,
                title: "AI-Powered Learning",
                description: "Adaptive pathways that evolve with your progress"
              },
              {
                icon: <Target className="h-6 w-6" />,
                title: "Personalized Goals",
                description: "Custom learning objectives tailored to you"
              },
              {
                icon: <Sparkles className="h-6 w-6" />,
                title: "Real-time Feedback",
                description: "Instant insights to optimize your learning"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-gray-100">
                <div className="text-indigo-600 mb-4 inline-block">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
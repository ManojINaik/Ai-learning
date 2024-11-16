import React from 'react';
import { Star, Trophy, Award, Target } from 'lucide-react';

const achievements = [
  {
    icon: Trophy,
    title: 'Quick Learner',
    description: 'Complete your first course',
    progress: 100,
    earned: true
  },
  {
    icon: Star,
    title: 'Knowledge Seeker',
    description: 'Complete 5 different assessments',
    progress: 60,
    earned: false
  },
  {
    icon: Award,
    title: 'Code Master',
    description: 'Submit 10 perfect assignments',
    progress: 30,
    earned: false
  }
];

const AchievementsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gamified Learning</h1>
        <p className="text-gray-600">Track your achievements and earn rewards as you learn.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {[
          { label: 'Total Points', value: '2,450', icon: Star },
          { label: 'Achievements', value: '8/24', icon: Trophy },
          { label: 'Current Streak', value: '5 days', icon: Target }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Achievements</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {achievements.map((achievement, index) => (
            <div key={index} className="p-6">
              <div className="flex items-start">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  achievement.earned ? 'bg-indigo-100' : 'bg-gray-100'
                }`}>
                  <achievement.icon className={`h-6 w-6 ${
                    achievement.earned ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                    {achievement.earned && (
                      <span className="text-sm text-indigo-600">Earned</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{achievement.progress}% complete</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
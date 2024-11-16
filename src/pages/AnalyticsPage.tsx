import React from 'react';
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Progress Analytics</h1>
        <p className="text-gray-600">Track your learning journey and performance metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { icon: TrendingUp, label: 'Course Progress', value: '68%' },
          { icon: Clock, label: 'Study Time', value: '24h' },
          { icon: Target, label: 'Goals Met', value: '8/10' },
          { icon: BarChart3, label: 'Avg. Score', value: '85%' }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-2">
              <stat.icon className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Learning Activity</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Activity chart will be displayed here
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Skill Progress</h2>
          <div className="space-y-4">
            {['JavaScript', 'React', 'Node.js'].map((skill) => (
              <div key={skill}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{skill}</span>
                  <span className="text-sm text-gray-500">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
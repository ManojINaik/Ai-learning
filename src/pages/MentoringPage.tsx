import React from 'react';
import { UserCircle, Calendar, MessageCircle, Star } from 'lucide-react';

const mentors = [
  {
    name: 'Dr. Sarah Johnson',
    expertise: 'Web Development',
    rating: 4.9,
    availability: 'Next available: Tomorrow'
  },
  {
    name: 'Prof. Michael Chen',
    expertise: 'Data Science',
    rating: 4.8,
    availability: 'Next available: Today'
  },
  {
    name: 'Emma Williams',
    expertise: 'Mobile Development',
    rating: 4.7,
    availability: 'Next available: In 2 days'
  }
];

const MentoringPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">1-on-1 Mentoring</h1>
        <p className="text-gray-600">Connect with expert mentors for personalized guidance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mentors.map((mentor, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-semibold">{mentor.name}</h2>
                <p className="text-sm text-gray-600">{mentor.expertise}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>{mentor.rating} / 5.0</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{mentor.availability}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </button>
              <button className="flex-1 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentoringPage;
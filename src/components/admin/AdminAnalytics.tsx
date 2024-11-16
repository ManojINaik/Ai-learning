import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import { getAnalytics } from '../../services/admin.service';
import type { Analytics } from '../../services/admin.service';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Platform overview and analytics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: 'Total Users', value: analytics.totalUsers, icon: Users, change: '+12%' },
          { label: 'Active Courses', value: analytics.activeCourses, icon: BookOpen, change: '+5%' },
          { label: 'Completion Rate', value: '78%', icon: Award, change: '+3%' },
          { label: 'User Growth', value: '+25%', icon: TrendingUp, change: '+8%' }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-sm text-green-600">{stat.change}</span>
            </div>
            <h3 className="text-sm text-gray-600">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">User Activity</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Activity chart will be displayed here
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Popular Resources</h2>
          <div className="space-y-4">
            {analytics.popularResources.map((resource, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{resource.title}</span>
                <span className="text-indigo-600">{resource.views} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
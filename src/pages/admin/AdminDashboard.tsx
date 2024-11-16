import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Users, BookOpen, BarChart2, Settings, Shield } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminUsers from '../../components/admin/AdminUsers';
import AdminContent from '../../components/admin/AdminContent';
import AdminAnalytics from '../../components/admin/AdminAnalytics';
import AdminSettings from '../../components/admin/AdminSettings';
import AdminAssessments from '../../components/admin/AdminAssessments';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8 ml-64">
          <Routes>
            <Route path="/" element={<AdminAnalytics />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/content" element={<AdminContent />} />
            <Route path="/assessments" element={<AdminAssessments />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
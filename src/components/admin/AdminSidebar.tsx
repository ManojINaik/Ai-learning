import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, BookOpen, BarChart2, Settings, Shield, LogOut, Brain } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin', icon: BarChart2, label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/content', icon: BookOpen, label: 'Content' },
    { path: '/admin/assessments', icon: Brain, label: 'Assessments' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-8">
        <Shield className="h-8 w-8 text-indigo-600" />
        <span className="text-xl font-bold">Admin Panel</span>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `
              flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-gray-600 hover:bg-gray-50'}
            `}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;
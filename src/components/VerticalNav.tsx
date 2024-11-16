import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Code, BookOpen, Target, Users, BarChart2, Award, Lightbulb, User } from 'lucide-react';

const VerticalNav = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      description: 'View your profile'
    },
    {
      path: '/dashboard',
      icon: Brain,
      label: 'Assessment Dashboard',
      description: 'View all assessments'
    },
    {
      path: '/assessments/knowledge',
      icon: BookOpen,
      label: 'Knowledge Assessment',
      description: 'Test your theoretical knowledge'
    },
    {
      path: '/assessments/skills',
      icon: Code,
      label: 'Skills Assessment',
      description: 'Test your practical coding skills'
    },
    {
      path: '/assessments/learning-style',
      icon: Lightbulb,
      label: 'Learning Style',
      description: 'Discover your learning style'
    },
    {
      path: '/library',
      icon: BookOpen,
      label: 'Content Library',
      description: 'Access learning resources'
    },
    {
      path: '/learning-paths',
      icon: Target,
      label: 'Learning Paths',
      description: 'Your personalized journey'
    },
    {
      path: '/mentoring',
      icon: Users,
      label: 'Mentoring',
      description: 'Connect with experts'
    },
    {
      path: '/analytics',
      icon: BarChart2,
      label: 'Analytics',
      description: 'Track your progress'
    },
    {
      path: '/achievements',
      icon: Award,
      label: 'Achievements',
      description: 'View your accomplishments'
    }
  ];

  // Add admin dashboard link only for admin users
  if (isAdmin) {
    navItems.push({
      path: '/admin',
      icon: '⚙️',
      label: 'Admin Dashboard',
      description: 'Manage admin settings'
    });
  }

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-16 overflow-y-auto">
      <div className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-start p-3 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            {item.icon === '⚙️' ? <span className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0">{item.icon}</span> : <item.icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />}
            <div>
              <div className="font-medium text-sm">{item.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
            </div>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default VerticalNav;
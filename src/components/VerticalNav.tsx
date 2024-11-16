import React from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, Code, BookOpen, Target, Users, BarChart2, Award, Lightbulb } from 'lucide-react';

const navItems = [
  {
    path: '/dashboard',
    icon: Brain,
    label: 'Assessment Dashboard',
    description: 'View all assessments'
  },
  {
    path: '/assessments/knowledge',
    icon: Code,
    label: 'Knowledge Assessment',
    description: 'Test your theoretical knowledge'
  },
  {
    path: '/assessments/skills',
    icon: Target,
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

const VerticalNav = () => {
  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-16 p-4">
      <div className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-start p-3 rounded-lg transition-colors
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-gray-600 hover:bg-gray-50'}
            `}
          >
            <item.icon className="h-5 w-5 mt-0.5 mr-3" />
            <div>
              <div className="font-medium">{item.label}</div>
              <div className="text-sm text-gray-500">{item.description}</div>
            </div>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default VerticalNav;
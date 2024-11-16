import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onGetStarted?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onGetStarted }) => {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-sm fixed w-full z-10 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">Learning Assessment</span>
            </Link>
          </div>

          <div className="flex items-center">
            {!user && onGetStarted && (
              <button
                onClick={onGetStarted}
                className="ml-8 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Get Started
              </button>
            )}
            {user && (
              <div className="flex items-center">
                <span className="text-gray-700 mr-4">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
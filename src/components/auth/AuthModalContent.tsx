import React, { useState } from 'react';
import { Mail, Lock, User, Loader2, AlertCircle, Shield } from 'lucide-react';
import { makeUserAdmin } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalContentProps {
  mode: 'signin' | 'signup';
  onSubmit: (data: { name?: string; email: string; password: string }) => Promise<void>;
  onSwitchMode: () => void;
  isLoading: boolean;
  error?: string;
}

const AuthModalContent = ({ 
  mode, 
  onSubmit, 
  onSwitchMode, 
  isLoading,
  error 
}: AuthModalContentProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [adminCode, setAdminCode] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (mode === 'signup' && !formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = mode === 'signup' 
      ? formData 
      : { email: formData.email, password: formData.password };
    
    await onSubmit(submitData);

    // Check if admin code is correct and make user admin
    if (adminCode === 'ADMIN123' && user?.id) {
      try {
        await makeUserAdmin(user.id);
      } catch (error) {
        console.error('Error making user admin:', error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {mode === 'signin' ? 'Welcome Back!' : 'Create Your Account'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
            </div>
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
            />
          </div>
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                validationErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
          </div>
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowAdminCode(!showAdminCode)}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <Shield className="h-4 w-4 mr-1" />
            {showAdminCode ? 'Hide Admin Code' : 'Enter Admin Code'}
          </button>
          {showAdminCode && (
            <div className="mt-2">
              <input
                type="text"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Enter admin code"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
            </>
          ) : (
            mode === 'signin' ? 'Sign In' : 'Create Account'
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={onSwitchMode}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </>
  );
};

export default AuthModalContent;
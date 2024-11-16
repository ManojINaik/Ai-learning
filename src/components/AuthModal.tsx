import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModalContent from './auth/AuthModalContent';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onSwitchMode: () => void;
}

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (data: { name?: string; email: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await signIn(data.email, data.password);
      } else {
        await signUp(data.name!, data.email, data.password);
      }
      
      const from = (location.state as any)?.from?.pathname || '/assessment';
      navigate(from, { replace: true });
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  }, [mode, signIn, signUp, navigate, location.state, onClose]);

  if (!isOpen || user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <AuthModalContent
          mode={mode}
          onSubmit={handleSubmit}
          onSwitchMode={onSwitchMode}
          isLoading={isLoading}
          error={error || undefined}
        />
      </div>
    </div>
  );
};

export default AuthModal;
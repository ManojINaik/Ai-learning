import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string | null;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development
const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User | null>(mockUser);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const value = {
    user,
    loading,
    error,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
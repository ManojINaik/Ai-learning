import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import AuthModal from './components/AuthModal';
import AssessmentPage from './pages/AssessmentPage';
import SkillsAssessmentPage from './pages/SkillsAssessmentPage';
import KnowledgeAssessmentPage from './pages/KnowledgeAssessmentPage';
import LearningStyleAssessmentPage from './pages/LearningStyleAssessmentPage';
import LibraryPage from './pages/LibraryPage';
import LearningPathsPage from './pages/LearningPathsPage';
import MentoringPage from './pages/MentoringPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AchievementsPage from './pages/AchievementsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import VerticalNav from './components/VerticalNav';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    console.log('Access denied. User:', user?.email, 'IsAdmin:', isAdmin);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <VerticalNav />
      <main className="pt-16 pl-64">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const handleSwitchMode = () => {
    setAuthMode(prevMode => prevMode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <>
                <Navbar onGetStarted={handleGetStarted} />
                <Hero onGetStarted={handleGetStarted} />
                <Features />
              </>
            )
          }
        />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout><AssessmentPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/assessments/skills" element={<PrivateRoute><DashboardLayout><SkillsAssessmentPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/assessments/knowledge" element={<PrivateRoute><DashboardLayout><KnowledgeAssessmentPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/assessments/learning-style" element={<PrivateRoute><DashboardLayout><LearningStyleAssessmentPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/library" element={<PrivateRoute><DashboardLayout><LibraryPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/learning-paths" element={<PrivateRoute><DashboardLayout><LearningPathsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/mentoring" element={<PrivateRoute><DashboardLayout><MentoringPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><DashboardLayout><AnalyticsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/achievements" element={<PrivateRoute><DashboardLayout><AchievementsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><DashboardLayout><ProfilePage /></DashboardLayout></PrivateRoute>} />
          
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoute><DashboardLayout><AdminDashboard /></DashboardLayout></AdminRoute>} />
      </Routes>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={handleSwitchMode}
      />
    </>
  );
};

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './pages/auth/LandingPage';
import EmailInputPage from './pages/auth/EmailInputPage';
import PasswordPage from './pages/auth/PasswordPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import Dashboard from './pages/Dashboard';
import RoutineSetup from './pages/routine/RoutineSetup';
import TodoSetup from './pages/todo/TodoSetup';
import GoalSetup from './pages/goal/GoalSetup';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AppInfo from './pages/AppInfo';
import UserManual from './pages/UserManual';
import HelpSupport from './pages/HelpSupport';
import RoutineView from './pages/routine/RoutineView';
import TodoView from './pages/todo/TodoView';
import TodayRoutine from './pages/today/TodayRoutine';
import TodayTodo from './pages/today/TodayTodo';
import TodayGoal from './pages/today/TodayGoal';
import TomorrowGoal from './pages/goal/TomorrowGoal';
import MenuPage from './pages/MenuPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null; // Let the splash screen handle it
  if (!currentUser) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/email" element={<EmailInputPage />} />
        <Route path="/auth/password" element={<PasswordPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/verify" element={<VerifyEmailPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Feature Routes */}
        <Route path="/routine/setup" element={<ProtectedRoute><RoutineSetup /></ProtectedRoute>} />
        <Route path="/routine/view/:id" element={<ProtectedRoute><RoutineView /></ProtectedRoute>} />
        
        <Route path="/todo/setup" element={<ProtectedRoute><TodoSetup /></ProtectedRoute>} />
        <Route path="/todo/view/:id" element={<ProtectedRoute><TodoView /></ProtectedRoute>} />
        
        <Route path="/goal/setup" element={<ProtectedRoute><GoalSetup /></ProtectedRoute>} />
        <Route path="/goal/tomorrow" element={<ProtectedRoute><TomorrowGoal /></ProtectedRoute>} />

        <Route path="/today/routine" element={<ProtectedRoute><TodayRoutine /></ProtectedRoute>} />
        <Route path="/today/todo" element={<ProtectedRoute><TodayTodo /></ProtectedRoute>} />
        <Route path="/today/goal" element={<ProtectedRoute><TodayGoal /></ProtectedRoute>} />
        
        <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />

        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/app-info" element={<ProtectedRoute><AppInfo /></ProtectedRoute>} />
        <Route path="/user-manual" element={<ProtectedRoute><UserManual /></ProtectedRoute>} />
        <Route path="/help-support" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

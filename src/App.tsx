import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { restoreUserSession } from './store/slices/authSlice';

// Auth Components
import LoginForm from './components/Auth/LoginForm';
import SignUpForm from './components/Auth/SignUpForm';
import ResetPasswordForm from './components/Auth/ResetPasswordForm';
import UpdatePasswordForm from './components/Auth/UpdatePasswordForm';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Layout Components
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';

// Page Components
import {
  Dashboard,
  Profile,
  Jobs,
  Applications,
  CVAnalysis,
  Analytics,
  SavedJobs,
  Settings,
  AdminDashboard,
  AdminUsers,
  AdminJobs,
  AdminAnalytics,
  AdminSystem,
  AdminSettings,
  AdminLogs
} from './components/LazyComponents';

// Loading Component
import { Loader2, ArrowLeft } from 'lucide-react';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, user } = useAppSelector(state => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Try to restore session on app start
    dispatch(restoreUserSession());

    // Set a timeout to stop showing loading after session restore attempt
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  // Show loading screen while initializing
  if (initializing || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de KhedmaClair...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/update-password" element={<UpdatePasswordForm />} />
        <Route path="/check-email-for-verification" element={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="text-center bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Vérifiez votre boîte de réception</h1>
              <p className="text-gray-600 mb-6">
                Un e-mail de vérification a été envoyé à votre adresse. Veuillez cliquer sur le lien qu'il contient pour activer votre compte.
              </p>
              <p className="text-sm text-gray-500">
                Si vous ne recevez pas l'e-mail, veuillez vérifier votre dossier de spam ou <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">réessayer de vous inscrire</a>.
              </p>
              <div className="mt-6">
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la connexion
                </a>
              </div>
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const isAdmin = user?.role === 'Admin';

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content with left margin for sidebar on desktop */}
        <main className="flex-1 overflow-y-auto p-6 lg:pl-72">
          <div className="max-w-7xl mx-auto">
            <Routes>
              {/* Common routes for all users */}
              <Route path="/" element={
                <ProtectedRoute>
                  {isAdmin ? <AdminDashboard /> : <Dashboard />}
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/update-password" element={
                <ProtectedRoute>
                  <UpdatePasswordForm />
                </ProtectedRoute>
              } />

              {/* User-specific routes */}
              {!isAdmin && (
                <>
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/cv-analysis" element={
                    <ProtectedRoute>
                      <CVAnalysis />
                    </ProtectedRoute>
                  } />
                  <Route path="/jobs" element={
                    <ProtectedRoute>
                      <Jobs />
                    </ProtectedRoute>
                  } />
                  <Route path="/applications" element={
                    <ProtectedRoute>
                      <Applications />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/tasks" element={
                    <ProtectedRoute>
                      <Tasks />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  <Route path="/saved" element={
                    <ProtectedRoute>
                      <SavedJobs />
                    </ProtectedRoute>
                  } />
                </>
              )}

              {/* Admin-specific routes */}
              {isAdmin && (
                <>
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute requiredRole="Admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute requiredRole="Admin">
                      <AdminUsers />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/system" element={
                    <ProtectedRoute requiredRole="Admin">
                      <AdminSystem />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <ProtectedRoute requiredRole="Admin">
                      <AdminAnalytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/logs" element={
                    <ProtectedRoute requiredRole="Admin">
                      <AdminLogs />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/jobs" element={
                    <ProtectedRoute requiredRole="Admin">
                      <AdminJobs />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/settings" element={
                    <ProtectedRoute requiredRole="Admin">
                      <AdminSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/database" element={
                    <ProtectedRoute requiredRole="Admin">
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h1 className="text-2xl font-bold mb-4">Gestion de la Base de Données</h1>
                        <p>Administration et maintenance de la base de données.</p>
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/security" element={
                    <ProtectedRoute requiredRole="Admin">
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h1 className="text-2xl font-bold mb-4">Sécurité</h1>
                        <p>Paramètres de sécurité et gestion des accès.</p>
                      </div>
                    </ProtectedRoute>
                  } />
                </>
              )}

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
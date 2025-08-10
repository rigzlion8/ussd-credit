import React, { useState } from 'react';
import { InfluencerList } from './components/InfluencerList';
import { InfluencerDashboard } from './pages/InfluencerDashboard';
import { SubscriberDashboard } from './pages/SubscriberDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AuthPage from './pages/AuthPage';
import UserProfilePage from './pages/UserProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AppContent = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.user_type === 'admin';

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <div className={`App theme-${theme}`}>
        <nav className="navbar">
          <div className="navbar-brand">
            <img 
              src="/logo.png"
              alt="USSD AutoPay Platform" 
              className="navbar-logo"
            />
            <span className="platform-name">USSD AutoPay</span>
          </div>
          
          <div className="navbar-links navbar-links-center">
            <Link to="/" className="nav-link">Home</Link>
            <a href="#" className="nav-link">Features</a>
            <a href="#" className="nav-link">Pricing</a>
            <a href="#" className="nav-link">Contact</a>
            <Link to="/subscriber" className="nav-link">Subscriber Dashboard</Link>
            {isAdmin && (
              <>
                <Link to="/dashboard" className="nav-link">Influencer Dashboard</Link>
                <Link to="/admin" className="nav-link">Admin Dashboard</Link>
                <Link to="/admin/users" className="nav-link">User Management</Link>
              </>
            )}
          </div>
          
          <div className="navbar-auth-search">
            <div className="navbar-search">
              <input
                type="text"
                className="search-input"
                placeholder="Search"
                readOnly
                style={{ width: '120px' }}
              />
            </div>
            <div className="navbar-auth">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="auth-link">
                    {user?.first_name || user?.email || 'Profile'}
                  </Link>
                  <button
                    onClick={logout}
                    className="auth-link text-red-600 hover:text-red-500"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link to="/auth" className="auth-link login-link">Login</Link>
                  <Link to="/auth" className="auth-link signup-link">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<InfluencerList />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredUserType="user">
                  <InfluencerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscriber" 
              element={
                <ProtectedRoute requiredUserType="subscribed">
                  <SubscriberDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredUserType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredUserType="admin">
                  <AdminUserManagement />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="footer">
          <button onClick={toggleTheme} className="theme-toggle-btn small">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span className="footer-text">&copy; {new Date().getFullYear()} USSD AutoPay. All rights reserved.</span>
        </footer>
      </div>
    </Router>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
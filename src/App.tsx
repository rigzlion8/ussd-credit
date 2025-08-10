import React, { useState, useEffect, useRef } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.user_type === 'admin';
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileToggleRef.current &&
        !mobileToggleRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    // Close mobile menu when window is resized to desktop
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close mobile menu when route changes
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
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
          
          {/* Mobile menu toggle */}
          <button 
            ref={mobileToggleRef}
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </button>
          
          {/* Mobile menu backdrop */}
          <div 
            className={`mobile-menu-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div 
            ref={mobileMenuRef}
            className={`navbar-links navbar-links-center ${isMobileMenuOpen ? 'mobile-open' : ''}`}
          >
            <Link to="/" className="nav-link" onClick={handleNavClick}>Home</Link>
            <Link to="/subscriber" className="nav-link" onClick={handleNavClick}>Subscriber</Link>
            {isAdmin && (
              <>
                <Link to="/dashboard" className="nav-link" onClick={handleNavClick}>Dashboard</Link>
                <Link to="/admin" className="nav-link" onClick={handleNavClick}>Admin</Link>
              </>
            )}
            {/* Mobile-only auth links */}
            <div className="mobile-auth-links">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="nav-link" onClick={handleNavClick}>
                    {user?.first_name || user?.email || 'Profile'}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      handleNavClick();
                    }}
                    className="nav-link text-red-600 hover:text-red-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="nav-link" onClick={handleNavClick}>Login</Link>
                  <Link to="/auth" className="nav-link" onClick={handleNavClick}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
          
          <div className="navbar-auth-search">
            <div className="navbar-search">
              <input
                type="text"
                className="search-input"
                placeholder="Search"
                readOnly
                style={{ width: '100px' }}
              />
            </div>
            <div className="navbar-auth">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
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
                <div className="flex space-x-3">
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
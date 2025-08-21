import React, { useState, useEffect, useRef } from 'react';
import { InfluencerList } from './components/InfluencerList';
import { InfluencerDashboard } from './pages/InfluencerDashboard';
import { SubscriberDashboard } from './pages/SubscriberDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminInfluencerManagement from './pages/AdminInfluencerManagement';
import AuthPage from './pages/AuthPage';
import UserProfilePage from './pages/UserProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AppContent = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.user_type === 'admin';
  
  // Debug logging
  console.log('🔍 App: Authentication state:', { isAuthenticated, user, isAdmin });
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  // Debug component to show current route
  const RouteDebug = () => {
    const location = useLocation();
    console.log('🔍 App: Current route:', location.pathname);
    return null;
  };

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
        <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 lg:px-6 lg:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png"
                alt="USSD Credit Platform" 
                className="w-8 h-8 lg:w-10 lg:h-10"
              />
              <span className="text-lg lg:text-xl font-semibold text-gray-900">USSD Credit</span>
            </div>
            
            {/* Mobile menu toggle */}
            <button 
              ref={mobileToggleRef}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            {/* Desktop Navigation Links - Hidden on Mobile */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Home</Link>
              <Link to="/subscriber" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Subscriber</Link>
              {isAdmin && (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Dashboard</Link>
                  <Link to="/admin" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Admin</Link>
                </>
              )}
            </div>
            
            {/* Desktop Right Section - Hidden on Mobile */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  className="w-32 lg:w-40 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Search..."
                  readOnly
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link to="/profile" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                    {user?.first_name || user?.email || 'Profile'}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/auth" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/auth" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Menu - Full Width Overlay */}
          <div 
            ref={mobileMenuRef}
            className={`lg:hidden fixed inset-0 top-[72px] bg-white z-50 transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="h-full overflow-y-auto">
              <div className="px-4 py-6 space-y-6">
                {/* Mobile Navigation Links */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Navigation</h3>
                  <div className="space-y-3">
                    <Link to="/" className="block text-gray-700 hover:text-primary-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={handleNavClick}>
                      🏠 Home
                    </Link>
                    <Link to="/subscriber" className="block text-gray-700 hover:text-primary-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={handleNavClick}>
                      👥 Subscriber
                    </Link>
                    {isAdmin && (
                      <>
                        <Link to="/dashboard" className="block text-gray-700 hover:text-primary-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={handleNavClick}>
                          📊 Dashboard
                        </Link>
                        <Link to="/admin" className="block text-gray-700 hover:text-primary-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={handleNavClick}>
                          ⚙️ Admin
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Mobile Search */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Search</h3>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Search..."
                      readOnly
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Mobile Auth */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Account</h3>
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <Link to="/profile" className="block text-gray-700 hover:text-primary-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors" onClick={handleNavClick}>
                        👤 {user?.first_name || user?.email || 'Profile'}
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          handleNavClick();
                        }}
                        className="block w-full text-left text-red-600 hover:text-red-700 font-medium py-3 px-4 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link to="/auth" className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors" onClick={handleNavClick}>
                        🔑 Login
                      </Link>
                      <Link to="/auth" className="block w-full text-center border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white py-3 px-4 rounded-lg font-medium transition-colors" onClick={handleNavClick}>
                        ✨ Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu Backdrop */}
          {isMobileMenuOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </nav>

        <main className="main-content">
          <RouteDebug />
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
              element={<SubscriberDashboard />}
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
            <Route 
              path="/admin/influencers" 
              element={
                <ProtectedRoute requiredUserType="admin">
                  <AdminInfluencerManagement />
                </ProtectedRoute>
              } 
            />
            {/* Temporarily comment out catch-all route to debug routing */}
            {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
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
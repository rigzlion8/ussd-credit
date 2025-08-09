import React, { useState } from 'react';
import { InfluencerList } from './components/InfluencerList';
import { InfluencerDashboard } from './pages/InfluencerDashboard';
import { SubscriberDashboard } from './pages/SubscriberDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // Simulate admin status (replace with real auth logic as needed)
  const isAdmin = false;

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
              <a href="/login" className="auth-link login-link">Login</a>
              <a href="/signup" className="auth-link signup-link">Sign Up</a>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<InfluencerList />} />
            <Route path="/dashboard" element={<InfluencerDashboard />} />
            <Route path="/subscriber" element={<SubscriberDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
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

export default App;
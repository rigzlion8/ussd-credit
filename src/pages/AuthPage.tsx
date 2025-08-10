import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const switchToLogin = () => setIsLogin(true);
  const switchToRegister = () => setIsLogin(false);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <img
            className="auth-logo"
            src="/logo.png"
            alt="USSD AutoPay"
          />
          <h1 className="auth-title">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h1>
          <p className="auth-subtitle">
            {isLogin ? (
              <>
                <span className="auth-switch-text">Or{' '}</span>
                <button
                  onClick={switchToRegister}
                  className="auth-switch-button"
                >
                  create a new account
                </button>
              </>
            ) : (
              <>
                <span className="auth-switch-text">Or{' '}</span>
                <button
                  onClick={switchToLogin}
                  className="auth-switch-button"
                >
                  sign in to your existing account
                </button>
              </>
            )}
          </p>
        </div>

        <div className="auth-form">
          {isLogin ? (
            <LoginForm onSwitchToRegister={switchToRegister} />
          ) : (
            <RegisterForm onSwitchToLogin={switchToLogin} />
          )}
        </div>

        <div className="auth-terms">
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="auth-terms-link">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="auth-terms-link">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

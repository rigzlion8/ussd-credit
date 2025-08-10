import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, googleLogin, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    clearError();
    
    try {
      await login(email, password);
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    // Google login successful, user will be redirected automatically
  };

  const handleGoogleError = (error: string) => {
    console.error('Google login error:', error);
    // You can show this error to the user if needed
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h2 className="auth-form-title">Welcome Back</h2>
        <p className="auth-form-subtitle">Sign in to your account</p>
      </div>

      {error && (
        <div className="auth-error-message">
          <span className="auth-error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-fields">
        <div className="auth-form-group">
          <label htmlFor="email" className="auth-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="auth-form-group">
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <div className="auth-password-container">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-password-toggle"
            >
              {showPassword ? (
                <svg className="auth-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="auth-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="auth-form-options">
          <label className="auth-checkbox-container">
            <input type="checkbox" className="auth-checkbox" />
            <span className="auth-checkbox-label">Remember me</span>
          </label>
          <button type="button" className="auth-link-button">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="auth-submit-button"
        >
          {isLoading ? (
            <>
              <span className="auth-spinner"></span>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="auth-divider">
        <span className="auth-divider-text">Or continue with</span>
      </div>

      <div className="auth-google-section">
        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          className="google-auth-button"
        >
          Sign in with Google
        </GoogleAuthButton>
      </div>

      <div className="auth-footer">
        <p className="auth-footer-text">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="auth-footer-link"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;

import React, { useState } from 'react';
import { useAuth, RegisterData } from '../../contexts/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterData & { confirmPassword: string }>>({});
  
  const { register, googleLogin, error, clearError } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData & { confirmPassword: string }> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof RegisterData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    clearError();
    
    try {
      await register(formData);
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
        <h2 className="auth-form-title">Create Account</h2>
        <p className="auth-form-subtitle">Join us today</p>
      </div>

      {error && (
        <div className="auth-error-message">
          <span className="auth-error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-fields">
        <div className="auth-form-grid">
          <div className="auth-form-group">
            <label htmlFor="first_name" className="auth-label">
              First Name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleInputChange}
              className={`auth-input ${errors.first_name ? 'error' : ''}`}
              placeholder="First name"
              required
            />
            {errors.first_name && (
              <p className="auth-error">{errors.first_name}</p>
            )}
          </div>

          <div className="auth-form-group">
            <label htmlFor="last_name" className="auth-label">
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleInputChange}
              className={`auth-input ${errors.last_name ? 'error' : ''}`}
              placeholder="Last name"
              required
            />
            {errors.last_name && (
              <p className="auth-error">{errors.last_name}</p>
            )}
          </div>
        </div>

        <div className="auth-form-group">
          <label htmlFor="email" className="auth-label">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`auth-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email"
            required
          />
          {errors.email && (
            <p className="auth-error">{errors.email}</p>
          )}
        </div>

        <div className="auth-form-group">
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <div className="auth-password-container">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              className={`auth-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a password"
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
          {errors.password && (
            <p className="auth-error">{errors.password}</p>
          )}
          <p className="password-requirements">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div className="auth-form-group">
          <label htmlFor="confirmPassword" className="auth-label">
            Confirm Password
          </label>
          <div className="auth-password-container">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="auth-password-toggle"
            >
              {showConfirmPassword ? (
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
          {errors.confirmPassword && (
            <p className="auth-error">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="auth-checkbox-container">
          <input
            id="terms"
            type="checkbox"
            className="auth-checkbox"
            required
          />
          <label htmlFor="terms" className="auth-checkbox-label">
            I agree to the{' '}
            <a href="#" className="auth-checkbox-link">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="auth-checkbox-link">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="auth-submit-button"
        >
          {isLoading ? (
            <>
              <span className="auth-spinner"></span>
              Creating account...
            </>
          ) : (
            'Create Account'
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
          Sign up with Google
        </GoogleAuthButton>
      </div>

      <div className="auth-footer">
        <p className="auth-footer-text">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="auth-footer-link"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;

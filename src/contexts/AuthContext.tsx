import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authAPI } from '../lib/api';

// Types
export interface User {
  id: number;
  email: string;
  phone?: string;
  username?: string;
  user_type: 'guest' | 'user' | 'subscribed' | 'admin';
  first_name: string;
  last_name: string;
  avatar_url?: string;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

// Context
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  googleLogin: (idToken: string, userInfo: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: response.data, token }
          });
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      dispatch({ type: 'AUTH_FAILURE', payload: '' });
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const googleLogin = async (idToken: string, userInfo: any) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authAPI.googleLogin(idToken);
      const { user, token } = response.data;
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Google login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data;
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      throw new Error(errorMessage);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authAPI.changePassword({ current_password: currentPassword, new_password: newPassword });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

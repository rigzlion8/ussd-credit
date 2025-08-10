import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Google OAuth Client ID - replace with your actual client ID
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id';

// Google OAuth Provider component
export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
};

// Google OAuth configuration
export const googleConfig = {
  clientId: GOOGLE_CLIENT_ID,
  scope: 'openid email profile',
  responseType: 'id_token',
  prompt: 'select_account',
};

// Google OAuth scopes
export const GOOGLE_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// Google OAuth endpoints
export const GOOGLE_ENDPOINTS = {
  auth: 'https://accounts.google.com/o/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token',
  userInfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
  revoke: 'https://oauth2.googleapis.com/revoke',
};

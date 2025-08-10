import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { GoogleAuthProvider } from './lib/googleAuth';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleAuthProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleAuthProvider>
  </React.StrictMode>
);
import axios from 'axios';

// API configuration for the real Flask backend
const baseURL = process.env.REACT_APP_API_BASE_URL || 
  (window.location.hostname === 'ussd-autopay.vercel.app' 
    ? 'https://ussd-credit-production.up.railway.app' 
    : 'http://localhost:8000');

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    // Validate response data structure
    if (response.data && typeof response.data === 'object') {
      // Ensure data is always an array for list endpoints
      if (Array.isArray(response.data)) {
        return response;
      }
      // If data is an object but not an array, wrap it
      if (response.config.url?.includes('/api/')) {
        response.data = [response.data];
      }
    }
    return response;
  },
  async (error) => {
    console.error('API Error:', error);
    
    // Handle CORS errors specifically
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('CORS or Network Error - Check backend CORS configuration');
      error.message = 'Network Error: Unable to connect to server. Please check your connection or contact support.';
    }
    
    // Handle token expiration
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    
    // Handle specific HTTP status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          error.message = 'Unauthorized: Please log in again.';
          break;
        case 403:
          error.message = 'Forbidden: You do not have permission to access this resource.';
          break;
        case 404:
          error.message = 'Resource not found.';
          break;
        case 500:
          error.message = 'Server error: Please try again later.';
          break;
        default:
          error.message = `Request failed with status ${error.response.status}`;
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API endpoints
export const authAPI = {
  // User registration
  register: (userData: any) => api.post('/api/auth/register', userData),
  
  // User login
  login: (credentials: { email: string; password: string }) => 
    api.post('/api/auth/login', credentials),
  
  // Google OAuth login
  googleLogin: (googleToken: string) => 
    api.post('/api/auth/google', { token: googleToken }),
  
  // Get user profile
  getProfile: () => api.get('/api/auth/profile'),
  
  // Update user profile
  updateProfile: (profileData: any) => 
    api.put('/api/auth/profile', profileData),
  
  // Change password
  changePassword: (passwordData: { current_password: string; new_password: string }) =>
    api.post('/api/auth/change-password', passwordData),
  
  // Refresh token
  refreshToken: () => api.post('/api/auth/refresh'),
  
  // Logout
  logout: () => api.post('/api/auth/logout')
};

// Admin API endpoints
export const adminAPI = {
  // Get all users
  getUsers: () => api.get('/api/admin/users'),
  
  // Get user by ID
  getUser: (userId: number) => api.get(`/api/admin/users/${userId}`),
  
  // Update user
  updateUser: (userId: number, userData: any) => 
    api.put(`/api/admin/users/${userId}`, userData),
  
  // Delete user
  deleteUser: (userId: number) => 
    api.delete(`/api/admin/users/${userId}`),
  
  // Activate user
  activateUser: (userId: number) => 
    api.post(`/api/admin/users/${userId}/activate`),
  
  // Deactivate user
  deactivateUser: (userId: number) => 
    api.post(`/api/admin/users/${userId}/deactivate`)
};

// User management API endpoints
export const userAPI = {
  // Get all users (for admin)
  getAllUsers: () => api.get('/api/users'),
  
  // Get user by phone (for USSD verification)
  getUserByPhone: (phone: string, pin: string) => 
    api.get(`/api/users?phone=${phone}&pin=${pin}`),
  
  // Create new user
  createUser: (userData: any) => api.post('/api/users', userData)
};

// Influencer API endpoints
export const influencerAPI = {
  // Get all influencers
  getAll: () => api.get('/api/influencers'),
  
  // Get influencer by ID
  getById: (id: number) => api.get(`/api/influencers/${id}`),
  
  // Create new influencer
  create: (influencerData: any) => api.post('/api/influencers', influencerData),
  
  // Update influencer
  update: (id: number, influencerData: any) => 
    api.put(`/api/influencers/${id}`, influencerData),
  
  // Delete influencer
  delete: (id: number) => api.delete(`/api/influencers/${id}`),
  
  // Admin management functions
  suspend: (id: number) => api.post(`/api/influencers/${id}/suspend`),
  activate: (id: number) => api.post(`/api/influencers/${id}/activate`),
  terminate: (id: number) => api.post(`/api/influencers/${id}/terminate`),
  
  // Get all shortcodes for admin reference
  getShortcodes: () => api.get('/api/influencers/shortcodes')
};

// Subscription API endpoints
export const subscriptionAPI = {
  // Get all subscriptions
  getAll: () => api.get('/api/subscribers'),
  
  // Get subscription by ID
  getById: (id: number) => api.get(`/api/subscribers/${id}`),
  
  // Create new subscription
  create: (subscriptionData: any) => api.post('/api/subscribers', subscriptionData),
  
  // Update subscription
  update: (id: number, subscriptionData: any) => 
    api.put(`/api/subscribers/${id}`, subscriptionData),
  
  // Delete subscription
  delete: (id: number) => api.delete(`/api/subscribers/${id}`)
};

export default api;
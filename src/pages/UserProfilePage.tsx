import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const UserProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
    avatar_url: user?.avatar_url || '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await changePassword(passwordData.current_password, passwordData.new_password);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setIsChangingPassword(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeDisplay = (userType: string) => {
    const types = {
      'guest': 'Guest User',
      'user': 'Free User',
      'subscribed': 'Premium Subscriber',
      'admin': 'Administrator'
    };
    return types[userType as keyof typeof types] || userType;
  };

  const getUserTypeColor = (userType: string) => {
    const colors = {
      'guest': 'bg-gray-100 text-gray-800',
      'user': 'bg-blue-100 text-blue-800',
      'subscribed': 'bg-green-100 text-green-800',
      'admin': 'bg-purple-100 text-purple-800'
    };
    return colors[userType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500 border border-red-300 rounded-md hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Picture & Status */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img
                        src={user.avatar_url || '/default-avatar.png'}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      {isEditing && (
                        <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {user.first_name} {user.last_name}
                      </h2>
                      <p className="text-gray-600">{user.email}</p>
                      
                      <div className="mt-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUserTypeColor(user.user_type)}`}>
                          {getUserTypeDisplay(user.user_type)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 text-left space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {user.email_verified ? 'Email Verified' : 'Email Not Verified'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {user.phone_verified ? 'Phone Verified' : 'Phone Not Verified'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Member since {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Form */}
                <div className="lg:col-span-2">
                  {message && (
                    <div className={`mb-4 p-3 rounded-md ${
                      message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  {/* Profile Form */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-300 rounded-md hover:bg-blue-50"
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <div className="space-x-2">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleProfileUpdate}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                          >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                              type="text"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                              type="text"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Username</label>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                          <input
                            type="url"
                            name="avatar_url"
                            value={formData.avatar_url}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <p className="mt-1 text-sm text-gray-900">{user.first_name || 'Not set'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <p className="mt-1 text-sm text-gray-900">{user.last_name || 'Not set'}</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Username</label>
                          <p className="mt-1 text-sm text-gray-900">{user.username || 'Not set'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Password Change */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                      {!isChangingPassword ? (
                        <button
                          onClick={() => setIsChangingPassword(true)}
                          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-300 rounded-md hover:bg-blue-50"
                        >
                          Change Password
                        </button>
                      ) : (
                        <div className="space-x-2">
                          <button
                            onClick={() => setIsChangingPassword(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handlePasswordUpdate}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                          >
                            {isLoading ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      )}
                    </div>

                    {isChangingPassword && (
                      <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Current Password</label>
                          <input
                            type="password"
                            name="current_password"
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">New Password</label>
                          <input
                            type="password"
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                          <input
                            type="password"
                            name="confirm_password"
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserProfilePage;

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../contexts/AuthContext';
import { 
  User as UserIcon, 
  Crown, 
  Shield, 
  Edit3, 
  Save, 
  X,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface UserProfileProps {
  onClose?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditData({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username || '',
      avatar_url: user.avatar_url || ''
    });
    setIsEditing(true);
    setError(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
    setError(null);
  };

  const getUserTypeIcon = () => {
    switch (user.user_type) {
      case 'admin':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 'subscribed':
        return <Shield className="h-6 w-6 text-blue-500" />;
      case 'user':
        return <UserIcon className="h-6 w-6 text-green-500" />;
      default:
        return <UserIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getUserTypeLabel = () => {
    switch (user.user_type) {
      case 'admin':
        return 'Administrator';
      case 'subscribed':
        return 'Premium Member';
      case 'user':
        return 'Registered User';
      default:
        return 'Guest User';
    }
  };

  const getUserTypeColor = () => {
    switch (user.user_type) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'subscribed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
              <div className="flex items-center space-x-3">
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Logout
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-8 text-center">
                <div className="mb-4">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Profile"
                      className="h-24 w-24 rounded-full mx-auto border-4 border-gray-200"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {user.first_name} {user.last_name}
                </h2>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUserTypeColor()}`}>
                  {getUserTypeIcon()}
                  <span className="ml-2">{getUserTypeLabel()}</span>
                </div>
                
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center justify-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {user.phone}
                    </div>
                  )}
                  <div className="flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              <div className="px-6 py-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={editData.first_name || ''}
                          onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={editData.last_name || ''}
                          onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={editData.username || ''}
                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Avatar URL
                      </label>
                      <input
                        type="url"
                        value={editData.avatar_url || ''}
                        onChange={(e) => setEditData({ ...editData, avatar_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">First Name</h4>
                        <p className="text-sm text-gray-900">{user.first_name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Last Name</h4>
                        <p className="text-sm text-gray-900">{user.last_name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Username</h4>
                        <p className="text-sm text-gray-900">{user.username || 'Not set'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Email</h4>
                        <div className="flex items-center">
                          <p className="text-sm text-gray-900 mr-2">{user.email}</p>
                          {user.email_verified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Phone</h4>
                        <div className="flex items-center">
                          <p className="text-sm text-gray-900 mr-2">{user.phone || 'Not set'}</p>
                          {user.phone_verified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Account Status</h4>
                        <div className="flex items-center">
                          {user.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Suspended
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Account Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-1">Created</h5>
                          <p className="text-sm text-gray-900">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h5>
                          <p className="text-sm text-gray-900">
                            {new Date(user.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        {user.last_login && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Last Login</h5>
                            <p className="text-sm text-gray-900">
                              {new Date(user.last_login).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

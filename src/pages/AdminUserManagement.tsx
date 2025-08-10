import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { adminAPI } from '../lib/api';

interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

const AdminUserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch users from real API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setMessage({ 
          type: 'error', 
          text: 'Failed to fetch users. Please try again.' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || user.user_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleUserStatusToggle = async (userId: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      if (user.is_active) {
        await adminAPI.deactivateUser(userId);
      } else {
        await adminAPI.activateUser(userId);
      }

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, is_active: !u.is_active } : u
        )
      );
      
      setMessage({ 
        type: 'success', 
        text: 'User status updated successfully!' 
      });
    } catch (error) {
      console.error('Failed to update user status:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update user status. Please try again.' 
      });
    }
  };

  const handleUserTypeChange = async (userId: number, newType: string) => {
    try {
      await adminAPI.updateUser(userId, { user_type: newType });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, user_type: newType } : u
        )
      );
      
      setMessage({ 
        type: 'success', 
        text: 'User type updated successfully!' 
      });
    } catch (error) {
      console.error('Failed to update user type:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update user type. Please try again.' 
      });
    }
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

  const getUserTypeDisplay = (userType: string) => {
    const types = {
      'guest': 'Guest User',
      'user': 'Free User',
      'subscribed': 'Premium Subscriber',
      'admin': 'Administrator'
    };
    return types[userType as keyof typeof types] || userType;
  };

  if (!user || user.user_type !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredUserType="admin">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage all users in the system
              </p>
            </div>

            {/* Filters and Search */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="guest">Guest</option>
                    <option value="user">Free User</option>
                    <option value="subscribed">Premium</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`mx-6 mt-4 p-3 rounded-md ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserTypeColor(user.user_type)}`}>
                          {getUserTypeDisplay(user.user_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUserStatusToggle(user.id)}
                            className={`px-3 py-1 rounded text-xs ${
                              user.is_active 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <select
                            value={user.user_type}
                            onChange={(e) => handleUserTypeChange(user.id, e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                            disabled={user.id === 1} // Don't allow changing admin's own type
                          >
                            <option value="guest">Guest</option>
                            <option value="user">Free User</option>
                            <option value="subscribed">Premium</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminUserManagement;

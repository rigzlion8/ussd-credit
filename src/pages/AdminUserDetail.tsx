import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'guest' | 'user' | 'subscribed' | 'admin';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string | null;
  avatar_url?: string | null;
}

const AdminUserDetail: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const idNum = Number(userId);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getUser(idNum);
        const payload: any = res?.data;
        const details: AdminUser = (payload?.user ?? payload) as AdminUser;
        setUser(details);
      } catch (e) {
        setMessage({ type: 'error', text: 'Failed to load user' });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [idNum]);

  const handleToggleActive = async () => {
    if (!user) return;
    try {
      if (user.is_active) {
        await adminAPI.deleteUser(user.id);
        setUser({ ...user, is_active: false });
      } else {
        await adminAPI.activateUser(user.id);
        setUser({ ...user, is_active: true });
      }
      setMessage({ type: 'success', text: 'Status updated' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const handleChangeRole = async (newType: AdminUser['user_type']) => {
    if (!user) return;
    try {
      await adminAPI.updateUser(user.id, { user_type: newType });
      setUser({ ...user, user_type: newType });
      setMessage({ type: 'success', text: 'Role updated' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to update role' });
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    try {
      // Use the admin set-password endpoint; we wired it server-side
      await fetch(`/api/admin/users/${user.id}/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ new_password: 'Content101!' })
      });
      setMessage({ type: 'success', text: 'Password reset to Content101!' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to reset password' });
    }
  };

  if (!currentUser || currentUser.user_type !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
          <button className="mt-4 text-blue-600" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const initials = `${(user?.first_name || '').charAt(0)}${(user?.last_name || '').charAt(0)}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
              <p className="text-sm text-gray-600">Manage user details and status</p>
            </div>
            <button className="text-gray-600 hover:text-gray-800" onClick={() => navigate(-1)}>Back</button>
          </div>

          <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 text-center">
              <img
                src={user.avatar_url || ''}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-lg mx-auto';
                  fallback.innerHTML = `<span class="text-2xl font-semibold text-gray-700">${initials || 'U'}</span>`;
                  e.currentTarget.parentElement?.appendChild(fallback);
                }}
              />
              <h2 className="mt-4 text-xl font-semibold">{user.first_name} {user.last_name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {message && (
                <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                    value={user.user_type}
                    onChange={(e) => handleChangeRole(e.target.value as AdminUser['user_type'])}
                    disabled={user.id === 1}
                  >
                    <option value="guest">Guest</option>
                    <option value="user">Free User</option>
                    <option value="subscribed">Premium</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Joined</label>
                  <p className="mt-1 text-sm text-gray-900">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Login</label>
                  <p className="mt-1 text-sm text-gray-900">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleToggleActive}
                  className={`px-4 py-2 rounded-md ${user.is_active ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                  {user.is_active ? 'Deactivate User' : 'Activate User'}
                </button>
                <button
                  onClick={handleResetPassword}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;

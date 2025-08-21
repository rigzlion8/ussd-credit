import React, { useState, useEffect } from 'react';
import { adminAPI, influencerAPI, subscriptionAPI } from '../lib/api';

interface Influencer {
  id: number;
  name: string;
  status: string;
  receivedToday: number;
  receivedTotal: number;
}

interface Subscriber {
  id: number;
  name: string;
  status: string;
  subscriptions: number;
}

interface User {
  id: number;
  phone: string;
  status: string;
}

interface Renewal {
  id: number;
  subscriber: string;
  influencer: string;
  date: string;
}

interface Expiry {
  id: number;
  subscriber: string;
  influencer: string;
  expiry: string;
}

export const AdminDashboard = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for renewals and expiries (these would come from real API endpoints)
  const [renewalsToday] = useState<Renewal[]>([
    { id: 1, subscriber: 'Alice', influencer: 'Jane Doe', date: '2024-06-10T09:00:00' },
  ]);
  const [upcomingExpiries] = useState<Expiry[]>([
    { id: 2, subscriber: 'Bob', influencer: 'John Wick', expiry: '2024-06-12T23:59:59' },
  ]);

  // Fetch data from real APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch influencers
        const influencersResponse = await influencerAPI.getAll();
        const influencersData = Array.isArray(influencersResponse?.data) 
          ? influencersResponse.data.map((inf: any) => ({
              id: inf.id,
              name: inf.name,
              status: inf.is_active ? 'active' : 'suspended',
              receivedToday: inf.received_today || 0,
              receivedTotal: inf.received || 0
            }))
          : [];
        setInfluencers(influencersData);

        // Fetch subscribers
        const subscribersResponse = await subscriptionAPI.getAll();
        const subscribersData = Array.isArray(subscribersResponse?.data)
          ? subscribersResponse.data.map((sub: any) => ({
              id: sub.id,
              name: sub.fan_phone || `Subscriber ${sub.id}`,
              status: sub.is_active ? 'active' : 'inactive',
              subscriptions: 1 // This would need to be calculated based on actual data
            }))
          : [];
        setSubscribers(subscribersData);

        // Fetch users
        const usersResponse = await adminAPI.getUsers();
        const usersData = Array.isArray(usersResponse?.data)
          ? usersResponse.data.map((user: any) => ({
              id: user.id,
              phone: user.phone || user.email,
              status: user.is_active ? 'active' : 'suspended'
            }))
          : [];
        setUsers(usersData);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (
    type: 'influencer' | 'subscriber' | 'user',
    id: number,
    newStatus: 'active' | 'suspended' | 'inactive'
  ) => {
    try {
      if (type === 'influencer') {
        await influencerAPI.update(id, { is_active: newStatus === 'active' });
        setInfluencers((prev) => prev.map((i) => i.id === id ? { ...i, status: newStatus } : i));
      } else if (type === 'subscriber') {
        await subscriptionAPI.update(id, { is_active: newStatus === 'active' });
        setSubscribers((prev) => prev.map((s) => s.id === id ? { ...s, status: newStatus } : s));
      } else if (type === 'user') {
        if (newStatus === 'active') {
          await adminAPI.activateUser(id);
        } else {
          await adminAPI.deactivateUser(id);
        }
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: newStatus } : u));
      }
    } catch (error) {
      console.error(`Failed to update ${type} status:`, error);
      alert(`Failed to update ${type} status. Please try again.`);
    }
  };

  const handleResetPassword = (userId: number) => {
    alert(`Password reset for user ID ${userId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-red-700">Error: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalReceivedToday = influencers.reduce((sum, i) => sum + i.receivedToday, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
          
          {/* Navigation Links */}
          <div className="flex gap-4 mb-8 p-4 bg-white rounded-xl shadow-soft border border-gray-100">
            <a 
              href="/admin/users" 
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center"
            >
              <span className="mr-2">👥</span>
              User Management
            </a>
            <a 
              href="/admin/influencers" 
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center"
            >
              <span className="mr-2">🎯</span>
              Influencer Management
            </a>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-8">
            <div className="text-lg font-semibold text-gray-900">
              Total Received Today: <span className="text-primary-600">KSh {totalReceivedToday}</span>
            </div>
          </div>
        </div>

        {/* Influencers Section */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Influencers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Today</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Received</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {influencers.map((inf) => (
                  <tr key={inf.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inf.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        inf.status === 'active' ? 'bg-green-100 text-green-800' : 
                        inf.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {inf.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KSh {inf.receivedToday}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KSh {inf.receivedTotal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleStatusChange('influencer', inf.id, 'active')}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Activate
                      </button>
                      <button 
                        onClick={() => handleStatusChange('influencer', inf.id, 'suspended')}
                        className="text-yellow-600 hover:text-yellow-900 font-medium"
                      >
                        Suspend
                      </button>
                      <button 
                        onClick={() => handleStatusChange('influencer', inf.id, 'inactive')}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscribers Section */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Subscribers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscriptions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sub.status === 'active' ? 'bg-green-100 text-green-800' : 
                        sub.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.subscriptions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleStatusChange('subscriber', sub.id, 'active')}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Activate
                      </button>
                      <button 
                        onClick={() => handleStatusChange('subscriber', sub.id, 'suspended')}
                        className="text-yellow-600 hover:text-yellow-900 font-medium"
                      >
                        Suspend
                      </button>
                      <button 
                        onClick={() => handleStatusChange('subscriber', sub.id, 'inactive')}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 
                        user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleStatusChange('user', user.id, 'active')}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Activate
                      </button>
                      <button 
                        onClick={() => handleStatusChange('user', user.id, 'suspended')}
                        className="text-yellow-600 hover:text-yellow-900 font-medium"
                      >
                        Suspend
                      </button>
                      <button 
                        onClick={() => handleStatusChange('user', user.id, 'inactive')}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Deactivate
                      </button>
                      <button 
                        onClick={() => handleResetPassword(user.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Renewals and Expiries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Renewals Today</h2>
            <ul className="space-y-3">
              {renewalsToday.map((r) => (
                <li key={r.id} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-600 mr-2">🔄</span>
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">{r.subscriber}</span> renewed{' '}
                    <span className="font-medium">{r.influencer}</span> at{' '}
                    {new Date(r.date).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upcoming Expiry of Subscriptions</h2>
            <ul className="space-y-3">
              {upcomingExpiries.map((e) => (
                <li key={e.id} className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-yellow-600 mr-2">⏰</span>
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">{e.subscriber}</span>'s subscription to{' '}
                    <span className="font-medium">{e.influencer}</span> expires on{' '}
                    {new Date(e.expiry).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 
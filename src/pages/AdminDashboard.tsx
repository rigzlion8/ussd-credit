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
        const influencersData = influencersResponse.data.map((inf: any) => ({
          id: inf.id,
          name: inf.name,
          status: inf.is_active ? 'active' : 'suspended',
          receivedToday: inf.received_today || 0,
          receivedTotal: inf.received || 0
        }));
        setInfluencers(influencersData);

        // Fetch subscribers
        const subscribersResponse = await subscriptionAPI.getAll();
        const subscribersData = subscribersResponse.data.map((sub: any) => ({
          id: sub.id,
          name: sub.fan_phone || `Subscriber ${sub.id}`,
          status: sub.is_active ? 'active' : 'inactive',
          subscriptions: 1 // This would need to be calculated based on actual data
        }));
        setSubscribers(subscribersData);

        // Fetch users
        const usersResponse = await adminAPI.getUsers();
        const usersData = usersResponse.data.map((user: any) => ({
          id: user.id,
          phone: user.phone || user.email,
          status: user.is_active ? 'active' : 'suspended'
        }));
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
    return <div className="admin-dashboard-container">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="admin-dashboard-container">Error: {error}</div>;
  }

  const totalReceivedToday = influencers.reduce((sum, i) => sum + i.receivedToday, 0);

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      <div className="admin-summary">
        <div>Total Received Today: <b>KSh {totalReceivedToday}</b></div>
      </div>

      <h2>Influencers</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Received Today</th>
            <th>Total Received</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {influencers.map((inf) => (
            <tr key={inf.id}>
              <td>{inf.name}</td>
              <td>{inf.status}</td>
              <td>KSh {inf.receivedToday}</td>
              <td>KSh {inf.receivedTotal}</td>
              <td>
                <button onClick={() => handleStatusChange('influencer', inf.id, 'active')}>Activate</button>
                <button onClick={() => handleStatusChange('influencer', inf.id, 'suspended')}>Suspend</button>
                <button onClick={() => handleStatusChange('influencer', inf.id, 'inactive')}>Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Subscribers</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Subscriptions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((sub) => (
            <tr key={sub.id}>
              <td>{sub.name}</td>
              <td>{sub.status}</td>
              <td>{sub.subscriptions}</td>
              <td>
                <button onClick={() => handleStatusChange('subscriber', sub.id, 'active')}>Activate</button>
                <button onClick={() => handleStatusChange('subscriber', sub.id, 'suspended')}>Suspend</button>
                <button onClick={() => handleStatusChange('subscriber', sub.id, 'inactive')}>Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Users</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.phone}</td>
              <td>{user.status}</td>
              <td>
                <button onClick={() => handleStatusChange('user', user.id, 'active')}>Activate</button>
                <button onClick={() => handleStatusChange('user', user.id, 'suspended')}>Suspend</button>
                <button onClick={() => handleStatusChange('user', user.id, 'inactive')}>Deactivate</button>
                <button onClick={() => handleResetPassword(user.id)}>Reset Password</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Renewals Today</h2>
      <ul className="admin-list">
        {renewalsToday.map((r) => (
          <li key={r.id}>{r.subscriber} renewed {r.influencer} at {new Date(r.date).toLocaleString()}</li>
        ))}
      </ul>

      <h2>Upcoming Expiry of Subscriptions</h2>
      <ul className="admin-list">
        {upcomingExpiries.map((e) => (
          <li key={e.id}>{e.subscriber}'s subscription to {e.influencer} expires on {new Date(e.expiry).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}; 
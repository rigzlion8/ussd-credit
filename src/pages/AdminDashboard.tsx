import React, { useState } from 'react';

// Mock data for demonstration
const mockInfluencers = [
  { id: 1, name: 'Jane Doe', status: 'active', receivedToday: 1200, receivedTotal: 50000 },
  { id: 2, name: 'John Wick', status: 'suspended', receivedToday: 800, receivedTotal: 30000 },
];
const mockSubscribers = [
  { id: 1, name: 'Alice', status: 'active', subscriptions: 2 },
  { id: 2, name: 'Bob', status: 'inactive', subscriptions: 1 },
];
const mockUsers = [
  { id: 1, phone: '254710000001', status: 'active' },
  { id: 2, phone: '254710000002', status: 'suspended' },
];
const mockRenewalsToday = [
  { id: 1, subscriber: 'Alice', influencer: 'Jane Doe', date: '2024-06-10T09:00:00' },
];
const mockUpcomingExpiries = [
  { id: 2, subscriber: 'Bob', influencer: 'John Wick', expiry: '2024-06-12T23:59:59' },
];

export const AdminDashboard = () => {
  const [influencers, setInfluencers] = useState(mockInfluencers);
  const [subscribers, setSubscribers] = useState(mockSubscribers);
  const [users, setUsers] = useState(mockUsers);

  const handleStatusChange = (
    type: 'influencer' | 'subscriber' | 'user',
    id: number,
    newStatus: 'active' | 'suspended' | 'inactive'
  ) => {
    if (type === 'influencer') {
      setInfluencers((prev) => prev.map((i) => i.id === id ? { ...i, status: newStatus } : i));
    } else if (type === 'subscriber') {
      setSubscribers((prev) => prev.map((s) => s.id === id ? { ...s, status: newStatus } : s));
    } else if (type === 'user') {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: newStatus } : u));
    }
  };

  const handleResetPassword = (userId: number) => {
    alert(`Password reset for user ID ${userId}`);
  };

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
        {mockRenewalsToday.map((r) => (
          <li key={r.id}>{r.subscriber} renewed {r.influencer} at {new Date(r.date).toLocaleString()}</li>
        ))}
      </ul>

      <h2>Upcoming Expiry of Subscriptions</h2>
      <ul className="admin-list">
        {mockUpcomingExpiries.map((e) => (
          <li key={e.id}>{e.subscriber}'s subscription to {e.influencer} expires on {new Date(e.expiry).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}; 
import React, { useState } from 'react';

// Mock data for demonstration
const mockSubscriber = {
  id: 1,
  name: 'Jane Doe',
  phone: '254700000001',
  imageUrl: '/images/jane_doe.jpg',
  totalPaid: 12340,
  subscriptions: [
    {
      id: 1,
      influencerName: 'John Wick',
      influencerImage: '/images/john_wick.jpg',
      amount: 1000,
      frequency: 'monthly',
      isActive: true,
      lastPaid: '2024-06-01T10:30:00',
    },
    {
      id: 2,
      influencerName: 'Martha Musembi',
      influencerImage: '/images/martha_musembi.jpg',
      amount: 520,
      frequency: 'weekly',
      isActive: false,
      lastPaid: '2024-05-20T09:00:00',
    },
  ],
  transactions: [
    { id: 1, amount: 1000, date: '2024-06-01T10:30:00', influencer: 'John Wick' },
    { id: 2, amount: 520, date: '2024-05-20T09:00:00', influencer: 'Martha Musembi' },
  ],
};

export const SubscriberDashboard = () => {
  const [subscriptions, setSubscriptions] = useState(mockSubscriber.subscriptions);

  const handleCancel = (id: number) => {
    setSubscriptions((subs) =>
      subs.map((sub) => (sub.id === id ? { ...sub, isActive: false } : sub))
    );
  };

  const handleRenew = (id: number) => {
    setSubscriptions((subs) =>
      subs.map((sub) => (sub.id === id ? { ...sub, isActive: true } : sub))
    );
  };

  const handlePayForAnother = () => {
    alert('Feature coming soon: Pay for another subscriber!');
  };

  return (
    <div className="subscriber-dashboard-container">
      <h1>Subscriber Dashboard</h1>
      <div className="subscriber-profile">
        <img
          src={mockSubscriber.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(mockSubscriber.name)}`}
          alt={mockSubscriber.name}
          className="subscriber-profile-img"
        />
        <div className="subscriber-profile-details">
          <h2>{mockSubscriber.name}</h2>
          <p>Phone: {mockSubscriber.phone}</p>
          <p>Total Paid Out: <b>KSh {mockSubscriber.totalPaid}</b></p>
          <p>Influencers Subscribed: <b>{subscriptions.length}</b></p>
        </div>
      </div>

      <h3>My Subscriptions</h3>
      <ul className="subscription-list">
        {subscriptions.map((sub) => (
          <li key={sub.id} className="subscription-item">
            <img src={sub.influencerImage} alt={sub.influencerName} className="subscription-influencer-img" />
            <div className="subscription-details">
              <span className="influencer-name">{sub.influencerName}</span>
              <span className="subscription-amount">KSh {sub.amount} ({sub.frequency})</span>
              <span className="subscription-status">{sub.isActive ? 'Active' : 'Cancelled'}</span>
              <span className="subscription-lastpaid">Last Paid: {new Date(sub.lastPaid).toLocaleString()}</span>
            </div>
            <div className="subscription-actions">
              {sub.isActive ? (
                <button onClick={() => handleCancel(sub.id)} className="cancel-btn">Cancel</button>
              ) : (
                <button onClick={() => handleRenew(sub.id)} className="renew-btn">Renew</button>
              )}
              <button onClick={handlePayForAnother} className="pay-btn">Pay</button>
            </div>
          </li>
        ))}
      </ul>

      <h3>Transaction History</h3>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Influencer</th>
            <th>Amount (KSh)</th>
          </tr>
        </thead>
        <tbody>
          {mockSubscriber.transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{new Date(tx.date).toLocaleString()}</td>
              <td>{tx.influencer}</td>
              <td>{tx.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 
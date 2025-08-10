import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionAPI, userAPI } from '../lib/api';

interface Subscription {
  id: number;
  influencerName: string;
  influencerImage: string;
  amount: number;
  frequency: string;
  isActive: boolean;
  lastPaid: string;
}

interface Transaction {
  id: number;
  amount: number;
  date: string;
  influencer: string;
}

interface SubscriberData {
  id: number;
  name: string;
  phone: string;
  imageUrl: string;
  totalPaid: number;
  subscriptions: Subscription[];
  transactions: Transaction[];
}

export const SubscriberDashboard = () => {
  const { user } = useAuth();
  const [subscriberData, setSubscriberData] = useState<SubscriberData | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscriber data from real API
  useEffect(() => {
    const fetchSubscriberData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user's subscriptions
        const subscriptionsResponse = await subscriptionAPI.getAll();
        const userSubscriptions = subscriptionsResponse.data.filter((sub: any) => 
          sub.fan_phone === user.phone || sub.user_id === user.id
        );

        // Transform subscription data
        const transformedSubscriptions: Subscription[] = userSubscriptions.map((sub: any) => ({
          id: sub.id,
          influencerName: sub.influencer_name || `Influencer ${sub.influencer_id}`,
          influencerImage: sub.influencer_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.influencer_name || 'Influencer')}`,
          amount: sub.amount,
          frequency: sub.frequency,
          isActive: sub.is_active,
          lastPaid: sub.last_paid || sub.created_at
        }));

        setSubscriptions(transformedSubscriptions);

        // Create subscriber data object
        const data: SubscriberData = {
          id: user.id,
          name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email || 'User',
          phone: user.phone || 'N/A',
          imageUrl: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || user.email || 'User')}`,
          totalPaid: transformedSubscriptions.reduce((sum, sub) => sum + sub.amount, 0),
          subscriptions: transformedSubscriptions,
          transactions: transformedSubscriptions.map(sub => ({
            id: sub.id,
            amount: sub.amount,
            date: sub.lastPaid,
            influencer: sub.influencerName
          }))
        };

        setSubscriberData(data);

      } catch (error) {
        console.error('Failed to fetch subscriber data:', error);
        setError('Failed to load subscriber data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriberData();
  }, [user]);

  const handleCancel = async (id: number) => {
    try {
      await subscriptionAPI.update(id, { is_active: false });
      setSubscriptions((subs) =>
        subs.map((sub) => (sub.id === id ? { ...sub, isActive: false } : sub))
      );
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  const handleRenew = async (id: number) => {
    try {
      await subscriptionAPI.update(id, { is_active: true });
      setSubscriptions((subs) =>
        subs.map((sub) => (sub.id === id ? { ...sub, isActive: true } : sub))
      );
    } catch (error) {
      console.error('Failed to renew subscription:', error);
      alert('Failed to renew subscription. Please try again.');
    }
  };

  const handlePayForAnother = () => {
    alert('Feature coming soon: Pay for another subscriber!');
  };

  if (isLoading) {
    return <div className="subscriber-dashboard-container">Loading subscriber data...</div>;
  }

  if (error) {
    return <div className="subscriber-dashboard-container">Error: {error}</div>;
  }

  if (!subscriberData) {
    return <div className="subscriber-dashboard-container">No subscriber data available.</div>;
  }

  return (
    <div className="subscriber-dashboard-container">
      <h1>Subscriber Dashboard</h1>
      <div className="subscriber-profile">
        <img
          src={subscriberData.imageUrl}
          alt={subscriberData.name}
          className="subscriber-profile-img"
        />
        <div className="subscriber-profile-details">
          <h2>{subscriberData.name}</h2>
          <p>Phone: {subscriberData.phone}</p>
          <p>Total Paid Out: <b>KSh {subscriberData.totalPaid}</b></p>
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
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {subscriberData.transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{new Date(tx.date).toLocaleString()}</td>
              <td>{tx.influencer}</td>
              <td>KSh {tx.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 
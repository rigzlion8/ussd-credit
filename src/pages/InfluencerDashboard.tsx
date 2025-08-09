import { useInfluencers } from '../hooks/useInfluencers';
import { useState } from 'react';

const getTodayRevenue = (influencerId: number) => {
  // TODO: Replace with real logic. For now, return a random value for demo.
  return Math.floor(Math.random() * 1000) + 100;
};

const getProjectedRevenue = (influencerId: number, total: number) => {
  // TODO: Replace with real logic. For now, project a 10% increase over total.
  return Math.round(total * 1.1);
};

export const InfluencerDashboard = () => {
  const { influencers, isLoading, error } = useInfluencers();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const influencer = selectedId
    ? influencers.find((inf) => inf.id === selectedId)
    : influencers[0];

  if (!influencer) return <div>No influencer data found.</div>;

  const todayRevenue = getTodayRevenue(influencer.id);
  const projectedRevenue = getProjectedRevenue(influencer.id, influencer.received);

  return (
    <div className="dashboard-container">
      <h1>Creators Dashboard</h1>
      <div className="dashboard-profile">
        <img
          src={influencer.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}`}
          alt={influencer.name}
          className="dashboard-profile-img"
        />
        <div className="dashboard-profile-details">
          <h2>{influencer.name}</h2>
          <p>Phone: {influencer.phone}</p>
        </div>
      </div>
      <div className="dashboard-metrics">
        <div className="dashboard-metric">
          <span className="metric-label">Received Today</span>
          <span className="metric-value">KSh {todayRevenue}</span>
        </div>
        <div className="dashboard-metric">
          <span className="metric-label">Total Received</span>
          <span className="metric-value">KSh {influencer.received}</span>
        </div>
        <div className="dashboard-metric">
          <span className="metric-label">Projected Revenue</span>
          <span className="metric-value">KSh {projectedRevenue}</span>
        </div>
      </div>
      <div className="dashboard-selector">
        <label>Select Influencer: </label>
        <select
          value={selectedId ?? influencer.id}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          {influencers.map((inf) => (
            <option key={inf.id} value={inf.id}>
              {inf.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}; 
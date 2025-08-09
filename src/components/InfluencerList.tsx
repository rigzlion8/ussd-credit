import { useInfluencers } from '../hooks/useInfluencers';
import { SubscribeForm } from './SubscribeForm';

interface Influencer {
  id: number;
  name: string;
  phone: string;
  received: number;
  imageUrl?: string; // Make imageUrl optional
}

export const InfluencerList = () => {
  const { influencers, isLoading, error } = useInfluencers();

  if (isLoading) return <div className="loading">Loading influencers...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="influencer-list">
      {/* <h2>Available Creators</h2> */}
      {influencers.length === 0 ? (
        <p>No influencers found</p>
      ) : (
        <ul className="influencer-items">
          {influencers.map((influencer) => (
            <li key={influencer.id} className="influencer-item">
              <SubscribeForm 
                influencerId={influencer.id} 
                influencerName={influencer.name} 
                influencerPhone={influencer.phone}
                influencerReceived={influencer.received}
                influencerImageUrl={influencer.imageUrl}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
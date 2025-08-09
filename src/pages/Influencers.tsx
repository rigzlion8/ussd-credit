import { useInfluencers } from '../hooks/useInfluencers';

export const InfluencersPage = () => {
  const { influencers } = useInfluencers();

  return (
    <div>
      <h1>Influencers</h1>
      <ul>
        {influencers.map((influencer) => (
          <li key={influencer.id}>
            {influencer.name} - Balance: KSh {influencer.received}
          </li>
        ))}
      </ul>
    </div>
  );
};
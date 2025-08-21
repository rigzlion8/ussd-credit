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

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading influencers...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Available Creators</h1>
          <p className="text-lg text-gray-600">Subscribe to your favorite influencers and support their content</p>
        </div>
        
        {influencers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <p className="text-xl text-gray-600">No influencers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {influencers.map((influencer) => (
              <div key={influencer.id}>
                <SubscribeForm 
                  influencerId={influencer.id} 
                  influencerName={influencer.name} 
                  influencerPhone={influencer.phone}
                  influencerReceived={influencer.received}
                  influencerImageUrl={influencer.imageUrl}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
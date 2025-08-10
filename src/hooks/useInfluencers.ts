import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Influencer {
  id: number;
  name: string;
  phone: string;
  received: number;
  imageUrl?: string;
}

export const useInfluencers = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchInfluencers = async () => {
      try {
        const response = await api.get('/api/influencers');
        const items = (response.data || []).map((x: any) => ({
          ...x,
          imageUrl: x.imageUrl ?? x.image_url ?? '',
        }));
        if (isMounted) setInfluencers(items);
      } catch (err) {
        if (isMounted) setError(err as Error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInfluencers();
    // Removed the setInterval that was causing continuous API calls

    return () => {
      isMounted = false;
    };
  }, []);

  return { influencers, isLoading, error };
};
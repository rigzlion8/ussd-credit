import { useState, useEffect } from 'react';
import axios from 'axios';

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
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001'}/api/influencers`);
        if (isMounted) setInfluencers(response.data);
      } catch (err) {
        if (isMounted) setError(err as Error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInfluencers();
    const interval = setInterval(fetchInfluencers, 5000); // Poll every 5 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { influencers, isLoading, error };
};
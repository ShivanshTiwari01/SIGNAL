'use Client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setAuthToken } from '@/store/axios';

export function useAuthToken() {
  const { getToken } = useAuth();

  useEffect(() => {
    let cancelled = false;

    getToken().then((token) => {
      if (!cancelled) {
        setAuthToken(token);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [getToken]);
}

import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const callApi = useCallback(async <T>(
    apiCall: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      if (successMessage) {
        showNotification(successMessage, 'success');
      }
      return result;
    } catch (err: any) {
      const message = errorMessage || err.response?.data?.message || 'An error occurred';
      setError(message);
      showNotification(message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  return { loading, error, callApi };
};
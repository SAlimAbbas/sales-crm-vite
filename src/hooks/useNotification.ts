import { useNotification } from '../contexts/NotificationContext';

export const useNotificationHook = () => {
  return useNotification();
};
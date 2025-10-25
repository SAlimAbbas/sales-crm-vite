import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { notificationService } from "../services/notificationService";
import { Notification } from "../types";
import { useAuth } from "./AuthContext";

interface NotificationSystemContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationSystemContext = createContext<
  NotificationSystemContextType | undefined
>(undefined);

export const NotificationSystemProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();

      // ✅ Handle wrapped response
      const count =
        typeof response === "object" && "data" in response && response.data
          ? (response.data as any).count || 0
          : (response as any).count || 0;

      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications({
        per_page: 20,
      });

      // ✅ Handle all possible return types
      let notificationData: Notification[] = [];

      if (Array.isArray(response)) {
        // Direct array
        notificationData = response;
      } else if (response && typeof response === "object") {
        // Check for nested data property (ApiResponse wrapper)
        if ("data" in response && response.data) {
          // Check if data is NotificationsResponse
          if ("data" in response.data && Array.isArray(response.data.data)) {
            notificationData = response.data.data;
          }
          // Or if data is direct array
          else if (Array.isArray(response.data)) {
            notificationData = response.data;
          }
        }
        // Or direct NotificationsResponse
        else if ("data" in response && Array.isArray(response.data)) {
          notificationData = response.data;
        }
      }

      setNotifications(notificationData);
      await refreshUnreadCount();
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [refreshUnreadCount]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  // ✅ ADD this instead:
  useEffect(() => {
    if (!user) return;

    // Only fetch unread count on mount
    refreshUnreadCount();
    // fetchNotifications is only called from Header.tsx when drawer opens

    // Auto-refresh count
    const interval = setInterval(() => {
      if (user) {
        refreshUnreadCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <NotificationSystemContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationSystemContext.Provider>
  );
};

export const useNotificationSystem = () => {
  const context = useContext(NotificationSystemContext);
  if (!context) {
    throw new Error(
      "useNotificationSystem must be used within NotificationSystemProvider"
    );
  }
  return context;
};

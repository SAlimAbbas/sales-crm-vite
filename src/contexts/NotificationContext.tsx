import React, { createContext, useContext, useState, ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface NotificationContextType {
  showNotification: (
    message: string,
    type?: Notification["type"],
    duration?: number
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (
    message: string,
    type: Notification["type"] = "info",
    duration = 6000
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
  };

  const handleClose = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};

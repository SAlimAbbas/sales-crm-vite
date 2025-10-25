import React from "react";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Chip,
  ListItemButton,
} from "@mui/material";
import {
  CheckCircle,
  Assignment,
  Person,
  TrendingUp,
  Notifications as NotificationsIcon,
  Close,
  DoneAll,
  Warning,
  AccessTime,
} from "@mui/icons-material";
import { useNotificationSystem } from "../../contexts/NotificationSystemContext";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/notifications");
    onClose();
  };

  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } =
    useNotificationSystem();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
      case "task_completed":
        return <Assignment />;
      case "followup_reminder":
        return <NotificationsIcon />;
      case "lead_assigned":
      case "lead_status_changed":
        return <TrendingUp />;
      case "user_created":
      case "user_updated":
        return <Person />;
      case "task_overdue":
        return <Warning />; // Add Warning icon
      case "task_reminder":
        return <AccessTime />; // Add AccessTime icon
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "task_overdue":
        return "#F44336"; // Red
      case "task_reminder":
        return "#FF9800"; // Orange
      case "task_assigned":
        return "#2196F3";
      case "task_completed":
        return "#4CAF50";
      case "followup_reminder":
        return "#FF9800";
      case "lead_assigned":
        return "#9C27B0";
      case "lead_status_changed":
        return "#00BCD4";
      default:
        return "#757575";
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.read_at) {
      markAsRead(notification.id);
    }

    // Parse data
    let data;
    try {
      data =
        typeof notification.data === "string"
          ? JSON.parse(notification.data)
          : notification.data;
    } catch (e) {
      data = notification.data;
    }

    // Navigate based on type
    switch (notification.type) {
      case "lead_assigned":
      case "lead_status_changed":
        navigate("/leads");
        break;

      case "task_assigned":
      case "task_completed":
      case "task_overdue":
      case "task_reminder":
        navigate("/tasks");

        break;

      case "followup_reminder":
        navigate("/followups");

        break;
      default:
        // Do nothing or show details
        break;
    }

    onClose(); // Close the drawer
  };

  return (
    <Box
      sx={{
        width: 400,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Chip label={unreadCount} size="small" color="error" />
          )}
        </Box>
        <Box>
          {unreadCount > 0 && (
            <IconButton
              size="small"
              onClick={markAllAsRead}
              title="Mark all as read"
            >
              <DoneAll fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Notifications List */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <NotificationsIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItemButton
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read_at
                      ? "transparent"
                      : "action.hover",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "action.selected",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: getNotificationColor(notification.type),
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.read_at ? 400 : 600,
                            flex: 1,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read_at && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.disabled"
                        >
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            {
                              addSuffix: true,
                            }
                          )}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItemButton>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      {notifications.length > 0 && (
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Button
              size="small"
              fullWidth
              variant="text"
              onClick={handleViewAll}
            >
              View All Notifications
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default NotificationPanel;

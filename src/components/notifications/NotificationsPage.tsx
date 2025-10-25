// src/pages/NotificationsPage.tsx
import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Tabs,
  Tab,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Assignment,
  Person,
  TrendingUp,
  Notifications as NotificationsIcon,
  DoneAll,
  Delete,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useNotificationSystem } from "../../contexts/NotificationSystemContext";
import { useNavigate } from "react-router-dom";

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead } =
    useNotificationSystem();
  const [filter, setFilter] = useState<"all" | "unread">("all");

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
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read_at)
      : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
      case "task_completed":
        return <Assignment />;
      case "lead_assigned":
      case "lead_status_changed":
        return <TrendingUp />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "#2196F3";
      case "task_completed":
        return "#4CAF50";
      case "followup_reminder":
        return "#FF9800";
      case "lead_assigned":
        return "#9C27B0";
      default:
        return "#757575";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5">All Notifications</Typography>
          <Button
            startIcon={<DoneAll />}
            onClick={markAllAsRead}
            disabled={notifications.every((n) => n.read_at)}
          >
            Mark All as Read
          </Button>
        </Box>

        <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ mb: 2 }}>
          <Tab label="All" value="all" />
          <Tab label="Unread" value="unread" />
        </Tabs>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : filteredNotifications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <NotificationsIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read_at
                      ? "transparent"
                      : "action.hover",
                    cursor: "pointer",
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{ bgcolor: getNotificationColor(notification.type) }}
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
                          variant="subtitle1"
                          sx={{ fontWeight: notification.read_at ? 400 : 600 }}
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
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                          }}
                        >
                          {notification.message}
                        </span>
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.75rem",
                            marginTop: "4px",
                          }}
                        >
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </span>
                      </React.Fragment>
                    }
                  />
                  {!notification.read_at && (
                    <Button
                      size="small"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationsPage;

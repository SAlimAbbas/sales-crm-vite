import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Badge,
  Drawer,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Campaign as CampaignIcon,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useNotificationSystem } from "../../contexts/NotificationSystemContext";
import { useQuery } from "@tanstack/react-query";
import { announcementService, Announcement } from "../../services/announcementService";
import NotificationPanel from "../notifications/NotificationPanel";
import ClockInOutButton from "../attendance/ClockInOutButton";
import AnnouncementDrawer from "../announcement/AnnouncementDrawer";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const { toggleTheme, isDark } = useThemeContext();
  const { unreadCount, fetchNotifications, markAllAsRead } =
    useNotificationSystem();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] =
    React.useState(false);
  const [announcementDrawerOpen, setAnnouncementDrawerOpen] =
    React.useState(false);

  const { data: announcementData } = useQuery<any>({
    queryKey: ["my-announcements"],
    queryFn: () => announcementService.getMyAnnouncements(),
    staleTime: 2 * 60 * 1000,
  });
  const myAnnouncements: Announcement[] = announcementData?.data ?? [];

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = () => {
    setNotificationDrawerOpen(true);
    markAllAsRead();
    fetchNotifications(); // Refresh notifications when opening
  };

  const handleNotificationDrawerClose = () => {
    setNotificationDrawerOpen(false);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      showNotification("Logged out successfully", "success");
    } catch (error) {
      showNotification("Logout failed", "error");
    }
    handleMenuClose();
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.name ? `Welcome, ${user.name}` : "Welcome"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {user?.role !== "admin" && <ClockInOutButton />}
            {/* Theme Toggle Button */}
            <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton
                onClick={toggleTheme}
                color="inherit"
                aria-label="toggle theme"
              >
                {isDark ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            {/* Announcement Icon Button (Right after Theme Toggle) */}
            <Tooltip title="Company Announcements">
              <IconButton
                size="large"
                aria-label="show announcements"
                color="inherit"
                onClick={() => setAnnouncementDrawerOpen(true)}
              >
                <Badge badgeContent={myAnnouncements.length} color="warning">
                  <CampaignIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notification Button with Live Badge */}
            <Tooltip title="Notifications">
              <IconButton
                size="large"
                aria-label="show notifications"
                color="inherit"
                onClick={handleNotificationsOpen}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Profile Chip */}
            <Chip
              avatar={
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user?.name?.charAt(0)}
                </Avatar>
              }
              label={
                <Box>
                  <Typography variant="body2">{user?.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {user?.role}
                  </Typography>
                </Box>
              }
              onClick={handleProfileMenuOpen}
              variant="outlined"
              sx={{
                height: 48,
                padding: 1,
                borderColor: "divider",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            />
          </Box>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { width: 200, mt: 1 },
            }}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={notificationDrawerOpen}
        onClose={handleNotificationDrawerClose}
        sx={{
          "& .MuiDrawer-paper": {
            width: 400,
            boxSizing: "border-box",
          },
        }}
      >
        <NotificationPanel onClose={handleNotificationDrawerClose} />
      </Drawer>

      {/* Announcement Drawer */}
      <AnnouncementDrawer
        open={announcementDrawerOpen}
        onClose={() => setAnnouncementDrawerOpen(false)}
        announcements={myAnnouncements}
      />
    </>
  );
};

export default Header;

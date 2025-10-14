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
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useThemeContext } from "../../contexts/ThemeContext";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const { toggleTheme, isDark } = useThemeContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] =
    React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
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
          {/* ✅ Add Theme Toggle Button */}
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            aria-label="toggle theme"
            sx={{ mr: 1 }}
          >
            {isDark ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <IconButton
            size="large"
            aria-label="show notifications"
            color="inherit"
            onClick={handleNotificationsOpen}
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

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

        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { width: 360, maxHeight: 400 },
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2">Notification system not available right now</Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

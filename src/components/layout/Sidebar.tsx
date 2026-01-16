import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  ExitToApp as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  StyledDrawer,
  DrawerHeader,
} from "../../styles/components/layoutStyles";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/",
      roles: ["admin", "manager", "salesperson", "lead_executive", "backend"],
    },
    {
      text: "Users",
      icon: <PeopleIcon />,
      path: "/users",
      roles: ["admin", "manager"],
    },
    {
      text: "Leads",
      icon: <BusinessIcon />,
      path: "/leads",
      roles: ["admin", "manager", "salesperson", "lead_executive"],
    },
    {
      text: "Tasks",
      icon: <AssignmentIcon />,
      path: "/tasks",
      roles: ["admin", "manager", "salesperson"],
    },
    {
      text: "Reminders",
      icon: <ScheduleIcon />,
      path: "/followups",
      roles: ["admin", "manager", "salesperson"],
    },
    {
      text: "Analytics (Under Development)",
      icon: <AnalyticsIcon />,
      path: "/analytics",
      roles: ["admin", "manager"],
    },
    {
      text: "Converted Clients",
      icon: <BusinessIcon />,
      path: "/converted-clients",
      roles: ["admin", "manager"],
      // element: <ConvertedClientManagement />,
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <StyledDrawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <DrawerHeader>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <motion.img
            src="/images/logo.png"
            alt="Logo"
            style={{ width: 60, height: 60 }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          />
          <Typography variant="h6" noWrap component="div">
            EW Sales Leads
          </Typography>
        </Box>
      </DrawerHeader>

      <Divider />

      <List sx={{ flexGrow: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;

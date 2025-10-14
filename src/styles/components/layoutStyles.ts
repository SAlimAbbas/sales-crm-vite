import { styled } from "@mui/material/styles";
import { Drawer, AppBar, Box } from "@mui/material";

const drawerWidth = 280;

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
    borderRight: "1px solid",
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.paper,
    top: 64, // Add this to push drawer below header
    height: "calc(100% - 64px)", // Adjust height
  },
}));

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 1px 3px rgba(255,255,255,0.12)"
      : "0 1px 3px rgba(0,0,0,0.12)",
  borderBottom: "1px solid",
  borderColor: theme.palette.divider,
}));

export const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: "64px",
  minHeight: "calc(100vh - 64px)",
  backgroundColor: theme.palette.background.default,
}));

export const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2),
  borderBottom: "1px solid",
  borderColor: theme.palette.divider,
  minHeight: "64px",
}));

export const ContentBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  boxShadow: theme.shadows[1],
}));

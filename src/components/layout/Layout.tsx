import React, { useState } from "react";
import { Box } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { MainContent } from "../../styles/components/layoutStyles";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Header onMenuClick={toggleSidebar} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MainContent
        sx={{
          marginLeft: sidebarOpen ? "280px" : "0px",
          transition: "margin-left 0.3s ease",
        }}
      >
        {children}
        <Footer />
      </MainContent>
    </Box>
  );
};

export default Layout;

import React from "react";
import { Navigate } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import { useAuth } from "../../contexts/AuthContext";
const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  // Route lead executives to their specific dashboard
  if (user?.role === "lead_executive") {
    return <Navigate to="/lead-executive/dashboard" replace />;
  }

  // Route backend staff to their specific dashboard
  if (user?.role === "backend") {
    return <Navigate to="/backend/dashboard" replace />;
  }

  // Default dashboard for admin, manager, salesperson
  return <Dashboard />;
};

export default DashboardRouter;

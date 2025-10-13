import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Components
import Layout from "./components/layout/Layout";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import UserManagement from "./components/users/UserManagement";
import LeadManagement from "./components/leads/LeadManagement";
import TaskManagement from "./components/tasks/TaskManagement";
import { NotificationProvider } from "./contexts/NotificationContext";
import FollowupManagement from "./components/followups/FollowupManagement";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import LoadingSkeleton from "./components/common/LoadingSkeleton";
import { CustomThemeProvider } from "./contexts/ThemeContext";

// Styles
import { theme } from "./styles/theme";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Use dashboard skeleton for initial auth loading
    return (
      <LoadingSkeleton
        variant="dashboard"
        fullScreen
        message="Loading application..."
      />
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="leads" element={<LeadManagement />} />
                <Route path="tasks" element={<TaskManagement />} />
                <Route path="followups" element={<FollowupManagement />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <AppRoutes />
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </CustomThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

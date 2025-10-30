import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Alert,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  GetApp as DownloadIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../../services/analyticsService";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
// import LoadingSpinner from "../common/LoadingSpinner";
import LoadingSkeleton from "../common/LoadingSkeleton";
import LeadsChart from "./Charts/LeadsChart";
import ConversionChart from "./Charts/ConversionChart";
import PerformanceChart from "./Charts/PerformanceChart";
import LeadsReport from "./Reports/LeadsReport";
import PerformanceReport from "./Reports/PerformanceReport";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  suffix?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = "primary",
  suffix = "",
}) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
            {suffix}
          </Typography>
        </Box>
        <Box
          sx={{
            color: `${color}.main`,
            backgroundColor: `${color}.light`,
            borderRadius: "50%",
            p: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [dateRange, setDateRange] = useState("this_month");
  const [showReports, setShowReports] = useState(false);
  const [reportType, setReportType] = useState<"leads" | "performance">(
    "leads"
  );

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["analytics-dashboard", dateRange],
    queryFn: () => analyticsService.getDashboard({ range: dateRange }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleExportReport = async (type: string, format: string) => {
    try {
      // Pass the range parameter correctly
      await analyticsService.exportReport(type, format, { range: dateRange });
      showNotification(`${type} report exported successfully`, "success");
    } catch (error: any) {
      console.error("Export error:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to export report";
      showNotification(errorMessage, "error");
    }
  };

  if (isLoading) {
    return (
      <LoadingSkeleton
        variant="dashboard"
        message="Loading analytics data..."
      />
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Analytics Dashboard
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          Unable to load analytics data. Please try again later.
        </Alert>
      </Box>
    );
  }

  const summary = dashboardData?.summary;
  const charts = dashboardData?.charts;
  const performance = dashboardData?.performance;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Analytics Dashboard</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="last_7_days">Last 7 days</MenuItem>
              <MenuItem value="this_week">This week</MenuItem>
              <MenuItem value="last_week">Last week</MenuItem>
              <MenuItem value="last_30_days">Last 30 days</MenuItem>
              <MenuItem value="this_month">This month</MenuItem>
              <MenuItem value="last_month">Last month</MenuItem>
              <MenuItem value="year_to_date">Year to date</MenuItem>
              <MenuItem value="lifetime">Lifetime</MenuItem>
              {/* <MenuItem value="custom">Custom</MenuItem> */}
            </Select>
          </FormControl>
          {user?.role !== "salesperson" && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => setShowReports(true)}
            >
              Export Reports
            </Button>
          )}
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Total Leads"
            value={summary?.total_leads || 0}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Conversion Rate"
            value={summary?.conversion_rate || 0}
            icon={<TrendingUpIcon />}
            color="success"
            suffix="%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Active Reminders"
            value={summary?.active_followups || 0}
            icon={<ScheduleIcon />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Overdue Tasks"
            value={summary?.overdue_tasks || 0}
            icon={<AssignmentIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lead Trends
            </Typography>
            <LeadsChart data={charts?.daily_trends || []} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Conversion Breakdown
            </Typography>
            <ConversionChart data={charts?.conversion_breakdown} />
          </Paper>
        </Grid>
      </Grid>

      {/* Leads by Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Leads by Status
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {charts?.leads_by_status?.map((item) => (
                <Chip
                  key={item.status}
                  label={`${item.status}: ${item.count}`}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Invalid Leads
            </Typography>
            <Typography variant="h4" color="error.main">
              {summary?.invalid_percentage || 0}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              of total leads are invalid
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Performance Section - Only for managers and admins */}
      {user?.role !== "salesperson" &&
        performance &&
        performance.length > 0 && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Team Performance
            </Typography>
            <PerformanceChart data={performance} />
          </Paper>
        )}

      {/* Reports Modal/Section */}
      {showReports && (
        <Paper sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Export Reports</Typography>
            <Button onClick={() => setShowReports(false)}>Close</Button>
          </Box>

          <Box display="flex" gap={2} mb={3}>
            <Button
              variant={reportType === "leads" ? "contained" : "outlined"}
              onClick={() => setReportType("leads")}
            >
              Leads Report
            </Button>
            <Button
              variant={reportType === "performance" ? "contained" : "outlined"}
              onClick={() => setReportType("performance")}
            >
              Performance Report
            </Button>
          </Box>

          {reportType === "leads" ? (
            <LeadsReport
              onExport={(format) => handleExportReport("leads", format)}
              dateRange={dateRange}
            />
          ) : (
            <PerformanceReport
              onExport={(format) => handleExportReport("performance", format)}
              dateRange={dateRange}
            />
          )}
        </Paper>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;

import React, { useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../../services/analyticsService";
import LoadingSkeleton from "../common/LoadingSkeleton";
import StatsCard from "./StatsCard";
import QuickActions from "./QuickActions";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import AttendanceReportsSection from "../attendance/AttendanceReportsSection";
import AnnouncementBanner from "../announcement/AnnouncementBanner";
import ManageAnnouncementsSection from "../announcement/ManageAnnouncementsSection";

const COLORS = {
  primary: "#1976d2",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  info: "#0288d1",
};

const PIE_COLORS = [COLORS.success, COLORS.error, COLORS.info];

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState("this_month");
  const { user } = useAuth();

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard", dateRange],
    queryFn: () => analyticsService.getDashboard({ range: dateRange }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const handleExport = async () => {
    try {
      await analyticsService.exportReport("leads", "pdf", { range: dateRange });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton variant="dashboard" fullScreen />;
  }

  if (error) {
    console.error("Dashboard API Error:", error);
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Dashboard
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          Unable to load dashboard data. There's an issue with the analytics
          service.
        </Alert>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard
              title="Total Leads (All Time)"
              value="--"
              icon={<BusinessIcon />}
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard
              title="Conversion Rate"
              value="--"
              icon={<CheckCircleIcon />}
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard
              title="Active Reminders"
              value="--"
              icon={<ScheduleIcon />}
              color="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatsCard
              title="Overdue Tasks"
              value="--"
              icon={<WarningIcon />}
              color="error"
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const stats = dashboardData?.summary;
  const charts = dashboardData?.charts;
  const performance = dashboardData?.performance;

  const conversionData = charts?.conversion_breakdown
    ? [
        {
          name: "Converted",
          value: Number(charts.conversion_breakdown.converted) || 0,
        },
        {
          name: "Invalid",
          value: Number(charts.conversion_breakdown.invalid) || 0,
        },
        {
          name: "Active",
          value: Number(charts.conversion_breakdown.active) || 0,
        },
      ].filter((item) => item.value > 0) // ✅ Filter out zero values
    : [];

  return (
    <Box>
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="600">
          Dashboard Overview
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
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
          {(user?.role === "admin" || user?.role === "manager") && (
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
            >
              Export Report
            </Button>
          )}
        </Box>
      </Box>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title={`Total Leads ${dateRange.replace(/_/g, " ")}`}
            value={stats?.total_leads || 0}
            icon={<BusinessIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Conversion Rate"
            value={`${stats?.conversion_rate || 0}%`}
            subtitle={`${stats?.total_leads || 0} total leads`}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Active Reminders"
            value={stats?.active_followups || 0}
            subtitle="Scheduled Reminders"
            icon={<ScheduleIcon />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Overdue Tasks"
            value={stats?.overdue_tasks || 0}
            subtitle={`${stats?.invalid_percentage || 0}% invalid leads`}
            icon={<WarningIcon />}
            color="error"
          />
        </Grid>

        {/* Quick Actions */}
        <Grid size={12}>
          <QuickActions />
        </Grid>

        {user?.role === "admin" && (
          <Grid size={12}>
            <ManageAnnouncementsSection />
          </Grid>
        )}

        {/* Lead Trends Chart */}
        {charts?.daily_trends && charts.daily_trends.length > 0 && (
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Lead Trends {dateRange.replace(/_/g, " ")}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={charts.daily_trends}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke={COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Conversion Breakdown Pie Chart */}
        {conversionData.length > 0 &&
          conversionData.some((item) => item.value > 0) && (
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Lead Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={conversionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) =>
                        `${props.name}: ${(props.percent * 100).toFixed(1)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {conversionData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          )}

        {/* Leads by Status Bar Chart */}
        {charts?.leads_by_status && charts.leads_by_status.length > 0 && (
          <Grid size={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Leads by Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.leads_by_status}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill={COLORS.primary}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Team Performance Table */}
        {performance && performance.length > 0 && (
          <Grid size={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Team Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Salesperson</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Leads Handled</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Conversions</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Conv. Rate</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Avg Response (hrs)</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Follow-ups</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performance.map((perf, index) => (
                      <TableRow key={index}>
                        <TableCell>{perf.salesperson}</TableCell>
                        <TableCell align="center">
                          {perf.leads_handled}
                        </TableCell>
                        <TableCell align="center">
                          {perf.conversions_achieved}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${perf.conversion_rate}%`}
                            color={
                              perf.conversion_rate > 25 ? "success" : "warning"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {perf.avg_response_time_hours}
                        </TableCell>
                        <TableCell align="center">
                          {perf.follow_ups_completed}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}

        {(user?.role === "admin" || user?.role === "manager") && (
          <Grid size={12}>
            <AttendanceReportsSection />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;

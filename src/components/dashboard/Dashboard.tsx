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
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  FileDownload as FileDownloadIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
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
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import AttendanceReportsSection from "../attendance/AttendanceReportsSection";
import ManageAnnouncementsSection from "../announcement/ManageAnnouncementsSection";

const COLORS = {
  primary: "#1976d2",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  info: "#0288d1",
  secondary: "#9c27b0",
};

const PIE_COLORS = [COLORS.success, COLORS.error]; // Valid = green, Invalid = red

type TrendGranularity = "daily" | "weekly" | "monthly";

// Custom X-axis tick that rotates labels — keeps all dates readable
const RotatedTick = ({ x, y, payload }: any) => (
  <g transform={`translate(${x},${y})`}>
    <text
      x={0}
      y={0}
      dy={10}
      textAnchor="end"
      fill="#666"
      fontSize={11}
      transform="rotate(-35)"
    >
      {payload.value}
    </text>
  </g>
);

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState("this_month");
  const [trendGran, setTrendGran] = useState<TrendGranularity>("daily");
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
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  if (isLoading) return <LoadingSkeleton variant="dashboard" fullScreen />;

  if (error) {
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
          {[
            "Total Leads Assigned",
            "Follow Ups",
            "Prospects",
            "Converted",
            "Total Leads Generated",
          ].map((t, i) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={i}>
              <StatsCard
                title={t}
                value="--"
                icon={<BusinessIcon />}
                color="primary"
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const stats = dashboardData?.summary;
  const charts = dashboardData?.charts;
  const perf = dashboardData?.performance;

  // Trend drill-through — pick the right dataset + x-axis key
  const trendData =
    trendGran === "weekly"
      ? charts?.weekly_trends
      : trendGran === "monthly"
        ? charts?.monthly_trends
        : charts?.daily_trends;

  const trendKey =
    trendGran === "weekly"
      ? "week"
      : trendGran === "monthly"
        ? "month"
        : "date";

  // Format daily dates to MM/DD for the tick
  const trendTickFormatter = (val: string) => {
    if (trendGran !== "daily") return val;
    const d = new Date(val);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // Valid vs Invalid pie
  const pieData = charts?.valid_vs_invalid
    ? [
        { name: "Valid", value: charts.valid_vs_invalid.valid },
        { name: "Invalid", value: charts.valid_vs_invalid.invalid },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Box>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={1}
      >
        <Typography variant="h4" fontWeight="600">
          Dashboard Overview
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
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
            </Select>
          </FormControl>
          {(user?.role === "admin" || user?.role === "manager_staff" || user?.role === "manager") && (
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
        {/* ── A) KPI Cards — all 5 in one row ─────────────────────────
            xs: 2 per row (6/12), sm: all 5 fit using flex, lg: equal fifths
            Using size prop with lg=2.4 gives exactly 5 equal columns    */}
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2.4 }}>
          <StatsCard
            title="Total Leads Assigned"
            value={stats?.total_leads_assigned ?? 0}
            icon={<BusinessIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2.4 }}>
          <StatsCard
            title="Follow Ups"
            value={stats?.follow_ups ?? 0}
            icon={<ScheduleIcon />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2.4 }}>
          <StatsCard
            title="Prospects"
            value={stats?.prospects ?? 0}
            icon={<PeopleIcon />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2.4 }}>
          <StatsCard
            title="Converted"
            value={stats?.converted ?? 0}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2.4 }}>
          <StatsCard
            title="Total Leads Generated"
            value={stats?.total_leads_generated ?? 0}
            icon={<TrendingUpIcon />}
            color="secondary"
          />
        </Grid>

        {/* ── Quick Actions ────────────────────────────────────────────── */}
        <Grid size={12}>
          <QuickActions />
        </Grid>

        {/* ── Announcements (admin & manager_staff only) ───────────────── */}
        {(user?.role === "admin" || user?.role === "manager_staff") && (
          <Grid size={12}>
            <ManageAnnouncementsSection />
          </Grid>
        )}

        {/* ── B) Lead Generation Trend — histogram (BarChart) ─────────── */}
        {trendData && trendData.length > 0 && (
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                flexWrap="wrap"
                gap={1}
              >
                <Typography variant="h6" fontWeight="600">
                  Lead Generation Trend
                </Typography>
                <ToggleButtonGroup
                  value={trendGran}
                  exclusive
                  size="small"
                  onChange={(_, val) =>
                    val && setTrendGran(val as TrendGranularity)
                  }
                >
                  <ToggleButton value="daily">Daily</ToggleButton>
                  <ToggleButton value="weekly">Weekly</ToggleButton>
                  <ToggleButton value="monthly">Monthly</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={trendData}
                  margin={{ top: 5, right: 10, bottom: 60, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey={trendKey}
                    tick={<RotatedTick />}
                    interval={
                      trendGran === "daily" && (trendData?.length ?? 0) > 20
                        ? Math.ceil((trendData?.length ?? 1) / 15)
                        : 0
                    }
                    label={{
                      value: "Date",
                      position: "insideBottom",
                      offset: -48,
                      fontSize: 12,
                      fill: "#888",
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    label={{
                      value: "Leads",
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 12,
                      fill: "#888",
                    }}
                    width={45}
                  />
                  <Tooltip
                    labelFormatter={(val) =>
                      trendGran === "daily"
                        ? new Date(val).toLocaleDateString()
                        : String(val)
                    }
                    formatter={(val: number) => [val, "Leads Generated"]}
                  />
                  <Bar
                    dataKey="leads"
                    name="Leads Generated"
                    fill={COLORS.primary}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* ── C) Valid vs Invalid Pie ──────────────────────────────────── */}
        {pieData.length > 0 && (
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Valid vs Invalid Leads
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                    outerRadius={100}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [val, "Leads"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* ── D) Leads by Status — histogram with rotated labels ───────── */}
        {charts?.leads_by_status && charts.leads_by_status.length > 0 && (
          <Grid size={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Leads by Status
              </Typography>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={charts.leads_by_status}
                  margin={{ top: 5, right: 20, bottom: 80, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="status"
                    interval={0}
                    tick={<RotatedTick />}
                    height={80}
                  />
                  <YAxis allowDecimals={false} width={45} />
                  <Tooltip formatter={(val: number) => [val, "Leads"]} />
                  <Bar
                    dataKey="count"
                    name="Leads"
                    fill={COLORS.primary}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* ── E) Team Performance ─────────────────────────────────────── */}
        {perf && perf.length > 0 && (
          <Grid size={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Team Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{ "& th": { fontWeight: 700, whiteSpace: "nowrap" } }}
                    >
                      <TableCell>Team</TableCell>
                      <TableCell align="center">Total Leads Assigned</TableCell>
                      <TableCell align="center">Total Follow Ups</TableCell>
                      <TableCell align="center">Total Prospects</TableCell>
                      <TableCell align="center">Total Conversions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {perf.map((row, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {row.team}
                        </TableCell>
                        <TableCell align="center">
                          {row.total_leads_assigned}
                        </TableCell>
                        <TableCell align="center">
                          {row.total_follow_ups}
                        </TableCell>
                        <TableCell align="center">
                          {row.total_prospects}
                        </TableCell>
                        <TableCell align="center">
                          {row.total_conversions}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}

        {/* ── F) Attendance Reports ────────────────────────────────────── */}
        {(user?.role === "admin" || user?.role === "manager_staff" || user?.role === "manager") && (
          <Grid size={12}>
            <AttendanceReportsSection />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;

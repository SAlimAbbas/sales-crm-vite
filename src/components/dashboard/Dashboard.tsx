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

// Valid = green, Invalid = red
const PIE_COLORS = [COLORS.success, COLORS.error];

type TrendGranularity = "daily" | "weekly" | "monthly";

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState("this_month");
  const [trendGranularity, setTrend] = useState<TrendGranularity>("daily");
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
          ].map((title, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <StatsCard
                title={title}
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

  // Trend data based on selected granularity
  const trendData =
    trendGranularity === "weekly"
      ? charts?.weekly_trends
      : trendGranularity === "monthly"
        ? charts?.monthly_trends
        : charts?.daily_trends;

  const trendKey =
    trendGranularity === "weekly"
      ? "week"
      : trendGranularity === "monthly"
        ? "month"
        : "date";

  const trendXFormatter = (val: string) => {
    if (trendGranularity !== "daily") return val;
    const d = new Date(val);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // Valid vs Invalid pie data
  const validInvalidData = charts?.valid_vs_invalid
    ? [
        { name: "Valid", value: charts.valid_vs_invalid.valid },
        { name: "Invalid", value: charts.valid_vs_invalid.invalid },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Box>
      {/* ── Header ─────────────────────────────────────────────────── */}
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
        {/* ── A) KPI Cards ────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Total Leads Assigned"
            value={stats?.total_leads_assigned ?? 0}
            icon={<BusinessIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Follow Ups"
            value={stats?.follow_ups ?? 0}
            subtitle="Active reminders"
            icon={<ScheduleIcon />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Prospects"
            value={stats?.prospects ?? 0}
            subtitle="Interested / Hot leads"
            icon={<PeopleIcon />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Converted"
            value={stats?.converted ?? 0}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        {/* 5th KPI — full width on xs, half on sm, quarter on md */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

        {/* ── Announcements (admin only) ───────────────────────────────── */}
        {user?.role === "admin" && (
          <Grid size={12}>
            <ManageAnnouncementsSection />
          </Grid>
        )}

        {/* ── B) Lead Generation Trend ─────────────────────────────────── */}
        {trendData && trendData.length > 0 && (
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight="600">
                  Lead Generation Trend
                </Typography>
                <ToggleButtonGroup
                  value={trendGranularity}
                  exclusive
                  size="small"
                  onChange={(_, val) =>
                    val && setTrend(val as TrendGranularity)
                  }
                >
                  <ToggleButton value="daily">Daily</ToggleButton>
                  <ToggleButton value="weekly">Weekly</ToggleButton>
                  <ToggleButton value="monthly">Monthly</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
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
                    dataKey={trendKey}
                    label={{
                      value: "Date",
                      position: "insideBottom",
                      offset: -2,
                      fontSize: 12,
                    }}
                    tickFormatter={trendXFormatter}
                    height={40}
                  />
                  <YAxis
                    label={{
                      value: "Total Leads",
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 12,
                    }}
                    width={60}
                  />
                  <Tooltip
                    labelFormatter={(val) =>
                      trendGranularity === "daily"
                        ? new Date(val).toLocaleDateString()
                        : val
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    name="Leads Generated"
                    stroke={COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* ── C) Valid vs Invalid Pie ──────────────────────────────────── */}
        {validInvalidData.length > 0 && (
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Valid vs Invalid Leads
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={validInvalidData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) =>
                      `${props.name}: ${(props.percent * 100).toFixed(1)}%`
                    }
                    outerRadius={100}
                    dataKey="value"
                  >
                    {validInvalidData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
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

        {/* ── D) Leads by Status ───────────────────────────────────────── */}
        {charts?.leads_by_status && charts.leads_by_status.length > 0 && (
          <Grid size={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Leads by Status
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={charts.leads_by_status}
                  margin={{ bottom: 60 }} // extra room so rotated labels don't clip
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="status"
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" />
                  <Bar
                    dataKey="count"
                    name="Leads"
                    fill={COLORS.primary}
                    radius={[8, 8, 0, 0]}
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
                    <TableRow sx={{ "& th": { fontWeight: 700 } }}>
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
                        <TableCell>{row.team}</TableCell>
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

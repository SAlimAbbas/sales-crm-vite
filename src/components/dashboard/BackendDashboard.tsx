import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  AccessTime,
  EventAvailable,
  Timer,
  FreeBreakfast,
  Edit,
  CheckCircle,
  Work,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { backendService } from "../../services/backendService";
import { toast } from "react-hot-toast";

const BackendDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState("this_month");
  const [editReportDialog, setEditReportDialog] = useState(false);
  const [reportText, setReportText] = useState("");

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["backend-dashboard", dateRange],
    queryFn: () => backendService.getDashboard({ range: dateRange }),
    refetchInterval: 60000,
  });

  const updateReportMutation = useMutation({
    mutationFn: (daily_report: string) =>
      backendService.updateTodayReport({ daily_report }),
    onSuccess: () => {
      toast.success("Daily report updated successfully");
      setEditReportDialog(false);
      queryClient.invalidateQueries({ queryKey: ["backend-dashboard"] });
    },
    onError: () => {
      toast.error("Failed to update report");
    },
  });

  const StatCard = ({
    title,
    value,
    icon,
    color = "primary",
    subtitle,
    trend,
  }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
    subtitle?: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <Card sx={{ height: "100%", position: "relative", overflow: "visible" }}>
      <CardContent>
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box flex={1}>
            <Typography
              color="textSecondary"
              gutterBottom
              variant="body2"
              fontWeight={500}
            >
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                {trend.isPositive ? (
                  <TrendingUp fontSize="small" color="success" />
                ) : (
                  <TrendingDown fontSize="small" color="error" />
                )}
                <Typography
                  variant="body2"
                  color={trend.isPositive ? "success.main" : "error.main"}
                  fontWeight={600}
                >
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  vs last period
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const handleEditReport = () => {
    if (data?.today_report?.daily_report) {
      setReportText(data.today_report.daily_report);
    }
    setEditReportDialog(true);
  };

  const handleSaveReport = () => {
    if (reportText.length < 50) {
      toast.error("Report must be at least 50 characters");
      return;
    }
    updateReportMutation.mutate(reportText);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.ceil(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load dashboard data. Please try again.
        </Alert>
      </Box>
    );
  }

  const summary = data?.summary;
  const charts = data?.charts;
  const trends = data?.trends;
  const todayReport = data?.today_report;

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            My Attendance Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Track your attendance and work hours
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            displayEmpty
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="yesterday">Yesterday</MenuItem>
            <MenuItem value="last_7_days">Last 7 Days</MenuItem>
            <MenuItem value="this_week">This Week</MenuItem>
            <MenuItem value="last_week">Last Week</MenuItem>
            <MenuItem value="last_30_days">Last 30 Days</MenuItem>
            <MenuItem value="this_month">This Month</MenuItem>
            <MenuItem value="last_month">Last Month</MenuItem>
            <MenuItem value="this_year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Current Status Alert */}
      {summary?.current_status !== "Not Clocked In" && (
        <Alert
          severity={
            summary?.current_status === "Working"
              ? "success"
              : summary?.current_status === "On Break"
              ? "warning"
              : "info"
          }
          sx={{ mb: 3 }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography>
              Current Status: <strong>{summary?.current_status}</strong>
              {summary?.current_session_minutes > 0 && (
                <span>
                  {" "}
                  - Session Duration:{" "}
                  {formatDuration(summary.current_session_minutes)}
                </span>
              )}
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Days This Month"
            value={summary?.total_days_this_month || 0}
            icon={<EventAvailable sx={{ fontSize: 32 }} />}
            color="primary"
            subtitle="Total working days"
            trend={
              trends?.monthly_comparison
                ? {
                    value: trends.monthly_comparison.growth_percentage,
                    isPositive:
                      trends.monthly_comparison.growth_percentage >= 0,
                  }
                : undefined
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Avg Clock-In Time"
            value={summary?.average_clock_in_time || "00:00"}
            icon={<AccessTime sx={{ fontSize: 32 }} />}
            color="success"
            subtitle="Average arrival time"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Total Work Hours"
            value={summary?.total_work_hours?.toFixed(1) || "0.0"}
            icon={<Timer sx={{ fontSize: 32 }} />}
            color="warning"
            subtitle="Hours this month"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Avg Daily Hours"
            value={summary?.average_work_hours_per_day?.toFixed(1) || "0.0"}
            icon={<BarChartIcon sx={{ fontSize: 32 }} />}
            color="error"
            subtitle="Average per day"
          />
        </Grid>
      </Grid>

      {/* Break Stats and Selected Range */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Total Break Time"
            value={`${summary?.total_break_hours?.toFixed(1) || "0.0"}h`}
            icon={<FreeBreakfast sx={{ fontSize: 32 }} />}
            color="info"
            subtitle="Hours on break this month"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Selected Range Days"
            value={summary?.days_in_selected_range || 0}
            icon={<EventAvailable sx={{ fontSize: 32 }} />}
            color="secondary"
            subtitle="Working days in range"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="This Week Hours"
            value={
              trends?.weekly_comparison?.current_week_hours?.toFixed(1) || "0.0"
            }
            icon={<Work sx={{ fontSize: 32 }} />}
            color="success"
            subtitle="Hours worked this week"
            trend={
              trends?.weekly_comparison
                ? {
                    value: trends.weekly_comparison.growth_percentage,
                    isPositive: trends.weekly_comparison.growth_percentage >= 0,
                  }
                : undefined
            }
          />
        </Grid>
      </Grid>

      {/* Today's Report Card */}
      {todayReport && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Today's Report
              </Typography>
            </Box>
            {todayReport.can_edit && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit />}
                onClick={handleEditReport}
              >
                Edit Report
              </Button>
            )}
          </Box>

          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Clock In
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {new Date(todayReport.clock_in_time).toLocaleTimeString()}
              </Typography>
            </Grid>
            {todayReport.clock_out_time && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    Clock Out
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(todayReport.clock_out_time).toLocaleTimeString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    Work Duration
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDuration(todayReport.work_duration_minutes)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    Break Time
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDuration(todayReport.total_break_minutes)}
                  </Typography>
                </Grid>
              </>
            )}
            {!todayReport.clock_out_time && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Chip label="Currently Working" color="success" />
              </Grid>
            )}
          </Grid>

          {todayReport.daily_report && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Daily Report
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: "background.paper",
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {todayReport.daily_report}
                </Typography>
              </Paper>
            </Box>
          )}
        </Paper>
      )}

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Daily Work Hours Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Daily Work Hours
            </Typography>
            <Box mt={2}>
              {charts?.daily_hours?.length > 0 ? (
                charts.daily_hours.map((item: any, index: number) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                    pb={2}
                    borderBottom={
                      index < charts.daily_hours.length - 1
                        ? "1px solid"
                        : "none"
                    }
                    borderColor="divider"
                  >
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: `${Math.min((item.hours / 10) * 100, 100)}%`,
                          minWidth: 100,
                          height: 8,
                          backgroundColor: "primary.main",
                          borderRadius: 1,
                        }}
                      />
                      <Chip
                        label={`${item.hours}h`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  textAlign="center"
                  py={3}
                >
                  No work hour data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Clock-In Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Clock-In Time Distribution
            </Typography>
            <Box mt={2}>
              {charts?.clock_in_distribution?.length > 0 ? (
                charts.clock_in_distribution.map((item: any, index: number) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                    pb={2}
                    borderBottom={
                      index < charts.clock_in_distribution.length - 1
                        ? "1px solid"
                        : "none"
                    }
                    borderColor="divider"
                  >
                    <Typography variant="body1" fontWeight={500}>
                      {item.hour}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: `${
                            (item.count /
                              Math.max(
                                ...charts.clock_in_distribution.map(
                                  (d: any) => d.count
                                )
                              )) *
                            100
                          }%`,
                          minWidth: 80,
                          height: 8,
                          backgroundColor: "success.main",
                          borderRadius: 1,
                        }}
                      />
                      <Chip
                        label={item.count}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  textAlign="center"
                  py={3}
                >
                  No clock-in data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Report Dialog */}
      <Dialog
        open={editReportDialog}
        onClose={() => setEditReportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Today's Daily Report</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={6}
            fullWidth
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Enter your daily report (minimum 50 characters)..."
            helperText={`${reportText.length} characters (minimum 50 required)`}
            error={reportText.length > 0 && reportText.length < 50}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditReportDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveReport}
            variant="contained"
            disabled={reportText.length < 50 || updateReportMutation.isPending}
          >
            {updateReportMutation.isPending ? "Saving..." : "Save Report"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackendDashboard;

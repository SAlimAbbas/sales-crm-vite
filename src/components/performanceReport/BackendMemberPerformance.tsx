import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  AlertTitle,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Assignment as TaskIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  HourglassEmpty as PendingIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon,
  ThumbUp as PositiveIcon,
  ThumbDown as NegativeIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import {
  performanceService,
  MyBackendPerformanceData,
} from "../../services/performanceService";
import { useAuth } from "../../contexts/AuthContext";

const MONTHS = [
  { value: "all", label: "All Time (Year Total)" },
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

const BackendMemberPerformance: React.FC = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState<number | string>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(CURRENT_YEAR);

  const { data, isLoading, refetch, isFetching } = useQuery<any>({
    queryKey: ["my-backend-performance", month, year],
    queryFn: () =>
      performanceService.getMyBackendPerformance({
        month,
        year,
      }),
  });

  const perf: MyBackendPerformanceData | null = data?.data?.data ?? data?.data ?? null;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* ── Header & Period Filter ── */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            My Performance Report
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Logged in as: <strong>{user?.name}</strong>
            </Typography>
            <Chip
              label={user?.role?.replace("_", " ").toUpperCase()}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Period Selector */}
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={month}
              label="Month"
              onChange={(e) => setMonth(e.target.value)}
            >
              {MONTHS.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={year}
              label="Year"
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {YEARS.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Refresh Data">
            <IconButton onClick={() => refetch()} color="primary" disabled={isFetching}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : !perf ? (
        <Alert severity="info">No performance records found for this period.</Alert>
      ) : (
        <>
          {/* ── Admin Approval & Remarks Alert ── */}
          <Box mb={3}>
            {perf.admin_approval === "positive" && (
              <Alert
                icon={<PositiveIcon fontSize="inherit" />}
                severity="success"
                sx={{ borderRadius: 2 }}
              >
                <AlertTitle sx={{ fontWeight: "bold" }}>
                  Admin Approval: Positive (Approved)
                </AlertTitle>
                {perf.admin_remarks ? (
                  <Typography variant="body2">
                    <strong>Admin Remarks:</strong> {perf.admin_remarks}
                  </Typography>
                ) : (
                  <Typography variant="body2">
                    Your performance has been evaluated and approved by management.
                  </Typography>
                )}
              </Alert>
            )}

            {perf.admin_approval === "negative" && (
              <Alert
                icon={<NegativeIcon fontSize="inherit" />}
                severity="error"
                sx={{ borderRadius: 2 }}
              >
                <AlertTitle sx={{ fontWeight: "bold" }}>
                  Admin Approval: Needs Improvement
                </AlertTitle>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Admin Remarks:</strong> {perf.admin_remarks || "No remarks provided."}
                </Typography>
              </Alert>
            )}

            {perf.admin_approval === "pending" && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                <AlertTitle sx={{ fontWeight: "bold" }}>
                  Admin Approval: Pending Review
                </AlertTitle>
                <Typography variant="body2">
                  Management approval for this period is currently pending.
                </Typography>
                {perf.admin_remarks && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Admin Remarks:</strong> {perf.admin_remarks}
                  </Typography>
                )}
              </Alert>
            )}
          </Box>

          {/* ── KPI Cards ── */}
          <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ height: "100%", boxShadow: 1, borderRadius: 2 }}>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        TOTAL TASKS
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" mt={0.5}>
                        {perf.total_tasks}
                      </Typography>
                    </Box>
                    <TaskIcon color="primary" sx={{ fontSize: 36, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ height: "100%", boxShadow: 1, borderRadius: 2 }}>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="success.main" fontWeight="bold">
                        ON TIME
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" mt={0.5} color="success.main">
                        {perf.completed_on_time}
                      </Typography>
                    </Box>
                    <CheckCircleIcon color="success" sx={{ fontSize: 36, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ height: "100%", boxShadow: 1, borderRadius: 2 }}>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="error.main" fontWeight="bold">
                        OVERDUE
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" mt={0.5} color="error.main">
                        {perf.overdue_tasks}
                      </Typography>
                    </Box>
                    <WarningIcon color="error" sx={{ fontSize: 36, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ height: "100%", boxShadow: 1, borderRadius: 2 }}>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="info.main" fontWeight="bold">
                        IN PROGRESS / PENDING
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" mt={0.5} color="info.main">
                        {perf.pending_tasks}
                      </Typography>
                    </Box>
                    <PendingIcon color="info" sx={{ fontSize: 36, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ height: "100%", boxShadow: 1, borderRadius: 2 }}>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box sx={{ width: "100%" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        ON-TIME RATE
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        mt={0.5}
                        color={
                          perf.on_time_rate >= 80
                            ? "success.main"
                            : perf.on_time_rate >= 50
                            ? "warning.main"
                            : "error.main"
                        }
                      >
                        {perf.on_time_rate}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(perf.on_time_rate, 100)}
                        color={
                          perf.on_time_rate >= 80
                            ? "success"
                            : perf.on_time_rate >= 50
                            ? "warning"
                            : "error"
                        }
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    <SpeedIcon color="action" sx={{ fontSize: 36, opacity: 0.8, ml: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ── Assigned Tasks Table ── */}
          <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 1 }}>
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Tasks Breakdown ({perf.tasks?.length ?? 0})
              </Typography>
            </Box>

            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Task Title</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Priority
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Status
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Due Date
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Completed Date
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!perf.tasks || perf.tasks.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          No tasks recorded for this period.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    perf.tasks.map((task, idx) => (
                      <TableRow key={task.id} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {task.title}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={task.priority?.toUpperCase()}
                            size="small"
                            color={
                              task.priority === "urgent" || task.priority === "high"
                                ? "error"
                                : task.priority === "medium"
                                ? "warning"
                                : "default"
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={task.status?.replace("_", " ").toUpperCase()}
                            size="small"
                            color={
                              task.status === "completed"
                                ? "success"
                                : task.status === "overdue"
                                ? "error"
                                : task.status === "in_progress"
                                ? "info"
                                : "default"
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption" color={task.completed_at ? "success.main" : "text.secondary"}>
                            {task.completed_at
                              ? new Date(task.completed_at).toLocaleDateString()
                              : "-"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default BackendMemberPerformance;
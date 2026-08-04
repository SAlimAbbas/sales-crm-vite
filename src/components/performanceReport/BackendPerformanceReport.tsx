import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Alert,
  CircularProgress,
  Grid,
  Menu,
} from "@mui/material";
import {
  FileDownload as DownloadIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CheckCircle as PositiveIcon,
  Cancel as NegativeIcon,
  HourglassEmpty as PendingIcon,
  AssignmentTurnedIn as TaskIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  performanceService,
  BackendPerformanceRow,
} from "../../services/performanceService";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MONTHS = [
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
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

const PDF_TABLE_HEAD = [
  "Name",
  "Role",
  "Total Tasks",
  "Completed On Time",
  "Overdue",
  "Pending/In Progress",
  "On-Time Rate %",
  "Admin Approval",
  "Notes",
];

const BackendPerformanceReport: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [search, setSearch] = useState<string>("");

  // Quick Approval Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<BackendPerformanceRow | null>(null);

  // Edit Approval Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<BackendPerformanceRow | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "positive" | "negative">("pending");
  const [approvalNotes, setApprovalNotes] = useState<string>("");

  const handleChipClick = (event: React.MouseEvent<HTMLElement>, row: BackendPerformanceRow) => {
    if (!user || (user.role !== "admin" && user.role !== "manager_staff")) return;
    setMenuAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuRow(null);
  };

  const handleQuickApprovalSelect = (status: "positive" | "negative" | "pending") => {
    if (!menuRow) return;
    approvalMutation.mutate({
      user_id: menuRow.user_id,
      month,
      year,
      admin_approval: status,
      notes: menuRow.notes || "",
    });
    handleMenuClose();
  };

  // Query Backend Report
  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: ["backend-performance-report", month, year, search],
    queryFn: () => performanceService.getBackendReport({ month, year, search }),
  });

  const rows: BackendPerformanceRow[] = data?.data || [];

  // Mutation for Admin Approval
  const approvalMutation = useMutation({
    mutationFn: (payload: any) => performanceService.setBackendApproval(payload),
    onSuccess: () => {
      showNotification("Admin approval updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["backend-performance-report"] });
      handleCloseDialog();
    },
    onError: (err: any) => {
      showNotification(err.response?.data?.message || "Failed to update approval", "error");
    },
  });

  const handleOpenDialog = (row: BackendPerformanceRow) => {
    setSelectedRow(row);
    setApprovalStatus(row.admin_approval);
    setApprovalNotes(row.notes || "");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRow(null);
    setApprovalStatus("pending");
    setApprovalNotes("");
  };

  const handleSaveApproval = () => {
    if (!selectedRow) return;
    approvalMutation.mutate({
      user_id: selectedRow.user_id,
      month,
      year,
      admin_approval: approvalStatus,
      notes: approvalNotes,
    });
  };

  // Export PDF
  const handleExportPDF = () => {
    if (!rows || rows.length === 0) {
      showNotification("No data available to export", "warning");
      return;
    }

    const doc = new jsPDF("landscape");
    const monthLabel = MONTHS.find((m) => m.value === month)?.label || month;

    // Header Title
    doc.setFontSize(16);
    doc.text(`Backend Staff Performance Report - ${monthLabel} ${year}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableData = rows.map((row) => [
      row.name,
      row.role.replace("_", " ").toUpperCase(),
      row.total_tasks.toString(),
      row.completed_on_time.toString(),
      row.overdue_tasks.toString(),
      row.pending_tasks.toString(),
      `${row.on_time_rate}%`,
      row.admin_approval.toUpperCase(),
      row.notes || "-",
    ]);

    autoTable(doc, {
      head: [PDF_TABLE_HEAD],
      body: tableData,
      startY: 27,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 150, 243] },
    });

    doc.save(`Backend_Performance_Report_${monthLabel}_${year}.pdf`);
    showNotification("Backend Performance Report PDF downloaded successfully", "success");
  };

  // Summary Metrics
  const totalBackendUsers = rows.length;
  const totalTasksAssigned = rows.reduce((acc, r) => acc + r.total_tasks, 0);
  const avgOnTimeRate =
    totalBackendUsers > 0
      ? (rows.reduce((acc, r) => acc + r.on_time_rate, 0) / totalBackendUsers).toFixed(1)
      : "0";
  const totalPositive = rows.filter((r) => r.admin_approval === "positive").length;
  const totalNegative = rows.filter((r) => r.admin_approval === "negative").length;

  const isAdminOrManagerStaff = user?.role === "admin" || user?.role === "manager_staff";

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <TaskIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Tasks Assigned
              </Typography>

              <Typography variant="h5" fontWeight="bold">
                {totalTasksAssigned}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <PendingIcon color="info" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Avg On-Time Rate
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {avgOnTimeRate}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <PositiveIcon color="success" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Positive Approvals
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {totalPositive}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <NegativeIcon color="error" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Negative Approvals
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="error.main">
                {totalNegative}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filter Toolbar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" justifyContent="space-between">
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            {/* Month Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Month</InputLabel>
              <Select
                value={month}
                label="Month"
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Year Filter */}
            <FormControl size="small" sx={{ minWidth: 110 }}>
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

            {/* Search Filter */}
            <TextField
              size="small"
              label="Search Staff"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 200 }}
            />

            <Tooltip title="Refresh Data">
              <IconButton onClick={() => refetch()} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
            disabled={rows.length === 0}
          >
            Export PDF
          </Button>
        </Box>
      </Paper>

      {/* Report Table */}
      <TableContainer component={Paper}>
        {isLoading && <LinearProgress />}
        {isError && (
          <Alert severity="error" sx={{ m: 2 }}>
            Failed to load backend performance report.
          </Alert>
        )}

        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell align="center"><strong>Total Tasks Assigned</strong></TableCell>
              <TableCell align="center"><strong>Completed On Time</strong></TableCell>
              <TableCell align="center"><strong>Overdue</strong></TableCell>
              <TableCell align="center"><strong>Pending / In Progress</strong></TableCell>
              <TableCell align="center"><strong>On-Time Rate %</strong></TableCell>
              <TableCell align="center"><strong>Admin Approval</strong></TableCell>
              <TableCell><strong>Notes</strong></TableCell>
              {isAdminOrManagerStaff && <TableCell align="right"><strong>Actions</strong></TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">
                    No backend performance records found for this period.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.user_id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {row.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.role.replace("_", " ").toUpperCase()}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="bold">
                      {row.total_tasks}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="success.main" fontWeight="medium">
                      {row.completed_on_time}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color={row.overdue_tasks > 0 ? "error.main" : "textSecondary"}>
                      {row.overdue_tasks}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="info.main">
                      {row.pending_tasks}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 140 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                      <Typography variant="caption" fontWeight="bold">
                        {row.on_time_rate}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(row.on_time_rate, 100)}
                        color={
                          row.on_time_rate >= 80
                            ? "success"
                            : row.on_time_rate >= 50
                            ? "warning"
                            : "error"
                        }
                        sx={{ width: "100%", height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={isAdminOrManagerStaff ? "Click to change approval status" : ""}>
                      <Chip
                        label={row.admin_approval.toUpperCase()}
                        size="small"
                        clickable={isAdminOrManagerStaff}
                        onClick={(e) => handleChipClick(e, row)}
                        color={
                          row.admin_approval === "positive"
                            ? "success"
                            : row.admin_approval === "negative"
                            ? "error"
                            : "default"
                        }
                        variant={row.admin_approval === "pending" ? "outlined" : "filled"}
                        sx={{
                          cursor: isAdminOrManagerStaff ? "pointer" : "default",
                          fontWeight: "bold",
                          "&:hover": isAdminOrManagerStaff ? { opacity: 0.85 } : {},
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {row.notes || "-"}
                    </Typography>
                  </TableCell>

                  {isAdminOrManagerStaff && (
                    <TableCell align="right">
                      <Tooltip title="Update Admin Approval">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Admin Approval Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Update Admin Approval</DialogTitle>
        <DialogContent dividers>
          {selectedRow && (
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                {selectedRow.name} ({selectedRow.role.toUpperCase()})
              </Typography>

              <FormControl fullWidth size="small">
                <InputLabel>Admin Approval</InputLabel>
                <Select
                  value={approvalStatus}
                  label="Admin Approval"
                  onChange={(e) => setApprovalStatus(e.target.value as any)}
                >
                  <MenuItem value="positive">Positive (Approved)</MenuItem>
                  <MenuItem value="negative">Negative (Needs Improvement)</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Notes / Comments"
                multiline
                rows={3}
                fullWidth
                size="small"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Enter approval notes or performance feedback..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={approvalMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveApproval}
            variant="contained"
            disabled={approvalMutation.isPending}
          >
            {approvalMutation.isPending ? <CircularProgress size={20} /> : "Save Approval"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Approval Selection Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleQuickApprovalSelect("positive")}>
          <PositiveIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="success.main" fontWeight="bold">
            Positive (Approved)
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleQuickApprovalSelect("negative")}>
          <NegativeIcon color="error" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="error.main" fontWeight="bold">
            Negative (Needs Improvement)
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleQuickApprovalSelect("pending")}>
          <PendingIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="textSecondary" fontWeight="bold">
            Pending
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default BackendPerformanceReport;

import React, { useState, useEffect } from "react";
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
  TextField,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  performanceService,
  SetTargetPayload,
} from "../../services/performanceService";
import { userService } from "../../services/userService";
import { useNotification } from "../../contexts/NotificationContext";

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

// Per-row state shape
interface RowData {
  target_amount: string;
  achieved_amount: string;
  counters_target: string; // ADD
  counters_achieved: string; // ADD
  notes: string;
}

const SetTargetsPanel: React.FC = () => {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [roleFilter, setRoleFilter] = useState("salesperson");

  // userId -> { target_amount, achieved_amount, notes }
  const [rows, setRows] = useState<Record<number, RowData>>({});

  const { data: usersData, isLoading: usersLoading } = useQuery<any>({
    queryKey: ["users-for-targets"],
    queryFn: () => userService.getUsers({ is_active: true }),
  });

  const allUsers = (usersData?.data?.data || usersData?.data || []).filter(
    (u: any) => u.role === "salesperson" || u.role === "manager",
  );

  const filteredUsers = roleFilter
    ? allUsers.filter((u: any) => u.role === roleFilter)
    : allUsers;

  // Fetch existing targets to pre-fill
  const { data: reportData, isLoading: reportLoading } = useQuery<any>({
    queryKey: ["performance-report-targets", month, year],
    queryFn: () => performanceService.getReport({ month, year }),
  });

  // Pre-fill rows when data loads or month/year changes
  useEffect(() => {
    const existing = reportData?.data?.data ?? reportData?.data ?? [];
    const prefilled: Record<number, RowData> = {};
    existing.forEach((r: any) => {
      prefilled[r.user_id] = {
        target_amount: r.target_amount > 0 ? String(r.target_amount) : "",
        achieved_amount: r.achieved_amount > 0 ? String(r.achieved_amount) : "",
        counters_target: r.counters_target > 0 ? String(r.counters_target) : "",
        counters_achieved:
          r.counters_achieved > 0 ? String(r.counters_achieved) : "",
        notes: r.notes ?? "",
      };
    });
    setRows(prefilled);
  }, [reportData, month, year]);

  const updateRow = (userId: number, field: keyof RowData, value: string) => {
    setRows((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] ?? {
          target_amount: "",
          achieved_amount: "",
          notes: "",
        }),
        [field]: value,
      },
    }));
  };

  const bulkMutation = useMutation({
    mutationFn: performanceService.bulkSetTargets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-report"] });
      queryClient.invalidateQueries({
        queryKey: ["performance-report-targets"],
      });
      showNotification("Targets saved successfully", "success");
    },
    onError: () => showNotification("Failed to save targets", "error"),
  });

  const handleSaveAll = () => {
    const payload: SetTargetPayload[] = filteredUsers
      .filter(
        (u: any) =>
          rows[u.id]?.target_amount &&
          parseFloat(rows[u.id].target_amount) >= 0,
      )
      .map((u: any) => ({
        user_id: u.id,
        month,
        year,
        target_amount: parseFloat(rows[u.id].target_amount) || 0,
        achieved_amount: parseFloat(rows[u.id]?.achieved_amount) || 0,
        counters_target: parseInt(rows[u.id]?.counters_target) || 0,
        counters_achieved: parseInt(rows[u.id]?.counters_achieved) || 0,
        notes: rows[u.id]?.notes ?? null,
      }));

    if (payload.length === 0) {
      showNotification("Please enter at least one target amount", "warning");
      return;
    }
    bulkMutation.mutate(payload);
  };

  const isLoading = usersLoading || reportLoading;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Set Monthly Targets
      </Typography>

      {/* Filters */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3} alignItems="center">
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

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="salesperson">Salesperson</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveAll}
          disabled={bulkMutation.isPending}
          sx={{ ml: "auto" }}
        >
          {bulkMutation.isPending ? "Saving..." : "Save All"}
        </Button>
      </Box>

      {isLoading ? (
        <Box py={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Alert severity="info">No users found.</Alert>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Role</strong>
                </TableCell>
                <TableCell>
                  <strong>Shift</strong>
                </TableCell>
                <TableCell>
                  <strong>Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Manager</strong>
                </TableCell>
                <TableCell sx={{ minWidth: 160 }}>
                  <strong>Target (₹)</strong>
                </TableCell>
                <TableCell sx={{ minWidth: 160 }}>
                  <strong>Achieved (₹)</strong>
                </TableCell>
                <TableCell sx={{ minWidth: 140 }}>
                  <strong>Counters Target</strong>
                </TableCell>
                <TableCell sx={{ minWidth: 140 }}>
                  <strong>Counters Achieved</strong>
                </TableCell>
                <TableCell sx={{ minWidth: 220 }}>
                  <strong>Notes</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((u: any) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {u.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={u.role} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{u.shift ?? "-"}</TableCell>
                  <TableCell>{u.type ?? "-"}</TableCell>
                  <TableCell>{u.manager?.name ?? "-"}</TableCell>
                  {/* Target Amount */}
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="₹ Target"
                      value={rows[u.id]?.target_amount ?? ""}
                      onChange={(e) =>
                        updateRow(u.id, "target_amount", e.target.value)
                      }
                      inputProps={{ min: 0 }}
                      sx={{ width: 150 }}
                    />
                  </TableCell>
                  {/* Achieved Amount */}
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="₹ Achieved"
                      value={rows[u.id]?.achieved_amount ?? ""}
                      onChange={(e) =>
                        updateRow(u.id, "achieved_amount", e.target.value)
                      }
                      inputProps={{ min: 0 }}
                      sx={{ width: 150 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="No. of clients"
                      value={rows[u.id]?.counters_target ?? ""}
                      onChange={(e) =>
                        updateRow(u.id, "counters_target", e.target.value)
                      }
                      inputProps={{ min: 0 }}
                      sx={{ width: 130 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="No. achieved"
                      value={rows[u.id]?.counters_achieved ?? ""}
                      onChange={(e) =>
                        updateRow(u.id, "counters_achieved", e.target.value)
                      }
                      inputProps={{ min: 0 }}
                      sx={{ width: 130 }}
                    />
                  </TableCell>
                  {/* Notes */}
                  <TableCell>
                    <TextField
                      size="small"
                      placeholder="Add note..."
                      value={rows[u.id]?.notes ?? ""}
                      onChange={(e) => updateRow(u.id, "notes", e.target.value)}
                      sx={{ width: 210 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default SetTargetsPanel;

import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
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
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "../../services/attendanceService";
import { userService } from "../../services/userService";
import { format } from "date-fns";

const AttendanceReportsSection: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<{
    employeeName: string;
    date: string;
    report: string;
  } | null>(null);

  const { data: usersData } = useQuery<any>({
    queryKey: ["employees-list"],
    queryFn: () => userService.getUsers({ is_active: true }), // This gets all users
  });

  const { data: attendanceData, isLoading } = useQuery<any>({
    queryKey: [
      "attendance-history",
      selectedUser,
      selectedRole,
      startDate,
      endDate,
    ],
    queryFn: () =>
      attendanceService.getAttendanceHistory({
        user_id: selectedUser || undefined,
        role: selectedRole || undefined, // Add this
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }),
    enabled: true,
  });

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="600">
        Attendance Reports
      </Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Employee</InputLabel>
          <Select
            value={selectedUser}
            label="Employee"
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <MenuItem value="">All Employees</MenuItem>
            {(usersData?.data?.data || usersData?.data || [])
              .filter((user: any) => user.role !== "admin") // Add this filter
              .map((user: any) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Role</InputLabel>
          <Select
            value={selectedRole}
            label="Filter by Role"
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="manager">Managers</MenuItem>
            <MenuItem value="salesperson">Salespeople</MenuItem>
            <MenuItem value="lead_executive">Lead Executives</MenuItem>
            <MenuItem value="backend">Backend Staff</MenuItem>
          </Select>
        </FormControl>

        <TextField
          type="date"
          label="Start Date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ minWidth: 150 }}
        />

        <TextField
          type="date"
          label="End Date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ minWidth: 150 }}
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Employee</strong>
              </TableCell>
              <TableCell>
                <strong>Clock In</strong>
              </TableCell>
              <TableCell>
                <strong>Clock Out</strong>
              </TableCell>
              <TableCell>
                <strong>Duration</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Report</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : attendanceData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              attendanceData?.data?.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell>{log.user?.name || "Unknown"}</TableCell>
                  <TableCell>
                    {format(
                      new Date(log.clock_in_time),
                      "MMM dd, yyyy hh:mm a"
                    )}
                  </TableCell>
                  <TableCell>
                    {log.clock_out_time
                      ? format(
                          new Date(log.clock_out_time),
                          "MMM dd, yyyy hh:mm a"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {formatDuration(log.work_duration_minutes)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        log.status === "clocked_in" ? "Active" : "Completed"
                      }
                      color={
                        log.status === "clocked_in" ? "warning" : "success"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {log.daily_report ? (
                      <Button
                        variant="text"
                        size="small"
                        onClick={() =>
                          setSelectedReport({
                            employeeName: log.user?.name || "Unknown",
                            date: format(
                              new Date(log.clock_in_time),
                              "MMM dd, yyyy"
                            ),
                            report: log.daily_report,
                          })
                        }
                        sx={{ textTransform: "none" }}
                      >
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {log.daily_report}
                        </Typography>
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Report Detail Modal */}
      <Dialog
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6">Daily Report</Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedReport?.employeeName} - {selectedReport?.date}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: "background.default",
              borderRadius: 1,
              minHeight: 200,
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {selectedReport?.report}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setSelectedReport(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AttendanceReportsSection;

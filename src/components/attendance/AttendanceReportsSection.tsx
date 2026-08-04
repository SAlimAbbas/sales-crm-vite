import React, { useEffect, useState } from "react";
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

const getRoleLabel = (role: string) => {
  switch (role) {
    case "manager":
      return "Team Leader";
    case "manager_staff":
      return "Manager";
    case "salesperson":
      return "Salesperson";
    case "backend":
      return "Backend Staff";
    case "lead_executive":
      return "Lead Executive";
    case "admin":
      return "Admin";
    default:
      return role ? role.replace("_", " ") : "";
  }
};

const AttendanceReportsSection: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0], // today's date
  );
  const [endDate, setEndDate] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<{
    employeeName: string;
    date: string;
    report: string;
  } | null>(null);

  const { data: usersData } = useQuery<any>({
    queryKey: ["employees-list"],
    queryFn: () => userService.getUsers({ is_active: true }),
  });

  const usersList: any[] = usersData?.data?.data || usersData?.data || [];

  const teamLeaders = React.useMemo(
    () => usersList.filter((u: any) => u.role === "manager"),
    [usersList],
  );

  const managersStaff = React.useMemo(
    () => usersList.filter((u: any) => u.role === "manager_staff"),
    [usersList],
  );

  const filteredEmployees = React.useMemo(() => {
    if (selectedTeam === "all") {
      return usersList.filter((u: any) => u.role !== "admin");
    }

    if (selectedTeam.startsWith("manager_staff_")) {
      const managerStaffId = parseInt(selectedTeam.replace("manager_staff_", ""), 10);
      return usersList.filter(
        (u: any) => u.id === managerStaffId || u.manager_id === managerStaffId,
      );
    }

    if (selectedTeam.startsWith("manager_")) {
      const managerId = parseInt(selectedTeam.replace("manager_", ""), 10);
      return usersList.filter(
        (u: any) => u.id === managerId || u.manager_id === managerId,
      );
    }

    if (selectedTeam === "backend_exec") {
      return usersList.filter(
        (u: any) => u.role === "backend" || u.role === "lead_executive",
      );
    }

    return usersList.filter((u: any) => u.role !== "admin");
  }, [usersList, selectedTeam]);

  const queryParams = React.useMemo(() => {
    const params: any = {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    };

    if (selectedUser) {
      params.user_id = selectedUser;
    } else if (selectedTeam.startsWith("manager_staff_")) {
      params.manager_id = selectedTeam.replace("manager_staff_", "");
    } else if (selectedTeam.startsWith("manager_")) {
      params.manager_id = selectedTeam.replace("manager_", "");
    } else if (selectedTeam === "backend_exec") {
      params.role = "backend_exec";
    }

    return params;
  }, [selectedUser, selectedTeam, startDate, endDate]);

  const { data: attendanceData, isLoading } = useQuery<any>({
    queryKey: ["attendance-history", queryParams],
    queryFn: () => attendanceService.getAttendanceHistory(queryParams),
    enabled: true,
  });

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  useEffect(() => {
    setSelectedUser("");
  }, [selectedTeam]);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="600">
        Attendance Reports
      </Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        {/* Filter by Team */}
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel>Filter by Team</InputLabel>
          <Select
            value={selectedTeam}
            label="Filter by Team"
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <MenuItem value="all">All Teams</MenuItem>

            {/* Team Leaders */}
            {teamLeaders.map((m: any) => (
              <MenuItem key={`tl_${m.id}`} value={`manager_${m.id}`}>
                {m.name} (Team Leader)
              </MenuItem>
            ))}

            {/* Managers */}
            {managersStaff.map((m: any) => (
              <MenuItem key={`ms_${m.id}`} value={`manager_staff_${m.id}`}>
                {m.name} (Manager)
              </MenuItem>
            ))}

            {/* Backend & Executive Team */}
            <MenuItem value="backend_exec">
              Backend & Executive Team (Shikhar)
            </MenuItem>
          </Select>
        </FormControl>

        {/* Employee */}
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Employee</InputLabel>
          <Select
            value={selectedUser}
            label="Employee"
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <MenuItem value="">All Employees</MenuItem>
            {filteredEmployees.map((user: any) => (
              <MenuItem key={user.id} value={user.id.toString()}>
                {user.name} ({getRoleLabel(user.role)})
              </MenuItem>
            ))}
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
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {log.user?.name || "Unknown"}
                      </Typography>
                      {log.user?.role && (
                        <Chip
                          label={getRoleLabel(log.user.role)}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 11 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(log.clock_in_time),
                      "MMM dd, yyyy hh:mm a",
                    )}
                  </TableCell>
                  <TableCell>
                    {log.clock_out_time
                      ? format(
                          new Date(log.clock_out_time),
                          "MMM dd, yyyy hh:mm a",
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
                              "MMM dd, yyyy",
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

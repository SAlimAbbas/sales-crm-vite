import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Popper,
  ClickAwayListener,
  Divider,
  Stack,
} from "@mui/material";
import { AccessTime, ArrowDropDown } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "../../services/attendanceService";
import { useNotification } from "../../contexts/NotificationContext";
import { theme } from "../../styles/theme";
import { useAuth } from "../../contexts/AuthContext";

const ClockInOutButton: React.FC = () => {
  const [openClockOut, setOpenClockOut] = useState(false);
  const [openPopper, setOpenPopper] = useState(false);
  const [dailyReport, setDailyReport] = useState("");
  const [workingDuration, setWorkingDuration] = useState("0:00:00");
  const [breakDuration, setBreakDuration] = useState("0:00:00");
  const [currentTime, setCurrentTime] = useState("");
  const [baseWorkingSeconds, setBaseWorkingSeconds] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const anchorRef = useRef<HTMLDivElement>(null);
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const { data: statusData, refetch } = useQuery<any>({
    queryKey: ["attendance-status"],
    queryFn: attendanceService.getCurrentStatus,
    refetchInterval: 30000, // Reduce API calls to every 30 seconds
  });

  // Update base working seconds from backend
  useEffect(() => {
    if (statusData?.working_seconds !== undefined) {
      setBaseWorkingSeconds(statusData.working_seconds);
      setLastUpdateTime(Date.now());
    }
  }, [statusData?.working_seconds, statusData?.current_status]);

  // Display working duration with smooth counting
  useEffect(() => {
    if (statusData?.is_clocked_in) {
      const updateDuration = () => {
        let currentSeconds = baseWorkingSeconds;

        // Add elapsed time only if working (not on break)
        if (
          statusData.current_status === "working" ||
          !statusData.current_status
        ) {
          const elapsed = Math.floor((Date.now() - lastUpdateTime) / 1000);
          currentSeconds += elapsed;
        }

        const hours = Math.floor(currentSeconds / 3600);
        const minutes = Math.floor((currentSeconds % 3600) / 60);
        const secs = currentSeconds % 60;

        setWorkingDuration(
          `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(
            2,
            "0"
          )}`
        );
      };

      updateDuration();
      const interval = setInterval(updateDuration, 1000);
      return () => clearInterval(interval);
    }
  }, [
    statusData?.is_clocked_in,
    statusData?.current_status,
    baseWorkingSeconds,
    lastUpdateTime,
  ]);

  useEffect(() => {
    if (
      statusData?.current_status === "on_break" &&
      statusData.current_break_seconds !== undefined
    ) {
      const updateBreakDuration = () => {
        const breakSeconds = Math.floor(
          statusData.current_break_seconds +
            (Date.now() - lastUpdateTime) / 1000
        );

        const hours = Math.floor(breakSeconds / 3600);
        const minutes = Math.floor((breakSeconds % 3600) / 60);
        const secs = breakSeconds % 60;

        setBreakDuration(
          `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(
            2,
            "0"
          )}`
        );
      };

      updateBreakDuration();
      const interval = setInterval(updateBreakDuration, 1000);
      return () => clearInterval(interval);
    }
  }, [
    statusData?.current_status,
    statusData?.current_break_seconds,
    lastUpdateTime,
  ]);

  // Show recurring login reminder until user clocks in
  useEffect(() => {
    if (!statusData || user?.role === "admin") return;

    const today = new Date().toDateString();
    const hasLoggedInToday = localStorage.getItem("has_clocked_in_today");

    // If already clocked in today, mark it and clear reminders
    if (statusData.is_clocked_in) {
      if (hasLoggedInToday !== today) {
        localStorage.setItem("has_clocked_in_today", today);
      }
      return;
    }

    // If user hasn't clocked in today, show recurring reminders
    if (hasLoggedInToday !== today) {
      // Initial reminder after 3 seconds
      const initialTimer = setTimeout(() => {
        showNotification(
          "⏰ Please clock in to start tracking your work time!",
          "warning"
        );
      }, 3000);

      // Recurring reminder every 2 minutes
      const recurringTimer = setInterval(() => {
        showNotification(
          "⏰ Reminder: You haven't clocked in yet. Please clock in to continue.",
          "warning"
        );
      }, 3 * 60 * 1000); // 2 minutes

      return () => {
        clearTimeout(initialTimer);
        clearInterval(recurringTimer);
      };
    }
  }, [statusData?.is_clocked_in, statusData, , user?.role]);

  // Clear the clocked-in flag at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const timeUntilMidnight = tomorrow.getTime() - now.getTime();

      const midnightTimer = setTimeout(() => {
        localStorage.removeItem("has_clocked_in_today");
        // Reload or check status again
        window.location.reload();
      }, timeUntilMidnight);

      return () => clearTimeout(midnightTimer);
    };

    checkMidnight();
  }, []);

  const clockInMutation = useMutation({
    mutationFn: attendanceService.clockIn,
    onSuccess: () => {
      showNotification("Clocked in successfully!", "success");
      refetch();
      setOpenPopper(false);
    },
    onError: (error: any) => {
      showNotification(
        error.response?.data?.message || "Failed to clock in",
        "error"
      );
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: attendanceService.clockOut,
    onSuccess: () => {
      showNotification("Clocked out successfully!", "success");
      setOpenClockOut(false);
      setDailyReport("");
      setOpenPopper(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["attendance-history"] });
    },
    onError: (error: any) => {
      showNotification(
        error.response?.data?.message || "Failed to clock out",
        "error"
      );
    },
  });

  const startBreakMutation = useMutation({
    mutationFn: attendanceService.startBreak,
    onSuccess: () => {
      showNotification("Break started", "info");
      refetch();
    },
    onError: (error: any) => {
      showNotification(
        error.response?.data?.message || "Failed to start break",
        "error"
      );
    },
  });

  const endBreakMutation = useMutation({
    mutationFn: attendanceService.endBreak,
    onSuccess: () => {
      showNotification("Break ended, back to work!", "success");
      queryClient.invalidateQueries({ queryKey: ["attendance-status"] });
      refetch();
    },
    onError: (error: any) => {
      showNotification(
        error.response?.data?.message || "Failed to end break",
        "error"
      );
    },
  });

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      setCurrentTime(
        `${displayHours}:${String(minutes).padStart(2, "0")} ${ampm}`
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Prevent closing browser without clocking out
  useEffect(() => {
    if (statusData?.is_clocked_in) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue =
          "You haven't clocked out yet. Are you sure you want to leave?";
        return e.returnValue;
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [statusData?.is_clocked_in]);

  const isClockedIn = statusData?.is_clocked_in;

  const handleTogglePopper = () => {
    setOpenPopper((prev) => !prev);
  };

  const handleClockIn = () => {
    clockInMutation.mutate();
  };

  const handleClockOutClick = () => {
    setOpenPopper(false);
    setOpenClockOut(true);
  };

  const handleClockOutConfirm = () => {
    if (dailyReport.length < 50) {
      showNotification("Report must be at least 50 characters", "error");
      return;
    }
    clockOutMutation.mutate(dailyReport);
  };

  return (
    <>
      <Box
        ref={anchorRef}
        sx={{
          display: "flex",
          alignItems: "center",
          mr: 2,
          cursor: "pointer",
        }}
        onClick={handleTogglePopper}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 0.5,
            borderRadius: 2,
            backgroundColor: isClockedIn
              ? "success.main"
              : theme.palette.secondary.dark,
            color: isClockedIn ? "white" : theme.palette.secondary.contrastText,
            border: isClockedIn ? "none" : "1px solid",
            borderColor: "divider",
            transition: "all 0.3s",
            "&:hover": {
              backgroundColor: isClockedIn ? "success.dark" : "action.hover",
              color: isClockedIn ? "white" : "text.primary",
            },
          }}
        >
          <AccessTime
            sx={{
              color: isClockedIn
                ? theme.palette.success.main
                : theme.palette.warning.light,
              animation: !isClockedIn ? "blink 1.5s infinite" : "none",
              "@keyframes blink": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.3 },
              },
            }}
          />
          <Box>
            {isClockedIn ? (
              <>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  fontSize="0.75rem"
                >
                  Working
                </Typography>
                <Typography variant="caption" fontSize="0.7rem">
                  {workingDuration}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" fontWeight="medium">
                {currentTime}
              </Typography>
            )}
          </Box>
          <ArrowDropDown sx={{ fontSize: 20 }} />
        </Box>
      </Box>

      <Popper
        open={openPopper}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        style={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={() => setOpenPopper(false)}>
          <Paper
            elevation={8}
            sx={{
              mt: 1,
              minWidth: 280,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {isClockedIn ? (
              <Box>
                {/* Header */}
                <Box
                  sx={{
                    p: 2,
                    backgroundColor:
                      statusData?.current_status === "on_break"
                        ? "warning.main"
                        : "success.main",
                    color: "white",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {statusData?.current_status === "on_break"
                      ? "On Break"
                      : "Working Day Duration"}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                    {statusData?.current_status === "on_break"
                      ? breakDuration
                      : workingDuration}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {statusData?.current_status === "on_break"
                      ? `Break started at ${
                          statusData?.break_start_time
                            ? new Date(
                                statusData.break_start_time
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : ""
                        }`
                      : `Started at ${
                          statusData?.clock_in_time
                            ? new Date(
                                statusData.clock_in_time
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : ""
                        }`}
                  </Typography>
                </Box>

                <Divider />

                {/* Actions */}
                <Stack spacing={0}>
                  {statusData?.current_status === "on_break" ? (
                    <Button
                      fullWidth
                      sx={{
                        py: 1.5,
                        justifyContent: "flex-start",
                        px: 2,
                        color: "success.main",
                        "&:hover": {
                          backgroundColor: "success.lighter",
                        },
                      }}
                      onClick={() => endBreakMutation.mutate()}
                      disabled={endBreakMutation.isPending}
                    >
                      ▶️ Resume Work
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      sx={{
                        py: 1.5,
                        justifyContent: "flex-start",
                        px: 2,
                        color: "text.primary",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                      onClick={() => startBreakMutation.mutate()}
                      disabled={startBreakMutation.isPending}
                    >
                      ⏸️ Take Break
                    </Button>
                  )}
                  <Divider />
                  <Button
                    fullWidth
                    sx={{
                      py: 1.5,
                      justifyContent: "flex-start",
                      px: 2,
                      color: "error.main",
                      "&:hover": {
                        backgroundColor: "error.lighter",
                      },
                    }}
                    onClick={handleClockOutClick}
                    disabled={statusData?.current_status === "on_break"}
                  >
                    🔴 Clock Out
                  </Button>
                </Stack>

                {statusData?.current_status === "on_break" && (
                  <Box sx={{ p: 1, backgroundColor: "warning.lighter" }}>
                    <Typography variant="caption" color="warning.dark">
                      ⚠️ End break before clocking out
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Current Time
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
                  {currentTime}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={handleClockIn}
                  disabled={clockInMutation.isPending}
                  sx={{ mt: 2 }}
                >
                  {clockInMutation.isPending ? "Clocking In..." : "🟢 Clock In"}
                </Button>
              </Box>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>

      {/* Clock Out Dialog */}
      <Dialog
        open={openClockOut}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>Clock Out & Submit Daily Report</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You've worked for <strong>{workingDuration}</strong> today. Please
            submit your daily report before clocking out.
          </Alert>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            Working Duration: {workingDuration}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={6}
            label="Daily Report"
            placeholder="Describe what you accomplished today (minimum 50 characters)..."
            value={dailyReport}
            onChange={(e) => setDailyReport(e.target.value)}
            helperText={`${dailyReport.length}/50 characters minimum`}
            error={dailyReport.length > 0 && dailyReport.length < 50}
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClockOut(false)}>Cancel</Button>
          <Button
            onClick={handleClockOutConfirm}
            variant="contained"
            color="error"
            disabled={dailyReport.length < 50 || clockOutMutation.isPending}
          >
            {clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClockInOutButton;

import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Alert,
  IconButton,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  CheckCircle as CompleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { followupService } from "../../services/followupService";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";
import { Followup } from "../../types";

const ReminderList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();

  const {
    data: overdueFollowups,
    isLoading: loadingOverdue,
    refetch: refetchOverdue,
  } = useQuery<any>({
    queryKey: ["overdue-reminders"],
    queryFn: () => followupService.getOverdue(),
  });

  const {
    data: upcomingFollowups,
    isLoading: loadingUpcoming,
    refetch: refetchUpcoming,
  } = useQuery<any>({
    queryKey: ["upcoming-reminders"],
    queryFn: () =>
      followupService.getFollowups({
        is_completed: false,
        per_page: 20,
      }),
  });

  const handleCompleteFollowup = async (followupId: number) => {
    try {
      await followupService.completeFollowup(followupId);
      showNotification("Follow-up marked as completed", "success");
      refetchOverdue();
      refetchUpcoming();
    } catch (error) {
      showNotification("Failed to complete follow-up", "error");
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getUpcomingFollowups = () => {
    return (upcomingFollowups?.data || [])
      .filter((followup) => !followup.is_completed && !followup.is_overdue)
      .slice(0, 5); // Show only 5 upcoming
  };

  if (loadingOverdue || loadingUpcoming) {
    return <Typography>Loading reminders...</Typography>;
  }

  const hasOverdue = overdueFollowups && overdueFollowups.length > 0;
  const hasUpcoming = getUpcomingFollowups().length > 0;

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h5">Reminders & Follow-ups</Typography>
        <IconButton
          onClick={() => {
            refetchOverdue();
            refetchUpcoming();
          }}
          color="primary"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {!hasOverdue && !hasUpcoming && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No pending follow-ups or reminders at the moment.
        </Alert>
      )}

      {hasOverdue && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <WarningIcon color="error" />
            <Typography variant="h6" color="error">
              Overdue Follow-ups ({overdueFollowups?.length})
            </Typography>
          </Box>

          <List>
            {overdueFollowups?.map((followup: Followup) => (
              <ListItem key={followup.id} divider>
                <ListItemIcon>
                  <WarningIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      flexWrap="wrap"
                    >
                      <Typography variant="subtitle1">
                        {followup.lead?.company_name || "Unknown Company"}
                      </Typography>
                      <Chip label="Overdue" color="error" size="small" />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        Was due: {formatTime(followup.scheduled_at)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Contact: {followup.lead?.contact_number} •{" "}
                        {followup.lead?.email}
                      </Typography>
                    </Box>
                  }
                />
                {currentUser?.id === followup.salesperson_id && (
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<CompleteIcon />}
                    onClick={() => handleCompleteFollowup(followup.id)}
                    size="small"
                  >
                    Complete
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {hasUpcoming && (
        <Paper sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TimeIcon color="primary" />
            <Typography variant="h6">Upcoming Follow-ups</Typography>
          </Box>

          <List>
            {getUpcomingFollowups().map((followup: Followup) => (
              <ListItem key={followup.id} divider>
                <ListItemIcon>
                  <TimeIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {followup.lead?.company_name || "Unknown Company"}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        Scheduled: {formatTime(followup.scheduled_at)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Contact: {followup.lead?.contact_number} •{" "}
                        {followup.lead?.email}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Assigned to: {followup.salesperson?.name}
                      </Typography>
                    </Box>
                  }
                />
                {currentUser?.id === followup.salesperson_id && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CompleteIcon />}
                    onClick={() => handleCompleteFollowup(followup.id)}
                    size="small"
                  >
                    Complete
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default ReminderList;

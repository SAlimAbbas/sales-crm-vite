import React from "react";
import { Paper, Typography, Box, Button, Grid } from "@mui/material";
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
   const { user } = useAuth();

  const actions = [
        ...(user?.role === "admin" || user?.role === "manager"?[{
      label: "Bulk Upload",
      icon: <UploadIcon />,
      onClick: () => navigate("/leads?action=upload"),
      color: "secondary",
    }]:[]),
    {
      label: "Add Lead",
      icon: <AddIcon />,
      onClick: () => navigate("/leads?action=create"),
      color: "primary",
    },
    {
      label: "Create Task",
      icon: <AssignmentIcon />,
      onClick: () => navigate("/tasks?action=create"),
      color: "success",
    },
    {
      label: "Schedule Follow-up",
      icon: <ScheduleIcon />,
      onClick: () => navigate("/followups?action=create"),
      color: "warning",
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {actions.map((action, index) => (
          <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index}>
            <Button
              variant="outlined"
              startIcon={action.icon}
              onClick={action.onClick}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                py: 2,
                borderColor: `${action.color}.main`,
                color: `${action.color}.main`,
                "&:hover": {
                  borderColor: `${action.color}.dark`,
                  backgroundColor: `${action.color}.light`,
                },
              }}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default QuickActions;

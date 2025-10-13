import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon,
} from "@mui/icons-material";
import { Task } from "../../types";

import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, status: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  showActions = true,
  compact = false,
}) => {
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = isOverdue() ? "overdue" : task.status;
    if (currentStatus !== "overdue") {
      setStatusDialogOpen(true);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit?.(task);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete?.(task);
    handleMenuClose();
  };

  const handleMarkComplete = () => {
    onStatusChange?.(task, "completed");
    handleMenuClose();
  };

  const handleMarkInProgress = () => {
    onStatusChange?.(task, "in_progress");
    handleMenuClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "info";
      case "pending":
        return "default";
      case "overdue":
        return "error";
      default:
        return "default";
    }
  };

  const isOverdue = () => {
    return new Date(task.due_date) < new Date() && task.status !== "completed";
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Due Today";
    } else if (diffDays === 1) {
      return "Due Tomorrow";
    } else if (diffDays > 0) {
      return `Due in ${diffDays} days`;
    } else {
      return `Overdue by ${Math.abs(diffDays)} days`;
    }
  };

  return (
    <Card
      sx={{
        mb: compact ? 1 : 2,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        borderLeft: `4px solid`,
        borderLeftColor: isOverdue()
          ? "error.main"
          : `${getPriorityColor(task.priority)}.main`,
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
      onClick={() => !showActions && onEdit?.(task)}
    >
      <CardContent sx={{ pb: compact ? 1 : 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1}
        >
          <Typography
            variant={compact ? "body2" : "h6"}
            component="div"
            sx={{
              fontWeight: "medium",
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            {task.title}
          </Typography>
          {showActions && (
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>

        {!compact && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* Status and Priority Chips */}
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip
            size="small"
            label={task.status.replace("_", " ").toUpperCase()}
            color={getStatusColor(task.status) as any}
            variant={task.status === "completed" ? "filled" : "outlined"}
            onClick={handleStatusClick}
            sx={{
              cursor: task.status !== "overdue" ? "pointer" : "default",
              "&:hover": task.status !== "overdue" ? { opacity: 0.8 } : {},
            }}
          />
          <Chip
            size="small"
            label={task.priority.toUpperCase()}
            color={getPriorityColor(task.priority) as any}
            variant="outlined"
          />
        </Box>

        {/* Task Details */}
        <Box display="flex" flexDirection="column" gap={1}>
          {/* Due Date */}
          <Box display="flex" alignItems="center" gap={1}>
            <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography
              variant="caption"
              color={isOverdue() ? "error" : "textSecondary"}
              sx={{ fontWeight: isOverdue() ? "medium" : "normal" }}
            >
              {formatDueDate(task.due_date)}
            </Typography>
          </Box>

          {/* Assigned User */}
          {task.assigned_user && (
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="textSecondary">
                {task.assigned_user.name}
              </Typography>
            </Box>
          )}

          {/* Related Lead */}
          {task.lead && (
            <Box display="flex" alignItems="center" gap={1}>
              <BusinessIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="textSecondary">
                {task.lead.company_name}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Avatar for assigned user (in compact mode) */}
        {compact && task.assigned_user && (
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <Tooltip title={task.assigned_user.name}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: "0.75rem",
                  bgcolor: "primary.main",
                }}
              >
                {task.assigned_user.name.charAt(0)}
              </Avatar>
            </Tooltip>
          </Box>
        )}
      </CardContent>

      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Update Task Status</DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            flexDirection="column"
            gap={1}
            pt={1}
            minWidth={200}
          >
            {["pending", "in_progress", "completed"].map((status) => (
              <Button
                key={status}
                variant={task.status === status ? "contained" : "outlined"}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange?.(task, status);
                  setStatusDialogOpen(false);
                }}
                fullWidth
              >
                {status.replace("_", " ").toUpperCase()}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 160 },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 2, fontSize: 20 }} />
          Edit
        </MenuItem>

        {task.status !== "completed" && (
          <MenuItem onClick={handleMarkComplete}>
            <CompleteIcon sx={{ mr: 2, fontSize: 20 }} />
            Mark Complete
          </MenuItem>
        )}

        {task.status === "pending" && (
          <MenuItem onClick={handleMarkInProgress}>
            <ScheduleIcon sx={{ mr: 2, fontSize: 20 }} />
            Start Progress
          </MenuItem>
        )}

        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 2, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TaskCard;

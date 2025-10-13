import React from "react";
import { Box, Typography, Paper, Grid, Badge, Chip } from "@mui/material";
import {
  Schedule as PendingIcon,
  PlayArrow as InProgressIcon,
  CheckCircle as CompletedIcon,
  Warning as OverdueIcon,
} from "@mui/icons-material";
import { Task } from "../../types";
import TaskCard from "./TaskCard";

interface TaskBoardProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, status: string) => void;
  loading?: boolean;
}

interface TaskColumn {
  id: string;
  title: string;
  status: string[];
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  loading = false,
}) => {
  const columns: TaskColumn[] = [
    {
      id: "pending",
      title: "Pending",
      status: ["pending"],
      icon: <PendingIcon />,
      color: "#757575",
      bgColor: "#fafafa",
    },
    {
      id: "in_progress",
      title: "In Progress",
      status: ["in_progress"],
      icon: <InProgressIcon />,
      color: "#1976d2",
      bgColor: "#e3f2fd",
    },
    {
      id: "completed",
      title: "Completed",
      status: ["completed"],
      icon: <CompletedIcon />,
      color: "#388e3c",
      bgColor: "#e8f5e8",
    },
    {
      id: "overdue",
      title: "Overdue",
      status: ["pending", "in_progress"], // Tasks that are overdue can be pending or in_progress
      icon: <OverdueIcon />,
      color: "#d32f2f",
      bgColor: "#ffebee",
    },
  ];

  const isTaskOverdue = (task: Task): boolean => {
    // Use actual_status from backend if available, otherwise calculate
    return (
      task.actual_status === "overdue" ||
      (new Date(task.due_date) < new Date() && task.status !== "completed")
    );
  };

  const getTasksForColumn = (column: TaskColumn): Task[] => {
    if (column.id === "overdue") {
      return tasks.filter((task) => isTaskOverdue(task));
    }
    return tasks.filter(
      (task) => column.status.includes(task.status) && !isTaskOverdue(task)
    );
  };

  const getColumnStats = (columnTasks: Task[]) => {
    const high = columnTasks.filter((task) => task.priority === "high").length;
    const medium = columnTasks.filter(
      (task) => task.priority === "medium"
    ).length;
    const low = columnTasks.filter((task) => task.priority === "low").length;

    return { high, medium, low, total: columnTasks.length };
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <Typography>Loading tasks...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Grid container spacing={2} sx={{ minWidth: 800 }}>
        {columns.map((column) => {
          const columnTasks = getTasksForColumn(column);
          const stats = getColumnStats(columnTasks);

          return (
            <Grid size={{ xs: 12, md: 3 }} key={column.id}>
              <Paper
                elevation={1}
                sx={{
                  minHeight: 600,
                  backgroundColor: column.bgColor,
                  border: `1px solid ${column.color}20`,
                }}
              >
                {/* Column Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: `2px solid ${column.color}`,
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark" ? "#1e1e1e" : "white",
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ color: column.color }}>{column.icon}</Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "medium",
                          color: column.color,
                        }}
                      >
                        {column.title}
                      </Typography>
                    </Box>
                    <Badge
                      badgeContent={stats.total}
                      color="primary"
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: column.color,
                          color: "white",
                        },
                      }}
                    >
                      <Box />
                    </Badge>
                  </Box>

                  {/* Priority Stats */}
                  {stats.total > 0 && (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {stats.high > 0 && (
                        <Chip
                          size="small"
                          label={`High: ${stats.high}`}
                          color="error"
                          variant="outlined"
                        />
                      )}
                      {stats.medium > 0 && (
                        <Chip
                          size="small"
                          label={`Med: ${stats.medium}`}
                          color="warning"
                          variant="outlined"
                        />
                      )}
                      {stats.low > 0 && (
                        <Chip
                          size="small"
                          label={`Low: ${stats.low}`}
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  )}
                </Box>

                {/* Column Content */}
                <Box sx={{ p: 1, maxHeight: 520, overflowY: "auto" }}>
                  {columnTasks.length === 0 ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      minHeight={200}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        textAlign="center"
                      >
                        No {column.title.toLowerCase()} tasks
                      </Typography>
                    </Box>
                  ) : (
                    <Box display="flex" flexDirection="column" gap={1}>
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onStatusChange={onStatusChange}
                          compact
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Board Summary */}
      <Paper elevation={1} sx={{ mt: 3, p: 2, bgcolor: (theme) => theme.palette.background.paper  }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" color="textSecondary">
            Board Summary
          </Typography>
          <Box display="flex" gap={2}>
            <Typography variant="body2" color="textSecondary">
              Total Tasks: {tasks.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Overdue: {tasks.filter(isTaskOverdue).length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Completed: {tasks.filter((t) => t.status === "completed").length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Completion Rate:{" "}
              {tasks.length > 0
                ? Math.round(
                    (tasks.filter((t) => t.status === "completed").length /
                      tasks.length) *
                      100
                  )
                : 0}
              %
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default TaskBoard;

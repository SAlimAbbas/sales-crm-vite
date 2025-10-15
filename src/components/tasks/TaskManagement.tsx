import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  Add as AddIcon,
  ViewList as TableViewIcon,
  ViewModule as BoardViewIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { taskService } from "../../services/taskService";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { Task } from "../../types";
import CustomTable from "../ui/CustomTable";
import TaskForm from "./TaskForm";
import TaskBoard from "./TaskBoard";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSkeleton from "../common/LoadingSkeleton";

const TaskManagement: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "board">("table");
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Data fetching
  const {
    data: tasksData,
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: ["tasks", page, rowsPerPage, statusFilter],
    queryFn: () =>
      taskService.getTasks({
        page: page + 1,
        per_page: rowsPerPage,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  // Tab configuration
  const statusTabs = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Overdue", value: "overdue" },
  ];

  // Table columns configuration
  const columns = [
    {
      id: "title",
      label: "Task",
      sortable: true,
      render: (value: string, row: Task) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {value}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {row.lead?.company_name || "No related lead"}
          </Typography>
        </Box>
      ),
    },
    {
      id: "due_date",
      label: "Due Date",
      sortable: true,
      render: (value: string, row: Task) => {
        const isOverdue =
          new Date(value) < new Date() && row.status !== "completed";
        return (
          <Typography
            variant="body2"
            color={isOverdue ? "error" : "textPrimary"}
            sx={{ fontWeight: isOverdue ? "medium" : "normal" }}
          >
            {new Date(value).toLocaleDateString()}
          </Typography>
        );
      },
    },
    {
      id: "priority",
      label: "Priority",
      sortable: true,
      render: (value: string) => {
        const color =
          value === "high"
            ? "error"
            : value === "medium"
            ? "warning"
            : "success";
        return (
          <Chip
            label={value.toUpperCase()}
            size="small"
            color={color as any}
            variant="outlined"
          />
        );
      },
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (value: string, row: Task) => {
        const isOverdue =
          new Date(row.due_date) < new Date() && value !== "completed";
        const displayStatus = isOverdue ? "overdue" : value;
        const color =
          displayStatus === "completed"
            ? "success"
            : displayStatus === "in_progress"
            ? "info"
            : displayStatus === "overdue"
            ? "error"
            : "default";

        return (
          <Chip
            label={displayStatus.replace("_", " ").toUpperCase()}
            size="small"
            color={color as any}
            variant={displayStatus === "completed" ? "filled" : "outlined"}
            onClick={(e) => {
              e.stopPropagation();
              if (!isOverdue && canUpdateStatus(row)) {
                handleStatusChangeClick(row);
              }
            }}
            sx={{
              cursor:
                !isOverdue && canUpdateStatus(row) ? "pointer" : "default",
              "&:hover":
                !isOverdue && canUpdateStatus(row) ? { opacity: 0.8 } : {},
              transition: "opacity 0.2s",
            }}
          />
        );
      },
    },
    {
      id: "assigned_user",
      label: "Assigned To",
      sortable: false,
      render: (_: any, row: Task) => (
        <Typography variant="body2">
          {row.assigned_user?.name || "Unassigned"}
        </Typography>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      align: "right" as const,
      render: (_: any, row: Task) => (
        <Box display="flex" gap={1} justifyContent="flex-end">
          {canManageTask(row) && (
            <>
              <Button
                size="small"
                onClick={() => handleEdit(row)}
                variant="outlined"
              >
                Edit
              </Button>
              {row.status !== "completed" && canUpdateStatus(row) && (
                <Button
                  size="small"
                  color="success"
                  onClick={() => handleStatusChangeClick(row)}
                  variant="outlined"
                >
                  Complete
                </Button>
              )}
              {user?.role === "admin" && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(row)}
                  variant="outlined"
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </Box>
      ),
    },
  ];

  // Permission helpers
  const canManageTask = (task: Task): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "manager") return true; // Managers can manage team tasks
    return task.assigned_to === user.id || task.created_by === user.id;
  };

  const canUpdateStatus = (task: Task): boolean => {
    if (!user) return false;
    return task.assigned_to === user.id;
  };

  // Event handlers
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setOpenForm(true);
  };

  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setOpenDeleteDialog(true);
  };

  const handleStatusChangeClick = (task: Task) => {
    setSelectedTask(task);
    setOpenStatusDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTask) return;

    try {
      await taskService.deleteTask(selectedTask.id);
      showNotification("Task deleted successfully", "success");
      refetch();
    } catch (error) {
      showNotification("Failed to delete task", "error");
    } finally {
      setOpenDeleteDialog(false);
      setSelectedTask(null);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedTask(null);
  };

  const handleFormSuccess = () => {
    refetch();
    handleFormClose();
    showNotification(
      selectedTask ? "Task updated successfully" : "Task created successfully",
      "success"
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Task Management</Typography>
        <Box display="flex" gap={2} alignItems="center">
          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="table" aria-label="table view">
              <Tooltip title="Table View">
                <TableViewIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="board" aria-label="board view">
              <Tooltip title="Board View">
                <BoardViewIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Refresh Button */}
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {/* Add Task Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      {/* Status Filter Tabs */}
      {viewMode === "table" && (
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={statusFilter}
            onChange={(_, value) => setStatusFilter(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {statusTabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
        </Paper>
      )}

      {/* Content Area */}
      {viewMode === "table" ? (
        isLoading ? (
          <LoadingSkeleton variant="task" message="Loading tasks..." />
        ) : (
          <Paper sx={{ p: 3 }}>
            <CustomTable
              columns={columns}
              data={tasksData?.data || []}
              loading={false}
              pagination={{
                page,
                rowsPerPage,
                total: tasksData?.total || 0,
                onPageChange: setPage,
                onRowsPerPageChange: setRowsPerPage,
              }}
              emptyMessage="No tasks found"
            />
          </Paper>
        )
      ) : (
        <TaskBoard
          tasks={tasksData?.data || []}
          onEdit={handleEdit}
          onDelete={user?.role === "admin" ? handleDeleteClick : undefined}
          onStatusChange={handleStatusChangeClick}
          loading={isLoading}
        />
      )}

      {/* Task Form Modal */}
      <TaskForm
        open={openForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        task={selectedTask}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openDeleteDialog}
        title="Delete Task"
        message={`Are you sure you want to delete task "${selectedTask?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setOpenDeleteDialog(false)}
        severity="error"
        confirmText="Delete"
      />

      {/* Status Change Dialog */}
      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
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
                variant={
                  selectedTask?.status === status ? "contained" : "outlined"
                }
                onClick={async () => {
                  if (selectedTask) {
                    try {
                      await taskService.updateStatus(selectedTask.id, status);
                      showNotification(
                        "Task status updated successfully",
                        "success"
                      );
                      refetch();
                    } catch (error) {
                      showNotification("Failed to update task status", "error");
                    } finally {
                      setOpenStatusDialog(false);
                      setSelectedTask(null);
                    }
                  }
                }}
                fullWidth
              >
                {status.replace("_", " ").toUpperCase()}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TaskManagement;

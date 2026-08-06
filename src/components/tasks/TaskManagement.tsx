import React, { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  ViewList as TableViewIcon,
  ViewModule as BoardViewIcon,
  CalendarMonth as CalendarViewIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { taskService } from "../../services/taskService";
import { userService } from "../../services/userService";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { Task } from "../../types";
import { canEditTask, isTaskCompletedOverdue } from "../../utils/helpers";
import CustomTable from "../ui/CustomTable";
import TaskForm from "./TaskForm";
import TaskBoard from "./TaskBoard";
import TaskCalendar from "./TaskCalendar";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSkeleton from "../common/LoadingSkeleton";

const TaskManagement: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("due_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [viewMode, setViewMode] = useState<"table" | "board" | "calendar">(
    "table"
  );
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch users for filter dropdown
  const { data: usersData } = useQuery<any>({
    queryKey: ["users-filter-tasks"],
    queryFn: () => userService.getUsers({ per_page: 100 }),
  });

  const rawUsers: any[] = usersData?.data?.data || usersData?.data || [];

  // Team Leaders (manager) and Managers (manager_staff)
  const teamLeaders = React.useMemo(() => {
    return rawUsers.filter((u: any) => u.role === "manager");
  }, [rawUsers]);

  const managersStaff = React.useMemo(() => {
    return rawUsers.filter((u: any) => u.role === "manager_staff");
  }, [rawUsers]);

  // Determine role-scoped filterable users for the Assigned To dropdown
  const filterableUsers = React.useMemo(() => {
    if (!user) return [];

    if (user.role === "admin" || user.role === "manager_staff") {
      if (selectedTeam === "backend_exec") {
        return rawUsers.filter(
          (u: any) => u.role === "backend" || u.role === "lead_executive"
        );
      } else if (selectedTeam.startsWith("manager_staff_")) {
        const mId = parseInt(selectedTeam.replace("manager_staff_", ""), 10);
        return rawUsers.filter((u: any) => u.id === mId || u.manager_id === mId);
      } else if (selectedTeam.startsWith("manager_")) {
        const mId = parseInt(selectedTeam.replace("manager_", ""), 10);
        return rawUsers.filter((u: any) => u.id === mId || u.manager_id === mId);
      }
      return rawUsers;
    } else if (user.role === "manager") {
      return rawUsers.filter(
        (u: any) => u.manager_id === user.id || u.id === user.id
      );
    } else {
      const foundSelf = rawUsers.find((u: any) => u.id === user.id);
      return foundSelf
        ? [foundSelf]
        : [{ id: user.id, name: user.name, role: user.role }];
    }
  }, [rawUsers, user, selectedTeam]);

  const isIndividualRole =
    user?.role !== "admin" &&
    user?.role !== "manager_staff" &&
    user?.role !== "manager";

  const defaultAssignedFilter = isIndividualRole
    ? user?.id
      ? user.id.toString()
      : "all"
    : "all";

  // Set default assigned filter for individual staff
  useEffect(() => {
    if (isIndividualRole && user?.id && assignedToFilter === "all") {
      setAssignedToFilter(user.id.toString());
    }
  }, [isIndividualRole, user]);

  // Reset assignedToFilter when team changes
  useEffect(() => {
    if (user?.role === "admin" || user?.role === "manager_staff") {
      setAssignedToFilter("all");
    }
  }, [selectedTeam, user]);

  // Table Data fetching
  const {
    data: tasksData,
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: [
      "tasks",
      page,
      rowsPerPage,
      statusFilter,
      selectedTeam,
      assignedToFilter,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      taskService.getTasks({
        page: page + 1,
        per_page: rowsPerPage,
        status: statusFilter !== "all" ? statusFilter : undefined,
        team: selectedTeam !== "all" ? selectedTeam : undefined,
        assigned_to: assignedToFilter !== "all" ? assignedToFilter : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    enabled: viewMode === "table",
  });

  // Board & Calendar Data fetching (fetches ALL tasks matching filters)
  const {
    data: allTasksData,
    isLoading: isAllTasksLoading,
    refetch: refetchAllTasks,
  } = useQuery<any>({
    queryKey: [
      "tasks-all",
      statusFilter,
      selectedTeam,
      assignedToFilter,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      taskService.getTasks({
        per_page: 1000,
        include_overdue: "true",
        status: statusFilter !== "all" ? statusFilter : undefined,
        team: selectedTeam !== "all" ? selectedTeam : undefined,
        assigned_to: assignedToFilter !== "all" ? assignedToFilter : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    enabled: viewMode === "board" || viewMode === "calendar",
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
            {row.description || "No description"}
          </Typography>
          {row.lead?.company_name && (
            <Typography variant="body2" color="primary">
              Lead: {row.lead.company_name}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "created_at",
      label: "Created Date",
      sortable: true,
      render: (value: string) => (
        <Typography variant="body2" color="textSecondary">
          {new Date(value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      id: "due_date",
      label: "Due Date",
      sortable: true,
      render: (value: string, row: Task) => {
        const isOverdue =
          new Date(value) < new Date() && row.status !== "completed";
        const wasCompletedLate = isTaskCompletedOverdue(row);

        return (
          <Box display="flex" flexDirection="column">
            <Typography
              variant="body2"
              color={isOverdue || wasCompletedLate ? "error" : "textPrimary"}
              sx={{ fontWeight: isOverdue || wasCompletedLate ? "bold" : "normal" }}
            >
              {wasCompletedLate && "⚠️ "}
              {new Date(value).toLocaleDateString()}
            </Typography>
            {wasCompletedLate && (
              <Typography variant="caption" color="error" fontWeight="bold">
                (Late Completion)
              </Typography>
            )}
          </Box>
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
        const wasCompletedLate = isTaskCompletedOverdue(row);

        return (
          <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
            <Chip
              label={displayStatus.replace("_", " ").toUpperCase()}
              size="small"
              color={color as any}
              variant={displayStatus === "completed" ? "filled" : "outlined"}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChangeClick(row);
              }}
              sx={{
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
                transition: "opacity 0.2s",
              }}
            />
            {wasCompletedLate && (
              <Chip
                label="LATE"
                size="small"
                color="error"
                variant="filled"
                sx={{ height: 20, fontSize: 10, fontWeight: "bold" }}
              />
            )}
          </Box>
        );
      },
    },
    {
      id: "assigned_user",
      label: "Assigned To",
      sortable: false,
      render: (_: any, row: Task) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {row.assigned_users && row.assigned_users.length > 0 ? (
            row.assigned_users.map((au) => (
              <Chip key={au.id} label={au.name} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
            ))
          ) : (
            <Typography variant="body2">{row.assigned_user?.name || "Unassigned"}</Typography>
          )}
        </Box>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      align: "right" as const,
      render: (_: any, row: Task) => (
        <Box display="flex" gap={1} justifyContent="flex-end">
          {canEditTask(row, user) && (
            <Button
              size="small"
              onClick={() => handleEdit(row)}
              variant="outlined"
            >
              Edit
            </Button>
          )}
          {row.status !== "completed" && (
            <Button
              size="small"
              color="success"
              onClick={() => handleStatusChangeClick(row)}
              variant="outlined"
            >
              Complete
            </Button>
          )}
          {(user?.role === "admin" || user?.role === "manager_staff") && (
            <Button
              size="small"
              color="error"
              onClick={() => handleDeleteClick(row)}
              variant="outlined"
            >
              Delete
            </Button>
          )}
        </Box>
      ),
    },
  ];

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
      if (viewMode === "table") refetch();
      else refetchAllTasks();
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
    if (viewMode === "table") refetch();
    else refetchAllTasks();
    handleFormClose();
    showNotification(
      selectedTask ? "Task updated successfully" : "Task created successfully",
      "success"
    );
  };

  const handleRefresh = () => {
    if (viewMode === "table") {
      refetch();
    } else {
      refetchAllTasks();
    }
  };

  const isFiltered =
    selectedTeam !== "all" ||
    assignedToFilter !== defaultAssignedFilter ||
    startDate !== "" ||
    endDate !== "" ||
    statusFilter !== "all";

  const handleResetFilters = () => {
    setSelectedTeam("all");
    setAssignedToFilter(defaultAssignedFilter);
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setPage(0);
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
            <ToggleButton value="calendar" aria-label="calendar view">
              <Tooltip title="Calendar View">
                <CalendarViewIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Refresh Button */}
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} color="primary">
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

      {/* Filter Bar */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Filter by Team (Admin & Manager Staff) */}
          {(user?.role === "admin" || user?.role === "manager_staff") && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Team</InputLabel>
                <Select
                  value={selectedTeam}
                  label="Filter by Team"
                  onChange={(e) => {
                    setSelectedTeam(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">All Teams</MenuItem>
                  {teamLeaders.map((m: any) => (
                    <MenuItem key={`tl_${m.id}`} value={`manager_${m.id}`}>
                      {m.name} (Team Leader)
                    </MenuItem>
                  ))}
                  {managersStaff.map((m: any) => (
                    <MenuItem key={`ms_${m.id}`} value={`manager_staff_${m.id}`}>
                      {m.name} (Manager)
                    </MenuItem>
                  ))}
                  <MenuItem value="backend_exec">
                    Backend & Executive Team (Shikhar)
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Assigned To Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={assignedToFilter}
                label="Assigned To"
                onChange={(e) => {
                  setAssignedToFilter(e.target.value);
                  setPage(0);
                }}
              >
                {(user?.role === "admin" || user?.role === "manager_staff") && (
                  <MenuItem value="all">All Users</MenuItem>
                )}
                {user?.role === "manager" && (
                  <MenuItem value="all">All Team Members</MenuItem>
                )}
                {filterableUsers.map((u: any) => (
                  <MenuItem key={u.id} value={u.id.toString()}>
                    {u.name} ({u.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Start Date */}
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              label="Start Due Date"
              type="date"
              size="small"
              fullWidth
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: startDate ? (
                  <IconButton size="small" onClick={() => setStartDate("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : undefined,
              }}
            />
          </Grid>

          {/* End Date */}
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              label="End Due Date"
              type="date"
              size="small"
              fullWidth
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: endDate ? (
                  <IconButton size="small" onClick={() => setEndDate("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : undefined,
              }}
            />
          </Grid>

          {/* Reset Filters */}
          {isFiltered && (
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                fullWidth
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </Grid>
          )}
        </Grid>

        {/* Status Filter Tabs (for Table View) */}
        {viewMode === "table" && (
          <Box sx={{ mt: 2, borderTop: 1, borderColor: "divider", pt: 1 }}>
            <Tabs
              value={statusFilter}
              onChange={(_, value) => {
                setStatusFilter(value);
                setPage(0);
              }}
              variant="scrollable"
              scrollButtons="auto"
            >
              {statusTabs.map((tab) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </Tabs>
          </Box>
        )}
      </Paper>

      {/* Content Area */}
      {viewMode === "table" ? (
        isLoading ? (
          <LoadingSkeleton variant="task" message="Loading tasks..." />
        ) : (
          <Paper sx={{ p: 3, mx: 0.5, my: 1, borderRadius: 2, boxShadow: 2 }}>
            <CustomTable
              columns={columns}
              data={tasksData?.data || []}
              loading={false}
              sorting={{
                sortBy,
                sortOrder,
                onSort: (colId, order) => {
                  setSortBy(colId);
                  setSortOrder(order);
                },
              }}
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
      ) : viewMode === "board" ? (
        <TaskBoard
          tasks={allTasksData?.data || []}
          onEdit={handleEdit}
          onDelete={
            user?.role === "admin" || user?.role === "manager_staff"
              ? handleDeleteClick
              : undefined
          }
          onStatusChange={handleStatusChangeClick}
          loading={isAllTasksLoading}
        />
      ) : (
        <TaskCalendar
          tasks={allTasksData?.data || []}
          onEdit={handleEdit}
          onDelete={
            user?.role === "admin" || user?.role === "manager_staff"
              ? handleDeleteClick
              : undefined
          }
          onStatusChange={handleStatusChangeClick}
          loading={isAllTasksLoading}
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
                      if (viewMode === "table") refetch();
                      else refetchAllTasks();
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

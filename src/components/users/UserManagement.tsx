import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  RestoreFromTrash as RestoreIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import CustomTable from "../ui/CustomTable";
import UserForm from "./UserForm";
import ConfirmDialog from "../common/ConfirmDialog";
import { useNotification } from "../../contexts/NotificationContext";
import { User } from "../../types";

const UserManagement: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { showNotification } = useNotification();

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: ["users", page, rowsPerPage, searchTerm],
    queryFn: () =>
      userService.getUsers({
        page: page + 1,
        per_page: rowsPerPage,
        search: searchTerm,
      }),
  });

  const columns = [
    {
      id: "name",
      label: "Name",
      sortable: true,
      render: (value: string, row: User) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {value}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {row.email}
          </Typography>
        </Box>
      ),
    },
    {
      id: "role",
      label: "Role",
      sortable: true,
      render: (value: string) => (
        <Chip
          label={value}
          size="small"
          color={
            value === "admin"
              ? "error"
              : value === "manager"
              ? "warning"
              : "primary"
          }
          variant="outlined"
        />
      ),
    },
    {
      id: "shift",
      label: "Shift",
      sortable: true,
      render: (value: string | undefined, row: User) =>
        row.role === "admin" ? "-" : value || "-",
    },
    {
      id: "type",
      label: "Type",
      sortable: true,
      render: (value: string | undefined, row: User) =>
        row.role === "admin" ? "-" : value || "-",
    },
    {
      id: "phone",
      label: "Phone",
      sortable: false,
      render: (value: string | undefined) => value || "-",
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (_: any, row: User) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            label={
              row.is_deleted ? "Deleted" : row.is_active ? "Active" : "Inactive"
            }
            color={
              row.is_deleted ? "error" : row.is_active ? "success" : "default"
            }
            size="small"
          />
          {!row.is_deleted && (
            <IconButton
              size="small"
              onClick={() => handleStatusClick(row)}
              color={row.is_active ? "warning" : "success"}
            >
              {row.is_active ? "🚫" : "✅"}
            </IconButton>
          )}
        </Box>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      align: "right" as const,
      render: (_: any, row: User) => (
        <Box display="flex" gap={1} justifyContent="flex-end">
          <Button
            size="small"
            onClick={() => handleEdit(row)}
            variant="outlined"
            disabled={row.is_deleted}
          >
            Edit
          </Button>

          {row.is_deleted ? (
            <Button
              size="small"
              color="success"
              startIcon={<RestoreIcon />}
              onClick={() => handleRestoreClick(row)}
              variant="outlined"
            >
              Restore
            </Button>
          ) : (
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

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleStatusClick = (user: User) => {
    setSelectedUser(user);
    setOpenStatusDialog(true);
  };

  const handleRestoreClick = (user: User) => {
    setSelectedUser(user);
    setOpenRestoreDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser.id);
      showNotification("User deleted successfully", "success");
      refetch();
    } catch (error) {
      showNotification("Failed to delete user", "error");
    } finally {
      setOpenDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  const handleStatusConfirm = async () => {
    if (!selectedUser) return;

    try {
      const newStatus = !selectedUser.is_active;
      await userService.updateStatus(selectedUser.id, newStatus);
      showNotification(
        `User ${newStatus ? "activated" : "deactivated"} successfully`,
        "success"
      );
      refetch();
    } catch (error) {
      showNotification("Failed to update user status", "error");
    } finally {
      setOpenStatusDialog(false);
      setSelectedUser(null);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!selectedUser) return;

    try {
      await userService.restoreUser(selectedUser.id);
      showNotification("User restored successfully", "success");
      refetch();
    } catch (error) {
      showNotification("Failed to restore user", "error");
    } finally {
      setOpenRestoreDialog(false);
      setSelectedUser(null);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedUser(null);
  };

  const handleFormSuccess = () => {
    refetch();
    handleFormClose();
    showNotification(
      selectedUser ? "User updated successfully" : "User created successfully",
      "success"
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Search Box */}
        <Box mb={2}>
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>

        <CustomTable
          columns={columns}
          data={usersData?.data || []}
          loading={isLoading}
          pagination={{
            page,
            rowsPerPage,
            total: usersData?.total || 0,
            onPageChange: setPage,
            onRowsPerPageChange: setRowsPerPage,
          }}
          emptyMessage="No users found"
        />
      </Paper>

      <UserForm
        open={openForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        user={selectedUser}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={openDeleteDialog}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.name}"? This will delete the user.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setOpenDeleteDialog(false)}
        severity="error"
        confirmText="Delete"
      />

      {/* Status Toggle Confirmation */}
      <ConfirmDialog
        open={openStatusDialog}
        title={selectedUser?.is_active ? "Deactivate User" : "Activate User"}
        message={`Are you sure you want to ${
          selectedUser?.is_active ? "deactivate" : "activate"
        } user "${selectedUser?.name}"?`}
        onConfirm={handleStatusConfirm}
        onCancel={() => setOpenStatusDialog(false)}
        severity={selectedUser?.is_active ? "warning" : "success"}
        confirmText={selectedUser?.is_active ? "Deactivate" : "Activate"}
      />

      {/* Restore Confirmation */}
      <ConfirmDialog
        open={openRestoreDialog}
        title="Restore User"
        message={`Are you sure you want to restore user "${selectedUser?.name}"?`}
        onConfirm={handleRestoreConfirm}
        onCancel={() => setOpenRestoreDialog(false)}
        severity="success"
        confirmText="Restore"
      />
    </Box>
  );
};

export default UserManagement;

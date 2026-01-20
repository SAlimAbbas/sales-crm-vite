import React, { useState } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Assignment as AssignIcon,
  Update as UpdateIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { leadService } from "../../services/leadService";
import { useNotification } from "../../contexts/NotificationContext";
import { LEAD_STATUS } from "../../utils/constants";
import { User } from "../../types";
import { getStatusColor } from "../../utils/helpers";

interface LeadBulkActionsProps {
  selectedIds: number[];
  onClearSelection: () => void;
  onRefresh: () => void;
  disabled?: boolean;
  currentUser: any;
}

interface BulkAssignDialog {
  open: boolean;
  salespersonId: string;
  loading: boolean;
  scheduleFor: string; // ✅ Added
}

interface BulkUpdateDialog {
  open: boolean;
  status: string;
  loading: boolean;
}

interface BulkDeleteDialog {
  open: boolean;
  loading: boolean;
}

const LeadBulkActions: React.FC<LeadBulkActionsProps> = ({
  selectedIds,
  onClearSelection,
  onRefresh,
  currentUser,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [assignDialog, setAssignDialog] = useState<BulkAssignDialog>({
    open: false,
    salespersonId: "",
    loading: false,
    scheduleFor: "", // ✅ Added
  });
  const [updateDialog, setUpdateDialog] = useState<BulkUpdateDialog>({
    open: false,
    status: "",
    loading: false,
  });
  const [deleteDialog, setDeleteDialog] = useState<BulkDeleteDialog>({
    open: false,
    loading: false,
  });

  const { showNotification } = useNotification();

  const normalizeUserResponse = (
    response: any | User[] | undefined,
  ): User[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if ("data" in response && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  };

  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery<User[]>({
    queryKey: ["assignable-users", currentUser.role, currentUser.id],
    queryFn: async () => {
      if (currentUser.role === "admin") {
        const [managersRes, salespeopleRes] = await Promise.all([
          userService.getUsers({ role: "manager", is_active: true }),
          userService.getUsers({ role: "salesperson", is_active: true }),
        ]);

        const managers = normalizeUserResponse(managersRes);
        const salespeople = normalizeUserResponse(salespeopleRes);

        return [...managers, ...salespeople];
      } else if (currentUser.role === "manager") {
        const teamDataRes = await userService.getUsers({
          manager_id: currentUser.id,
          role: "salesperson",
          is_active: true,
        });

        const teamData = normalizeUserResponse(teamDataRes);
        return [currentUser, ...teamData];
      }

      const salespeopleRes = await userService.getUsers({
        role: "salesperson",
        is_active: true,
      });

      return normalizeUserResponse(salespeopleRes);
    },
    enabled: false,
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAssignMenuClick = () => {
    refetchUsers();
    setAssignDialog({
      open: true,
      salespersonId: "",
      loading: false,
      scheduleFor: "", // ✅ Added
    });
    handleMenuClose();
  };

  const handleBulkAssign = async () => {
    if (!assignDialog.salespersonId) return;

    setAssignDialog({ ...assignDialog, loading: true });

    try {
      await leadService.bulkAssign(
        selectedIds,
        parseInt(assignDialog.salespersonId),
        assignDialog.scheduleFor || undefined, // ✅ Added
      );

      // ✅ Updated message based on scheduling
      const message = assignDialog.scheduleFor
        ? `Successfully scheduled ${selectedIds.length} leads for assignment on ${new Date(assignDialog.scheduleFor).toLocaleString()}`
        : `Successfully assigned ${selectedIds.length} leads`;

      showNotification(message, "success");
      onRefresh();
      onClearSelection();
      setAssignDialog({
        open: false,
        salespersonId: "",
        loading: false,
        scheduleFor: "",
      }); // ✅ Updated
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Failed to assign leads",
        "error",
      );
    } finally {
      setAssignDialog({ ...assignDialog, loading: false });
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (!updateDialog.status) return;

    setUpdateDialog({ ...updateDialog, loading: true });

    try {
      await leadService.bulkUpdateStatus(selectedIds, updateDialog.status);
      showNotification(
        `Successfully updated ${selectedIds.length} leads`,
        "success",
      );
      onRefresh();
      onClearSelection();
      setUpdateDialog({ open: false, status: "", loading: false });
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Failed to update leads",
        "error",
      );
    } finally {
      setUpdateDialog({ ...updateDialog, loading: false });
    }
  };

  const handleBulkDelete = async () => {
    setDeleteDialog({ ...deleteDialog, loading: true });

    try {
      await leadService.bulkDelete(selectedIds);
      showNotification(
        `Successfully deleted ${selectedIds.length} leads`,
        "success",
      );
      onRefresh();
      onClearSelection();
      setDeleteDialog({ open: false, loading: false });
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Failed to delete leads",
        "error",
      );
    } finally {
      setDeleteDialog({ ...deleteDialog, loading: false });
    }
  };

  const handleBulkExport = async () => {
    try {
      await leadService.bulkExportLeads(selectedIds);
      showNotification(
        `Successfully exported ${selectedIds.length} leads`,
        "success",
      );
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Failed to export leads",
        "error",
      );
    }
  };

  const statusOptions = [
    { value: LEAD_STATUS.ASSIGNED, label: "Assigned" },
    ...(currentUser.role === "admin" || currentUser.role === "manager"
      ? [{ value: LEAD_STATUS.UNASSIGNED, label: "Unassigned" }]
      : []),
    { value: LEAD_STATUS.PROSPECTS, label: "Prospects" },
    { value: LEAD_STATUS.CONVERTED, label: "Converted" },
    { value: LEAD_STATUS.RINGING, label: "Ringing" },
    { value: LEAD_STATUS.CALL_BACK, label: "Call Back" },
    { value: LEAD_STATUS.FOLLOW_UP, label: "Follow Up" },
    { value: LEAD_STATUS.NOT_INTERESTED, label: "Not Interested" },
    { value: LEAD_STATUS.WHATSAPPED, label: "WhatsApped" },
    { value: LEAD_STATUS.INVALID_CONTACT, label: "Invalid Contact" },
    { value: LEAD_STATUS.NOT_ON_WHATSAPP, label: "Not on WhatsApp" },
    { value: LEAD_STATUS.BUSY, label: "Busy" },
    { value: LEAD_STATUS.CALL_DISCONNECTED, label: "Call Disconnected" },
    { value: LEAD_STATUS.NO_RESPONSE, label: "No Response" },
    { value: LEAD_STATUS.SWITCHED_OFF, label: "Switched Off" },
    { value: LEAD_STATUS.NOT_REACHABLE, label: "Not Reachable" },
  ];

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        p={2}
        bgcolor="primary.light"
        color="primary.contrastText"
        borderRadius={1}
        mb={2}
      >
        <Typography variant="body2">
          {selectedIds.length} lead{selectedIds.length > 1 ? "s" : ""} selected
        </Typography>

        <Chip label={`${selectedIds.length}`} size="small" color="primary" />

        <Button
          variant="contained"
          size="small"
          endIcon={<ExpandMoreIcon />}
          onClick={handleMenuOpen}
          disabled={disabled}
          sx={{ ml: "auto" }}
        >
          Actions
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={onClearSelection}
          sx={{ color: "inherit", borderColor: "currentColor" }}
        >
          Clear
        </Button>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {currentUser.role === "admin" || currentUser.role === "manager" ? (
          <MenuItem onClick={handleAssignMenuClick}>
            <AssignIcon fontSize="small" sx={{ mr: 1 }} />
            Assign to Salesperson or Manager
          </MenuItem>
        ) : null}

        <MenuItem
          onClick={() => {
            setUpdateDialog({ open: true, status: "", loading: false });
            handleMenuClose();
          }}
        >
          <UpdateIcon fontSize="small" sx={{ mr: 1 }} />
          Update Status
        </MenuItem>

        {currentUser.role === "admin" || currentUser.role === "manager" ? (
          <>
            <Divider />
            <MenuItem
              onClick={() => {
                setDeleteDialog({ open: true, loading: false });
                handleMenuClose();
              }}
              sx={{ color: "error.main" }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete Leads
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleBulkExport();
                handleMenuClose();
              }}
            >
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
              Export Selected
            </MenuItem>
          </>
        ) : null}
      </Menu>

      {/* Bulk Assign Dialog */}
      <Dialog
        open={assignDialog.open}
        onClose={
          () =>
            !assignDialog.loading &&
            setAssignDialog({
              open: false,
              salespersonId: "",
              loading: false,
              scheduleFor: "",
            }) // ✅ Updated
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign {selectedIds.length} Lead{selectedIds.length > 1 ? "s" : ""} to
          {currentUser.role === "admin"
            ? " Manager/Salesperson"
            : " Team Member"}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              This will assign all selected leads to the chosen person and
              update their status to "Assigned".
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Select Assignee</InputLabel>
              <Select
                value={assignDialog.salespersonId}
                label="Select Assignee"
                onChange={(e) =>
                  setAssignDialog({
                    ...assignDialog,
                    salespersonId: e.target.value,
                  })
                }
                disabled={assignDialog.loading || usersLoading}
              >
                {usersLoading ? (
                  <MenuItem disabled>Loading users...</MenuItem>
                ) : usersData && usersData.length > 0 ? (
                  usersData.map((user: User) => (
                    <MenuItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                      {user.role === "manager" && " - Manager"}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No users available</MenuItem>
                )}
              </Select>
            </FormControl>

            {/* ✅ NEW: Schedule Assignment Field */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Schedule Assignment (Optional)
              </Typography>
              <input
                type="datetime-local"
                value={assignDialog.scheduleFor}
                onChange={(e) =>
                  setAssignDialog({
                    ...assignDialog,
                    scheduleFor: e.target.value,
                  })
                }
                min={new Date().toISOString().slice(0, 16)}
                disabled={assignDialog.loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              />
              <Typography variant="caption" color="textSecondary">
                Leave empty for immediate assignment
              </Typography>
            </Box>

            {assignDialog.loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {assignDialog.scheduleFor
                    ? "Scheduling assignment..."
                    : "Assigning leads..."}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setAssignDialog({
                open: false,
                salespersonId: "",
                loading: false,
                scheduleFor: "", // ✅ Updated
              })
            }
            disabled={assignDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkAssign}
            variant="contained"
            disabled={assignDialog.loading || !assignDialog.salespersonId}
          >
            {assignDialog.loading
              ? assignDialog.scheduleFor
                ? "Scheduling..."
                : "Assigning..."
              : assignDialog.scheduleFor
                ? "Schedule Assignment"
                : "Assign Now"}{" "}
            {/* ✅ Updated button text */}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Update Status Dialog */}
      <Dialog
        open={updateDialog.open}
        onClose={() =>
          !updateDialog.loading &&
          setUpdateDialog({ open: false, status: "", loading: false })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Update Status for {selectedIds.length} Lead
          {selectedIds.length > 1 ? "s" : ""}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This will update the status of all selected leads.
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Select Status</InputLabel>
              <Select
                value={updateDialog.status}
                label="Select Status"
                onChange={(e) =>
                  setUpdateDialog({ ...updateDialog, status: e.target.value })
                }
                disabled={updateDialog.loading}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={option.label}
                        size="small"
                        color={getStatusColor(option.value) as any}
                        variant="filled"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {updateDialog.loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Updating leads...
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setUpdateDialog({ open: false, status: "", loading: false })
            }
            disabled={updateDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkUpdateStatus}
            variant="contained"
            disabled={updateDialog.loading || !updateDialog.status}
          >
            {updateDialog.loading ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() =>
          !deleteDialog.loading &&
          setDeleteDialog({ open: false, loading: false })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: "error.main" }}>
          Delete {selectedIds.length} Lead{selectedIds.length > 1 ? "s" : ""}?
        </DialogTitle>

        <DialogContent>
          <Alert severity="error">
            This action cannot be undone. Are you sure you want to delete{" "}
            {selectedIds.length} lead{selectedIds.length > 1 ? "s" : ""}?
          </Alert>

          {deleteDialog.loading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Deleting leads...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, loading: false })}
            disabled={deleteDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkDelete}
            color="error"
            variant="contained"
            disabled={deleteDialog.loading}
          >
            {deleteDialog.loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LeadBulkActions;

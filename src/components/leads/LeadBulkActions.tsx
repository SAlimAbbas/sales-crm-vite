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
  currentUser: any; // Add this line
}

interface BulkAssignDialog {
  open: boolean;
  salespersonId: string;
  loading: boolean;
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

  const { data: usersData } = useQuery<any>({
    queryKey: ["salespeople"],
    queryFn: () => userService.getUsers({ role: "salesperson" }),
    enabled: assignDialog.open,
    select: (data) => data?.data || data, // Handle both ApiResponse<UsersResponse> and UsersResponse
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBulkAssign = async () => {
    if (!assignDialog.salespersonId) return;

    setAssignDialog({ ...assignDialog, loading: true });

    try {
      await leadService.bulkAssign(
        selectedIds,
        parseInt(assignDialog.salespersonId)
      );
      showNotification(
        `Successfully assigned ${selectedIds.length} leads`,
        "success"
      );
      onRefresh();
      onClearSelection();
      setAssignDialog({ open: false, salespersonId: "", loading: false });
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Failed to assign leads",
        "error"
      );
    } finally {
      setAssignDialog({ ...assignDialog, loading: false });
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (!updateDialog.status) return;

    setUpdateDialog({ ...updateDialog, loading: true });

    try {
      // Note: You'll need to implement this endpoint in your backend
      await leadService.bulkUpdateStatus(selectedIds, updateDialog.status);
      showNotification(
        `Successfully updated ${selectedIds.length} leads`,
        "success"
      );
      onRefresh();
      onClearSelection();
      setUpdateDialog({ open: false, status: "", loading: false });
    } catch (error: any) {
      console.error("Bulk update error:", error.response?.data); // Add this for debugging
      showNotification(
        error.response?.data?.message || "Failed to update leads",
        "error"
      );
    } finally {
      setUpdateDialog({ ...updateDialog, loading: false });
    }
  };

  const handleBulkDelete = async () => {
    setDeleteDialog({ ...deleteDialog, loading: true });

    try {
      // Note: You'll need to implement this endpoint in your backend
      await leadService.bulkDelete(selectedIds);
      showNotification(
        `Successfully deleted ${selectedIds.length} leads`,
        "success"
      );
      onRefresh();
      onClearSelection();
      setDeleteDialog({ open: false, loading: false });
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Failed to delete leads",
        "error"
      );
    } finally {
      setDeleteDialog({ ...deleteDialog, loading: false });
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
    { value: LEAD_STATUS.INVALID_NUMBER, label: "Invalid Number" },
    { value: LEAD_STATUS.WHATSAPPED, label: "WhatsApped" },
    { value: LEAD_STATUS.INVALID_CONTACT, label: "Invalid Contact" },
    { value: LEAD_STATUS.NOT_ON_WHATSAPP, label: "Not on WhatsApp" },
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
          <MenuItem
            onClick={() => {
              setAssignDialog({
                open: true,
                salespersonId: "",
                loading: false,
              });
              handleMenuClose();
            }}
          >
            <AssignIcon fontSize="small" sx={{ mr: 1 }} />
            Assign to Salesperson
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
          </>
        ) : null}
      </Menu>

      {/* Bulk Assign Dialog */}
      <Dialog
        open={assignDialog.open}
        onClose={() =>
          !assignDialog.loading &&
          setAssignDialog({ open: false, salespersonId: "", loading: false })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign {selectedIds.length} Lead{selectedIds.length > 1 ? "s" : ""} to
          Salesperson
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              This will assign all selected leads to the chosen salesperson and
              update their status to "Assigned".
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Select Salesperson</InputLabel>
              <Select
                value={assignDialog.salespersonId}
                label="Select Salesperson"
                onChange={(e) =>
                  setAssignDialog({
                    ...assignDialog,
                    salespersonId: e.target.value,
                  })
                }
                disabled={assignDialog.loading}
              >
                {(usersData?.data || usersData || []).map((user: User) => (
                  <MenuItem key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {assignDialog.loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Assigning leads...
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
            {assignDialog.loading ? "Assigning..." : "Assign"}
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
                        variant="outlined"
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

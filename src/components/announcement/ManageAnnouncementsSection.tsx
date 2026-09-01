import React, { useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
  Autocomplete,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  announcementService,
  Announcement,
  CreateAnnouncementPayload,
} from "../../services/announcementService";
import { userService } from "../../services/userService";
import { User } from "../../types/user";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { format } from "date-fns";

const ALL_ROLES_CONFIG = [
  { value: "all", label: "All Roles (Everyone)" },
  { value: "salesperson", label: "Salesperson" },
  { value: "manager", label: "Team Leader (Manager)" },
  { value: "manager_staff", label: "Manager (Staff)" },
  { value: "lead_executive", label: "Lead Executive" },
  { value: "backend", label: "Backend" },
];

const TYPE_OPTIONS = [
  { value: "info", label: "ℹ Info" },
  { value: "warning", label: "⚠ Warning" },
  { value: "success", label: "✅ Success" },
  { value: "error", label: "🚨 Alert" },
];

const EMPTY_FORM: CreateAnnouncementPayload = {
  title: "",
  description: "",
  type: "info",
  target_roles: ["all"],
  target_users: ["all"],
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
  is_active: true,
};

const ManageAnnouncementsSection: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();

  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateAnnouncementPayload>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: allData, isLoading } = useQuery<any>({
    queryKey: ["all-announcements"],
    queryFn: () => announcementService.getAllAnnouncements(),
  });

  const { data: usersData } = useQuery<any>({
    queryKey: ["active-users-for-announcements"],
    queryFn: () => userService.getUsers({ per_page: 250, is_active: true }),
  });

  const announcements: Announcement[] = allData?.data ?? [];
  const allUsers: User[] = usersData?.data ?? [];

  // Available roles: 'manager_staff' is only visible if the logged-in user is 'admin'
  const availableRoles = useMemo(() => {
    return ALL_ROLES_CONFIG.filter((r) => {
      if (r.value === "manager_staff") {
        return currentUser?.role === "admin";
      }
      return true;
    });
  }, [currentUser?.role]);

  // Check if "All Roles" is currently selected
  const isAllRolesSelected =
    form.target_roles.includes("all") || form.target_roles.length === 0;

  // Filter available users based on selected roles (and exclude manager_staff if current user is manager_staff)
  const availableUsers = useMemo(() => {
    if (isAllRolesSelected) return [];
    let users = allUsers.filter((u) => form.target_roles.includes(u.role));
    if (currentUser?.role === "manager_staff") {
      users = users.filter((u) => u.role !== "manager_staff");
    }
    return users;
  }, [allUsers, form.target_roles, isAllRolesSelected, currentUser?.role]);

  // Selected User objects for Autocomplete
  const selectedUserObjects = useMemo(() => {
    if (isAllRolesSelected || !form.target_users || form.target_users.includes("all")) {
      return [];
    }
    const selectedIds = form.target_users.map((id) => String(id));
    return availableUsers.filter((u) => selectedIds.includes(String(u.id)));
  }, [availableUsers, form.target_users, isAllRolesSelected]);

  const createMutation = useMutation({
    mutationFn: announcementService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["my-announcements"] });
      showNotification("Announcement created successfully", "success");
      handleClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Failed to save announcement";
      setError(msg);
      showNotification(msg, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateAnnouncementPayload>;
    }) => announcementService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["my-announcements"] });
      showNotification("Announcement updated successfully", "success");
      handleClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ?? "Failed to update announcement";
      setError(msg);
      showNotification(msg, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: announcementService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["my-announcements"] });
      showNotification("Announcement deleted successfully", "success");
      setDeleteConfirmId(null);
    },
    onError: () => {
      showNotification("Failed to delete announcement", "error");
    },
  });

  const formatDateForInput = (date: string) => {
    if (!date) return "";
    return date.split("T")[0];
  };

  const formatDateForDisplay = (date: string) => {
    if (!date) return "-";
    return format(new Date(date + "T00:00:00"), "MMM dd, yyyy");
  };

  const handleOpen = (announcement?: Announcement) => {
    if (announcement) {
      setEditingId(announcement.id);
      setForm({
        title: announcement.title,
        description: announcement.description,
        type: announcement.type,
        target_roles: announcement.target_roles || ["all"],
        target_users:
          announcement.target_users && announcement.target_users.length > 0
            ? announcement.target_users
            : ["all"],
        start_date: formatDateForInput(announcement.start_date),
        end_date: formatDateForInput(announcement.end_date),
        is_active: announcement.is_active,
      });
    } else {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    setError(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleRoleSelectChange = (selectedValues: string[]) => {
    const wasAllSelected = form.target_roles.includes("all");
    const isAllInSelected = selectedValues.includes("all");

    // Case 1: User just clicked 'All Roles' when specific roles were selected
    if (!wasAllSelected && isAllInSelected) {
      setForm((f) => ({
        ...f,
        target_roles: ["all"],
        target_users: ["all"],
      }));
      return;
    }

    // Case 2: User clicked 'All Roles' to uncheck it
    if (wasAllSelected && !isAllInSelected && selectedValues.length === 0) {
      setForm((f) => ({
        ...f,
        target_roles: [],
        target_users: ["all"],
      }));
      return;
    }

    // Case 3: 'All Roles' was selected and user clicked a specific role
    if (wasAllSelected && selectedValues.length > 0) {
      const specificRoles = selectedValues.filter((r) => r !== "all");
      setForm((f) => ({
        ...f,
        target_roles: specificRoles,
        target_users: ["all"],
      }));
      return;
    }

    // Case 4: User is toggling specific roles
    const specificRoles = selectedValues.filter((r) => r !== "all");
    setForm((f) => {
      const updatedUsers = (f.target_users || []).filter((uid) => {
        if (uid === "all") return true;
        const u = allUsers.find((user) => String(user.id) === String(uid));
        return u && specificRoles.includes(u.role);
      });

      return {
        ...f,
        target_roles: specificRoles,
        target_users: updatedUsers.length > 0 ? updatedUsers : ["all"],
      };
    });
  };

  const handleSubmit = () => {
    if (
      !form.title ||
      !form.description ||
      !form.start_date ||
      !form.end_date
    ) {
      setError("Please fill all required fields.");
      return;
    }

    const payload: CreateAnnouncementPayload = {
      ...form,
      target_roles: form.target_roles.length > 0 ? form.target_roles : ["all"],
      target_users:
        form.target_roles.includes("all") ||
        !form.target_users ||
        form.target_users.length === 0 ||
        form.target_users.includes("all")
          ? null
          : form.target_users,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight="600">
          Manage Announcements
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          New Announcement
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Title</strong>
              </TableCell>
              <TableCell>
                <strong>Type</strong>
              </TableCell>
              <TableCell>
                <strong>Audience (Roles & Users)</strong>
              </TableCell>
              <TableCell>
                <strong>Start Date</strong>
              </TableCell>
              <TableCell>
                <strong>End Date</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading announcements...
                </TableCell>
              </TableRow>
            ) : announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No announcements found
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((a) => {
                const isEveryone =
                  a.target_roles.includes("all") || a.target_roles.length === 0;
                const targetedUserCount =
                  a.target_users && !a.target_users.includes("all")
                    ? a.target_users.length
                    : 0;

                return (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {a.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={a.type === "error" ? "Alert" : a.type.toUpperCase()}
                        color={
                          a.type === "info"
                            ? "info"
                            : a.type === "warning"
                              ? "warning"
                              : a.type === "success"
                                ? "success"
                                : "error"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {isEveryone ? (
                            <Chip
                              icon={<GroupIcon fontSize="small" />}
                              label="All Roles (Everyone)"
                              color="primary"
                              size="small"
                              variant="filled"
                            />
                          ) : (
                            a.target_roles.map((r) => (
                              <Chip
                                key={r}
                                label={
                                  ALL_ROLES_CONFIG.find((ro) => ro.value === r)
                                    ?.label ?? r
                                }
                                size="small"
                                variant="outlined"
                              />
                            ))
                          )}
                        </Box>
                        {!isEveryone && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {targetedUserCount > 0 ? (
                              <Chip
                                icon={<PersonIcon fontSize="small" />}
                                label={`${targetedUserCount} Specific User${
                                  targetedUserCount > 1 ? "s" : ""
                                }`}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Target: All users in selected roles
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDateForDisplay(a.start_date)}</TableCell>
                    <TableCell>{formatDateForDisplay(a.end_date)}</TableCell>
                    <TableCell>
                      {(() => {
                        const todayStr = new Date().toISOString().split("T")[0];
                        const isExpired = a.end_date < todayStr;
                        const isActuallyActive = a.is_active && !isExpired;

                        return (
                          <Chip
                            label={
                              !a.is_active
                                ? "Inactive"
                                : isExpired
                                  ? "Expired"
                                  : "Active"
                            }
                            color={
                              isActuallyActive
                                ? "success"
                                : isExpired
                                  ? "warning"
                                  : "default"
                            }
                            size="small"
                          />
                        );
                      })()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen(a)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteConfirmId(a.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? "Edit Announcement" : "New Announcement"}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            pt: "16px !important",
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Title *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            fullWidth
            placeholder="e.g. Monthly Performance Review"
          />

          <TextField
            label="Description *"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            multiline
            minRows={4}
            fullWidth
            placeholder="Detailed announcement content..."
          />

          <FormControl fullWidth>
            <InputLabel>Type *</InputLabel>
            <Select
              value={form.type}
              label="Type *"
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as any }))
              }
            >
              {TYPE_OPTIONS.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Target Roles Dropdown (Multi-select with 'all' disabling other checkboxes) */}
          <FormControl fullWidth>
            <InputLabel>Target Roles *</InputLabel>
            <Select
              multiple
              value={form.target_roles}
              onChange={(e) =>
                handleRoleSelectChange(e.target.value as string[])
              }
              input={<OutlinedInput label="Target Roles *" />}
              renderValue={(selected) => {
                const selectedArr = selected as string[];
                if (selectedArr.includes("all")) return "All Roles (Everyone)";
                return selectedArr
                  .map(
                    (r) =>
                      ALL_ROLES_CONFIG.find((ro) => ro.value === r)?.label || r
                  )
                  .join(", ");
              }}
            >
              {availableRoles.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  <Checkbox checked={form.target_roles.includes(r.value)} />
                  <ListItemText primary={r.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Searchable Target Users Dropdown (Disabled when 'All Roles' is selected) */}
          <Autocomplete
            multiple
            disabled={isAllRolesSelected}
            options={availableUsers}
            getOptionLabel={(option) => `${option.name} (${option.role})`}
            value={selectedUserObjects}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            onChange={(_, selectedOptions) => {
              if (selectedOptions.length === 0) {
                setForm((f) => ({ ...f, target_users: ["all"] }));
              } else {
                setForm((f) => ({
                  ...f,
                  target_users: selectedOptions.map((u) => u.id),
                }));
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Target Specific Users"
                placeholder={
                  isAllRolesSelected
                    ? "Broadcasting to everyone (All Roles selected)"
                    : selectedUserObjects.length > 0
                      ? "Search more users..."
                      : "Search specific users or leave empty for all in role"
                }
                helperText={
                  isAllRolesSelected
                    ? "Disabled because 'All Roles' is selected."
                    : "Leave empty to broadcast to all employees in the selected roles, or search and pick specific individuals."
                }
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={`${option.name} (${option.role})`}
                    size="small"
                    color="secondary"
                    {...tagProps}
                  />
                );
              })
            }
          />

          <Box display="flex" gap={2}>
            <TextField
              label="Start Date *"
              type="date"
              value={form.start_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, start_date: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date *"
              type="date"
              value={form.end_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, end_date: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: form.start_date }}
              fullWidth
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_active: e.target.checked }))
                }
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        maxWidth="xs"
      >
        <DialogTitle>Delete Announcement?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() =>
              deleteConfirmId && deleteMutation.mutate(deleteConfirmId)
            }
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ManageAnnouncementsSection;

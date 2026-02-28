import React, { useState } from "react";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  announcementService,
  Announcement,
  CreateAnnouncementPayload,
} from "../../services/announcementService";
import { useNotification } from "../../contexts/NotificationContext";
import { format } from "date-fns";

const ROLES = [
  { value: "all", label: "All Roles" },
  { value: "salesperson", label: "Salesperson" },
  { value: "manager", label: "Manager" },
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
  target_roles: ["salesperson"],
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
  is_active: true,
};

const ManageAnnouncementsSection: React.FC = () => {
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

  const announcements: Announcement[] = allData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: announcementService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["my-announcements"] });
      showNotification("Announcement created successfully", "success"); // ADD
      handleClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Failed to save announcement";
      setError(msg);
      showNotification(msg, "error"); // ADD
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
      showNotification("Announcement updated successfully", "success"); // ADD
      handleClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ?? "Failed to update announcement";
      setError(msg);
      showNotification(msg, "error"); // ADD
    },
  });

  const deleteMutation = useMutation({
    mutationFn: announcementService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-announcements"] });
      queryClient.invalidateQueries({ queryKey: ["my-announcements"] });
      showNotification("Announcement deleted successfully", "success"); // ADD
      setDeleteConfirmId(null);
    },
    onError: () => {
      showNotification("Failed to delete announcement", "error"); // ADD
    },
  });

  const handleOpen = (announcement?: Announcement) => {
    if (announcement) {
      setEditingId(announcement.id);
      setForm({
        title: announcement.title,
        description: announcement.description,
        type: announcement.type,
        target_roles: announcement.target_roles,
        start_date: announcement.start_date,
        end_date: announcement.end_date,
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
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
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
                <strong>Target Roles</strong>
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
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No announcements yet
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={a.type}
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
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {a.target_roles.map((r) => (
                        <Chip
                          key={r}
                          label={r}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {format(new Date(a.start_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(a.end_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={a.is_active ? "Active" : "Inactive"}
                      color={a.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
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
              ))
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
            gap: 2,
            pt: "16px !important",
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Title *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            fullWidth
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

          <FormControl fullWidth>
            <InputLabel>Target Roles *</InputLabel>
            <Select
              multiple
              value={form.target_roles}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  target_roles: e.target.value as string[],
                }))
              }
              input={<OutlinedInput label="Target Roles *" />}
              renderValue={(selected) => (selected as string[]).join(", ")}
            >
              {ROLES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  <Checkbox checked={form.target_roles.includes(r.value)} />
                  <ListItemText primary={r.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

      {/* Delete Confirm */}
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

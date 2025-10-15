import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { followupService } from "../../services/followupService";
import CustomTable from "../ui/CustomTable";
import FollowupForm from "./FollowupForm";
import ConfirmDialog from "../common/ConfirmDialog";
import { useNotification } from "../../contexts/NotificationContext";
import { Followup } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`followup-tabpanel-${index}`}
      aria-labelledby={`followup-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const FollowupManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState<Followup | null>(
    null
  );
  const { showNotification } = useNotification();
  const { user: currentUser } = useAuth();

  const filter =
    tabValue === 1
      ? { is_completed: true }
      : tabValue === 2
      ? { is_overdue: true }
      : { is_completed: false };

  const {
    data: followupsData,
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: ["followups", page, rowsPerPage, filter],
    queryFn: () =>
      followupService.getFollowups({
        page: page + 1,
        per_page: rowsPerPage,
        ...filter,
      }),
  });

  const { data: overdueFollowups } = useQuery<any>({
    queryKey: ["overdue-followups"],
    queryFn: () => followupService.getOverdue(),
    enabled: tabValue === 2,
  });

  const columns = [
    {
      id: "lead",
      label: "Lead",
      sortable: true,
      render: (value: any, row: Followup) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {row.lead?.company_name || "Unknown Company"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {row.lead?.contact_number} • {row.lead?.email}
          </Typography>
        </Box>
      ),
    },
    {
      id: "scheduled_at",
      label: "Scheduled For",
      sortable: true,
      render: (value: string) => (
        <Typography variant="body2">
          {new Date(value).toLocaleString()}
        </Typography>
      ),
    },
    {
      id: "salesperson",
      label: "Assigned To",
      sortable: true,
      render: (value: any, row: Followup) => (
        <Typography variant="body2">
          {row.salesperson?.name || "Unassigned"}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (value: boolean, row: Followup) => (
        <Chip
          label={
            row.is_completed
              ? "Completed"
              : row.is_overdue
              ? "Overdue"
              : "Scheduled"
          }
          color={
            row.is_completed ? "success" : row.is_overdue ? "error" : "primary"
          }
          size="small"
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      align: "right" as const,
      render: (_: any, row: Followup) => (
        <Box display="flex" gap={1} justifyContent="flex-end">
          {!row.is_completed && currentUser?.id === row.salesperson_id && (
            <Button
              size="small"
              color="success"
              onClick={() => handleCompleteClick(row)}
              variant="outlined"
            >
              Complete
            </Button>
          )}
          {currentUser?.id === row.salesperson_id && (
            <Button
              size="small"
              onClick={() => handleEdit(row)}
              variant="outlined"
            >
              Edit
            </Button>
          )}
          {(currentUser?.id === row.salesperson_id ||
            currentUser?.role === "admin") && (
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleEdit = (followup: Followup) => {
    setSelectedFollowup(followup);
    setOpenForm(true);
  };

  const handleCompleteClick = (followup: Followup) => {
    setSelectedFollowup(followup);
    setOpenCompleteDialog(true);
  };

  const handleDeleteClick = (followup: Followup) => {
    setSelectedFollowup(followup);
    setOpenDeleteDialog(true);
  };

  const handleCompleteConfirm = async (notes?: string) => {
    if (!selectedFollowup) return;

    try {
      await followupService.completeFollowup(selectedFollowup.id, notes);
      showNotification("Follow-up marked as completed", "success");
      refetch();
    } catch (error) {
      showNotification("Failed to complete follow-up", "error");
    } finally {
      setOpenCompleteDialog(false);
      setSelectedFollowup(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFollowup) return;

    try {
      await followupService.deleteFollowup(selectedFollowup.id);
      showNotification("Follow-up deleted successfully", "success");
      refetch();
    } catch (error) {
      showNotification("Failed to delete follow-up", "error");
    } finally {
      setOpenDeleteDialog(false);
      setSelectedFollowup(null);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedFollowup(null);
  };

  const handleFormSuccess = () => {
    refetch();
    handleFormClose();
    showNotification(
      selectedFollowup
        ? "Follow-up updated successfully"
        : "Follow-up created successfully",
      "success"
    );
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Follow-up Management</Typography>
        <Box display="flex" gap={2}>
          <IconButton onClick={() => refetch()} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            Schedule Follow-up
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Scheduled" />
          <Tab label="Completed" />
          <Tab label="Overdue" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <CustomTable
            columns={columns}
            data={followupsData?.data || []}
            loading={isLoading}
            pagination={{
              page,
              rowsPerPage,
              total: followupsData?.total || 0,
              onPageChange: setPage,
              onRowsPerPageChange: setRowsPerPage,
            }}
            emptyMessage="No scheduled follow-ups found"
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <CustomTable
            columns={columns}
            data={followupsData?.data || []}
            loading={isLoading}
            pagination={{
              page,
              rowsPerPage,
              total: followupsData?.total || 0,
              onPageChange: setPage,
              onRowsPerPageChange: setRowsPerPage,
            }}
            emptyMessage="No completed follow-ups found"
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <CustomTable
            columns={columns}
            data={overdueFollowups || []}
            loading={isLoading}
            pagination={undefined}
            emptyMessage="No overdue follow-ups found"
          />
        </TabPanel>
      </Paper>

      <FollowupForm
        open={openForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        followup={selectedFollowup}
      />

      <ConfirmDialog
        open={openCompleteDialog}
        title="Complete Follow-up"
        message={`Are you sure you want to mark this follow-up as completed?`}
        onConfirm={handleCompleteConfirm}
        onCancel={() => setOpenCompleteDialog(false)}
        severity="success"
        confirmText="Complete"
        showNotesField={true}
      />

      <ConfirmDialog
        open={openDeleteDialog}
        title="Delete Follow-up"
        message={`Are you sure you want to delete this follow-up?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setOpenDeleteDialog(false)}
        severity="error"
        confirmText="Delete"
      />
    </Box>
  );
};

export default FollowupManagement;

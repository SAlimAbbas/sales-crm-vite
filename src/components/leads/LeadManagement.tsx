import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Box, Typography, Button, Tabs, Tab, Paper } from "@mui/material";
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { leadService } from "../../services/leadService";
import { useNotification } from "../../contexts/NotificationContext";
import { Lead } from "../../types";
import { LEAD_STATUS } from "../../utils/constants";

import LeadFilters, { FilterState } from "./LeadFilters";
import LeadTable from "./LeadTable";
import LeadBulkActions from "./LeadBulkActions";
import LeadForm from "./LeadForm";
import BulkUpload from "./BulkUpload";
import ConfirmDialog from "../common/ConfirmDialog";
import { useAuth } from "../../contexts/AuthContext"; // or wherever your auth context is
import TaskForm from "../tasks/TaskForm";
import LeadNotesDialog from "./LeadNotesDialog";
import FollowupForm from "../followups/FollowupForm";
import { format } from "date-fns";

const LeadManagement: React.FC = () => {
  const { user } = useAuth();
  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [selectedLeadForTask, setSelectedLeadForTask] = useState<Lead | null>(
    null
  );

  const [openFollowupForm, setOpenFollowupForm] = useState(false);
  const [selectedLeadIdForFollowup, setSelectedLeadIdForFollowup] = useState<
    number | null
  >(null);

  const [notesDialog, setNotesDialog] = useState<{
    open: boolean;
    leadId: number | null;
    leadName: string;
  }>({
    open: false,
    leadId: null,
    leadName: "",
  });

  const handleViewNotes = (leadId: number) => {
    const lead = leadsData?.data?.find((l: any) => l.id === leadId);
    setNotesDialog({
      open: true,
      leadId: leadId,
      leadName: lead?.company_name || "",
    });
  };

  // Add handler
  const handleCreateTask = (lead: Lead) => {
    setSelectedLeadForTask(lead);
    setOpenTaskForm(true);
  };

  const handleScheduleFollowup = (leadId: number) => {
    setSelectedLeadIdForFollowup(leadId);
    setOpenFollowupForm(true);
  };

  const handleTaskFormClose = () => {
    setOpenTaskForm(false);
    setSelectedLeadForTask(null);
  };

  const handleTaskFormSuccess = () => {
    setOpenTaskForm(false);
    setSelectedLeadForTask(null);
    showNotification("Task created successfully", "success");
  };

  // Advanced filters state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    type: "",
    source: "",
    country: "",
    assignedTo: "",
    dateField: user?.role === "salesperson" ? "assigned_date" : "date", // ✅ Reset based on role
    dateFrom: null,
    dateTo: null,
    product: "",
    tags: "",
  });

  const { showNotification } = useNotification();

  // ✅ Memoize cleanParams to prevent unnecessary changes
  const cleanParams = useMemo(() => {
    const params = {
      page: page + 1,
      per_page: rowsPerPage,
      search: filters.search,
      status:
        statusFilter !== "all"
          ? statusFilter
          : filters.status.length > 0
          ? filters.status.join(",")
          : undefined,
      type: filters.type,
      source: filters.source,
      country: filters.country,
      assigned_to: filters.assignedTo,
      date_field: filters.dateField,
      date_from: filters.dateFrom
        ? format(filters.dateFrom, "yyyy-MM-dd")
        : undefined,
      date_to: filters.dateTo
        ? format(filters.dateTo, "yyyy-MM-dd")
        : undefined,
      product: filters.product,
      tags: filters.tags,
      sort: user?.role === "salesperson" ? "assigned_date" : sortField, // ✅ Override sort for salesperson
      order: sortDirection,
    };

    return Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== "" && value !== undefined && value !== null
      )
    );
  }, [
    page,
    rowsPerPage,
    filters,
    statusFilter,
    sortField,
    sortDirection,
    user?.role,
  ]);

  const {
    data: leadsData,
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: ["leads", cleanParams],
    queryFn: () => leadService.getLeads(cleanParams),
    placeholderData: (previousData: any) => previousData,
    staleTime: 0,
    refetchOnWindowFocus: false,
    // ✅ Add these to prevent unnecessary re-renders
    notifyOnChangeProps: ["data", "error"],
  });

  // Tab configuration
  const statusTabs = useMemo(() => {
    const allTabs = [
      { label: "All", value: "all" },
      { label: "Unassigned", value: LEAD_STATUS.UNASSIGNED },
      { label: "Follow-ups", value: LEAD_STATUS.FOLLOW_UP },
      { label: "Assigned", value: LEAD_STATUS.ASSIGNED },
      { label: "Prospects", value: LEAD_STATUS.PROSPECTS },
      { label: "Converted", value: LEAD_STATUS.CONVERTED },
    ];

    // ✅ Filter out Assigned and Unassigned for salesperson
    if (user?.role === "salesperson") {
      return allTabs.filter(
        (tab) =>
          tab.value !== LEAD_STATUS.ASSIGNED &&
          tab.value !== LEAD_STATUS.UNASSIGNED
      );
    }

    return allTabs;
  }, [user?.role]);

  // Handlers
  const handleStatusTabChange = (_: any, value: string) => {
    setStatusFilter(value);
    setPage(0);
    setSelectedLeadIds([]);
    // Clear status filter if using tabs
    setFilters((prev) => ({ ...prev, status: [] })); // ✅ Change from "" to []
  };

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(0);
    setSelectedLeadIds([]);
    // If status filter is applied via advanced filters, clear tab selection
    if (newFilters.status && statusFilter !== "all") {
      setStatusFilter("all");
    }
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters({
      search: "",
      status: [],
      type: "",
      source: "",
      country: "",
      assignedTo: "",
      dateField: user?.role === "salesperson" ? "assigned_date" : "date", // ✅ Reset based on role
      dateFrom: null,
      dateTo: null,
      product: "",
      tags: "",
    });
    setPage(0);
    setSelectedLeadIds([]);
  }, []);

  const handleSort = useCallback((field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
    setPage(0);
  }, []);

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setOpenForm(true);
  };

  const handleDeleteClick = (lead: Lead) => {
    setSelectedLead(lead);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLead) return;

    try {
      await leadService.deleteLead(selectedLead.id);
      showNotification("Lead deleted successfully", "success");
      refetch();
    } catch (error) {
      showNotification("Failed to delete lead", "error");
    } finally {
      setOpenDeleteDialog(false);
      setSelectedLead(null);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedLead(null);
  };

  const handleFormSuccess = () => {
    refetch();
    handleFormClose();
    showNotification(
      selectedLead ? "Lead updated successfully" : "Lead created successfully",
      "success"
    );
  };

  const handleUploadSuccess = () => {
    // setOpenUpload(false);
    refetch();
    showNotification("Leads uploaded successfully", "success");
  };

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedLeadIds(selectedIds);
  };

  const handleClearSelection = () => {
    setSelectedLeadIds([]);
  };

  const handleBulkRefresh = () => {
    refetch();
    setSelectedLeadIds([]);
  };

  const handleExport = async () => {
    try {
      await leadService.exportLeads(cleanParams);
      showNotification("Export started successfully", "success");
    } catch (error) {
      showNotification("Export failed", "error");
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filters, statusFilter]);

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Lead Management</Typography>
        <Box display="flex" gap={1}>
          {(user?.role === "admin" || user?.role === "manager") && (
            <>
              <Button
                variant="text"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={isLoading || selectedLeadIds.length > 0}
              >
                Export{" "}
                {selectedLeadIds.length > 0 && "(Disabled - Use bulk action)"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setOpenUpload(true)}
              >
                Bulk Upload
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            Add Lead
          </Button>
        </Box>
      </Box>

      {/* Status Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={statusFilter}
          onChange={handleStatusTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {statusTabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Paper>

      {/* Advanced Filters */}
      <LeadFilters
        currentUser={user}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
        loading={isLoading}
      />

      {/* Bulk Actions */}
      <LeadBulkActions
        currentUser={user}
        selectedIds={selectedLeadIds}
        onClearSelection={handleClearSelection}
        onRefresh={handleBulkRefresh}
        disabled={isLoading}
      />

      {/* Data Table */}
      <Paper sx={{ overflow: "hidden" }}>
        <LeadTable
          currentUser={user}
          leads={leadsData?.data || []}
          loading={isLoading}
          total={leadsData?.total || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onSelectionChange={handleSelectionChange}
          selectedIds={selectedLeadIds}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          enableMultiSelect={true}
          onRefresh={refetch}
          onCreateTask={handleCreateTask}
          onScheduleFollowup={handleScheduleFollowup}
          onViewNotes={handleViewNotes}
          rowsPerPageOptions={[50, 75, 100, 500]}
        />
      </Paper>

      {/* Dialogs */}
      <LeadForm
        open={openForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        lead={selectedLead}
      />

      <BulkUpload
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        onSuccess={handleUploadSuccess}
      />

      <ConfirmDialog
        open={openDeleteDialog}
        title="Delete Lead"
        message={`Are you sure you want to delete lead "${selectedLead?.company_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setOpenDeleteDialog(false)}
        severity="error"
        confirmText="Delete"
      />

      {/* Task Form Modal */}
      <TaskForm
        open={openTaskForm}
        onClose={handleTaskFormClose}
        onSuccess={handleTaskFormSuccess}
        task={null}
        preSelectedLeadId={selectedLeadForTask?.id} // ✅ Pass the lead ID
      />

      {/* Follow-up Form Modal */}
      <FollowupForm
        open={openFollowupForm}
        onClose={() => {
          setOpenFollowupForm(false);
          setSelectedLeadIdForFollowup(null);
        }}
        onSuccess={() => {
          setOpenFollowupForm(false);
          setSelectedLeadIdForFollowup(null);
          showNotification("Follow-up scheduled successfully", "success");
        }}
        preSelectedLeadId={selectedLeadIdForFollowup}
      />

      <LeadNotesDialog
        open={notesDialog.open}
        onClose={() =>
          setNotesDialog({ open: false, leadId: null, leadName: "" })
        }
        leadId={notesDialog.leadId || 0}
        leadName={notesDialog.leadName}
      />
    </Box>
  );
};

export default LeadManagement;

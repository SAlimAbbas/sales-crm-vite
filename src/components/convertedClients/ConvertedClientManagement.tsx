import React, { useState, useCallback, useMemo } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Add as AddIcon, Download as DownloadIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { convertedClientService } from "../../services/convertedClientService";
import { useNotification } from "../../contexts/NotificationContext";
import { ConvertedClient } from "../../types/convertedClient";
import { useAuth } from "../../contexts/AuthContext";

import ConvertedClientFilters, { FilterState } from "./ConvertedClientFilters";
import ConvertedClientTable from "./ConvertedClientTable";
import ConvertedClientForm from "./ConvertedClientForm";
import ConfirmDialog from "../common/ConfirmDialog";
import { format } from "date-fns";

const ConvertedClientManagement: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ConvertedClient | null>(
    null
  );

  // Advanced filters state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    client_type: "",
    plan_type: "",
    payment_status: "",
    dateFrom: null,
    dateTo: null,
  });

  const { showNotification } = useNotification();

  // Memoize cleanParams
  const cleanParams = useMemo(() => {
    const params = {
      page: page + 1,
      per_page: rowsPerPage,
      search: filters.search,
      client_type: filters.client_type,
      plan_type: filters.plan_type,
      payment_status: filters.payment_status,
      date_from: filters.dateFrom
        ? format(filters.dateFrom, "yyyy-MM-dd")
        : undefined,
      date_to: filters.dateTo
        ? format(filters.dateTo, "yyyy-MM-dd")
        : undefined,
      sort: sortField,
      order: sortDirection,
    };

    return Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== "" && value !== undefined && value !== null
      )
    );
  }, [page, rowsPerPage, filters, sortField, sortDirection]);

  const {
    data: clientsData,
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: ["converted-clients", cleanParams],
    queryFn: () => convertedClientService.getConvertedClients(cleanParams),
    placeholderData: (previousData: any) => previousData,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Handlers
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(0);
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters({
      search: "",
      client_type: "",
      plan_type: "",
      payment_status: "",
      dateFrom: null,
      dateTo: null,
    });
    setPage(0);
  }, []);

  const handleSort = useCallback((field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
    setPage(0);
  }, []);

  const handleEdit = (client: ConvertedClient) => {
    setSelectedClient(client);
    setOpenForm(true);
  };

  const handleDeleteClick = (client: ConvertedClient) => {
    setSelectedClient(client);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClient) return;

    try {
      await convertedClientService.deleteConvertedClient(selectedClient.id);
      showNotification("Converted client deleted successfully", "success");
      refetch();
    } catch (error) {
      showNotification("Failed to delete converted client", "error");
    } finally {
      setOpenDeleteDialog(false);
      setSelectedClient(null);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedClient(null);
  };

  const handleFormSuccess = () => {
    refetch();
    handleFormClose();
    showNotification(
      selectedClient
        ? "Converted client updated successfully"
        : "Converted client created successfully",
      "success"
    );
  };

  const handleExport = async () => {
    try {
      await convertedClientService.exportConvertedClients(cleanParams);
      showNotification("Export started successfully", "success");
    } catch (error) {
      showNotification("Export failed", "error");
    }
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
        <Typography variant="h4">Converted Clients Database</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="text"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={isLoading}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            Add Client
          </Button>
        </Box>
      </Box>

      {/* Advanced Filters */}
      <ConvertedClientFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
        loading={isLoading}
      />

      {/* Data Table */}
      <Paper sx={{ overflow: "hidden" }}>
        <ConvertedClientTable
          clients={clientsData?.data || []}
          loading={isLoading}
          total={clientsData?.total || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          onRefresh={refetch}
          rowsPerPageOptions={[50, 75, 100]}
          userRole={user?.role || "user"}
        />
      </Paper>

      {/* Dialogs */}
      <ConvertedClientForm
        open={openForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        client={selectedClient}
      />

      <ConfirmDialog
        open={openDeleteDialog}
        title="Delete Converted Client"
        message={`Are you sure you want to delete "${selectedClient?.company_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setOpenDeleteDialog(false)}
        severity="error"
        confirmText="Delete"
      />
    </Box>
  );
};

export default ConvertedClientManagement;

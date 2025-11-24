import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  LinearProgress,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { ConvertedClient } from "../../types/convertedClient";
import { format } from "date-fns";

interface ConvertedClientTableProps {
  clients: ConvertedClient[];
  loading: boolean;
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (client: ConvertedClient) => void;
  onDelete: (client: ConvertedClient) => void;
  onSort: (field: string, direction: "asc" | "desc") => void;
  sortField: string;
  sortDirection: "asc" | "desc";
  onRefresh: () => void;
  rowsPerPageOptions?: number[];
  userRole: string;
}

const ConvertedClientTable: React.FC<ConvertedClientTableProps> = ({
  clients,
  loading,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onSort,
  sortField,
  sortDirection,
  onRefresh,
  rowsPerPageOptions = [50, 75, 100],
  userRole,
}) => {
  const [planFeaturesDialog, setPlanFeaturesDialog] = useState<{
    open: boolean;
    features: string;
    companyName: string;
  }>({
    open: false,
    features: "",
    companyName: "",
  });
  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortDirection === "asc";
    onSort(field, isAsc ? "desc" : "asc");
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "fully_paid":
        return "success";
      case "partially_paid":
        return "warning";
      case "unpaid":
        return "error";
      default:
        return "default";
    }
  };
  const getPaymentStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const sortableColumns = [
    "company_name",
    "client_name",
    "plan_type",
    "plan_amount",
    "paid_amount",
    "pending_amount",
    "paid_amount_date",
    "created_at",
  ];

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        borderBottom={1}
        borderColor="divider"
      >
        <Typography variant="h6">
          Total Clients: {total}
          {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
        </Typography>
        <IconButton onClick={onRefresh} disabled={loading} size="small">
          <RefreshIcon />
        </IconButton>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {sortableColumns.includes("company_name") ? (
                  <TableSortLabel
                    active={sortField === "company_name"}
                    direction={
                      sortField === "company_name" ? sortDirection : "asc"
                    }
                    onClick={() => handleSort("company_name")}
                  >
                    Company
                  </TableSortLabel>
                ) : (
                  "Company"
                )}
              </TableCell>
              <TableCell>
                {sortableColumns.includes("client_name") ? (
                  <TableSortLabel
                    active={sortField === "client_name"}
                    direction={
                      sortField === "client_name" ? sortDirection : "asc"
                    }
                    onClick={() => handleSort("client_name")}
                  >
                    Client Name
                  </TableSortLabel>
                ) : (
                  "Client Name"
                )}
              </TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>
                {sortableColumns.includes("plan_type") ? (
                  <TableSortLabel
                    active={sortField === "plan_type"}
                    direction={
                      sortField === "plan_type" ? sortDirection : "asc"
                    }
                    onClick={() => handleSort("plan_type")}
                  >
                    Plan
                  </TableSortLabel>
                ) : (
                  "Plan"
                )}
              </TableCell>
              <TableCell align="right">
                {sortableColumns.includes("plan_amount") ? (
                  <TableSortLabel
                    active={sortField === "plan_amount"}
                    direction={
                      sortField === "plan_amount" ? sortDirection : "asc"
                    }
                    onClick={() => handleSort("plan_amount")}
                  >
                    Plan Amount
                  </TableSortLabel>
                ) : (
                  "Plan Amount"
                )}
              </TableCell>
              <TableCell align="right">
                {sortableColumns.includes("paid_amount") ? (
                  <TableSortLabel
                    active={sortField === "paid_amount"}
                    direction={
                      sortField === "paid_amount" ? sortDirection : "asc"
                    }
                    onClick={() => handleSort("paid_amount")}
                  >
                    Paid
                  </TableSortLabel>
                ) : (
                  "Paid"
                )}
              </TableCell>
              <TableCell align="right">
                {sortableColumns.includes("pending_amount") ? (
                  <TableSortLabel
                    active={sortField === "pending_amount"}
                    direction={
                      sortField === "pending_amount" ? sortDirection : "asc"
                    }
                    onClick={() => handleSort("pending_amount")}
                  >
                    Pending
                  </TableSortLabel>
                ) : (
                  "Pending"
                )}
              </TableCell>
              <TableCell>Payment Progress</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>
                {sortableColumns.includes("paid_amount_date") ? (
                  <TableSortLabel
                    active={sortField === "paid_amount_date"}
                    direction={
                      sortField === "paid_amount_date" ? sortDirection : "asc"
                    }
                    onClick={() => handleSort("paid_amount_date")}
                  >
                    Paid Date
                  </TableSortLabel>
                ) : (
                  "Paid Date"
                )}
              </TableCell>
              <TableCell>Plan Features</TableCell>

              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Loading clients...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="textSecondary">
                    No converted clients found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {client.company_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{client.client_name}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{client.number}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={client.client_type.toUpperCase()}
                      size="small"
                      color={
                        client.client_type === "domestic"
                          ? "primary"
                          : "secondary"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={client.plan_type.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(client.plan_amount, client.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="success.main">
                      {formatCurrency(client.paid_amount, client.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color={
                        client.pending_amount > 0
                          ? "error.main"
                          : "text.secondary"
                      }
                    >
                      {formatCurrency(client.pending_amount, client.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 150 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={client.payment_percentage}
                          sx={{ flex: 1, height: 8, borderRadius: 1 }}
                          color={
                            client.payment_percentage === 100
                              ? "success"
                              : client.payment_percentage > 0
                              ? "warning"
                              : "error"
                          }
                        />
                        <Typography variant="caption" fontWeight={500}>
                          {client.payment_percentage}%
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPaymentStatusLabel(client.payment_status)}
                      size="small"
                      color={
                        getPaymentStatusColor(client.payment_status) as any
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {client.paid_amount_date
                      ? format(
                          new Date(client.paid_amount_date),
                          "MMM dd, yyyy"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {client.plan_features ? (
                      <Box>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {client.plan_features.substring(0, 30)}
                          {client.plan_features.length > 30 && "..."}
                        </Typography>
                        {client.plan_features.length > 30 && (
                          <Button
                            size="small"
                            onClick={() =>
                              setPlanFeaturesDialog({
                                open: true,
                                features: client.plan_features || "",
                                companyName: client.company_name,
                              })
                            }
                          >
                            View Full
                          </Button>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={0.5} justifyContent="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(client)}
                          disabled={loading}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {userRole === "admin" && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(client)}
                            disabled={loading}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) =>
          onRowsPerPageChange(parseInt(e.target.value, 10))
        }
        rowsPerPageOptions={rowsPerPageOptions}
      />

      {/* Plan Features Dialog */}
      <Dialog
        open={planFeaturesDialog.open}
        onClose={() =>
          setPlanFeaturesDialog({ open: false, features: "", companyName: "" })
        }
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Plan Features - {planFeaturesDialog.companyName}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {planFeaturesDialog.features}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setPlanFeaturesDialog({
                open: false,
                features: "",
                companyName: "",
              })
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConvertedClientTable;

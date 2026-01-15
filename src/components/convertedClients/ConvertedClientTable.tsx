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
  Grid,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
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

  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    client: ConvertedClient | null;
  }>({
    open: false,
    client: null,
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
                <TableSortLabel
                  active={sortField === "company_name"}
                  direction={
                    sortField === "company_name" ? sortDirection : "asc"
                  }
                  onClick={() => handleSort("company_name")}
                >
                  Company
                </TableSortLabel>
              </TableCell>
              <TableCell>Client Name</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "plan_type"}
                  direction={sortField === "plan_type" ? sortDirection : "asc"}
                  onClick={() => handleSort("plan_type")}
                >
                  Plan
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "paid_amount_date"}
                  direction={
                    sortField === "paid_amount_date" ? sortDirection : "asc"
                  }
                  onClick={() => handleSort("paid_amount_date")}
                >
                  Paid Date
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Total Amount Paid</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Loading clients...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
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
                  <TableCell>{client.number}</TableCell>
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
                    <Box>
                      <Chip
                        label={client.plan_type.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                      {client.upgrade_plan_type && (
                        <Chip
                          label={`→ ${client.upgrade_plan_type.toUpperCase()}`}
                          size="small"
                          color="info"
                          sx={{ ml: 0.5 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {client.paid_amount_date
                      ? format(
                          new Date(client.paid_amount_date),
                          "MMM dd, yyyy"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell align="right">
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="success.main"
                      >
                        {formatCurrency(
                          client.total_amount_paid,
                          client.currency
                        )}
                      </Typography>
                      {client.gst_on_paid &&
                      client.client_type === "domestic" &&
                      client.gst_amount_paid > 0 ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          + GST (Paid):{" "}
                          {formatCurrency(
                            client.gst_amount_paid,
                            client.currency
                          )}
                        </Typography>
                      ) : (
                        ""
                      )}
                      {client.gst_on_upgrade &&
                      client.client_type === "domestic" &&
                      client.gst_amount_upgrade > 0 ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          + GST (Upgrade):{" "}
                          {formatCurrency(
                            client.gst_amount_upgrade,
                            client.currency
                          )}
                        </Typography>
                      ) : (
                        ""
                      )}
                      {(client.gst_on_paid && client.gst_amount_paid > 0) ||
                      (client.gst_on_upgrade &&
                        client.gst_amount_upgrade > 0) ? (
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="primary.main"
                          display="block"
                        >
                          Total:{" "}
                          {formatCurrency(
                            client.total_with_gst,
                            client.currency
                          )}
                        </Typography>
                      ) : (
                        ""
                      )}
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
                  <TableCell align="center">
                    <Box display="flex" gap={0.5} justifyContent="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() =>
                            setDetailsDialog({ open: true, client })
                          }
                          disabled={loading}
                          color="info"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(client)}
                          disabled={loading}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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

      {/* Client Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false, client: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Client Details - {detailsDialog.client?.company_name}
        </DialogTitle>
        <DialogContent dividers>
          {detailsDialog.client && (
            <Box>
              {/* Total Amount Paid - Highlighted */}
              <Box
                sx={{
                  bgcolor: "success.light",
                  p: 2,
                  borderRadius: 1,
                  mb: 3,
                  textAlign: "center",
                }}
              >
                <Typography variant="h5" fontWeight={700} color="success.dark">
                  Total Amount Paid:{" "}
                  {formatCurrency(
                    detailsDialog.client.total_amount_paid,
                    detailsDialog.client.currency
                  )}
                </Typography>
                {detailsDialog.client.gst_on_paid &&
                  detailsDialog.client.client_type === "domestic" &&
                  detailsDialog.client.gst_amount_paid > 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      GST on Paid Amount (18%):{" "}
                      {formatCurrency(
                        detailsDialog.client.gst_amount_paid,
                        detailsDialog.client.currency
                      )}
                    </Typography>
                  )}
                {detailsDialog.client.gst_on_upgrade &&
                  detailsDialog.client.client_type === "domestic" &&
                  detailsDialog.client.gst_amount_upgrade > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      GST on Upgrade Amount (18%):{" "}
                      {formatCurrency(
                        detailsDialog.client.gst_amount_upgrade,
                        detailsDialog.client.currency
                      )}
                    </Typography>
                  )}
                {((detailsDialog.client.gst_on_paid &&
                  detailsDialog.client.gst_amount_paid > 0) ||
                  (detailsDialog.client.gst_on_upgrade &&
                    detailsDialog.client.gst_amount_upgrade > 0)) && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color="background.default"
                    >
                      Total with GST:{" "}
                      {formatCurrency(
                        detailsDialog.client.total_with_gst,
                        detailsDialog.client.currency
                      )}
                    </Typography>
                  </>
                )}
                <Typography variant="caption" color="text.secondary">
                  (Paid + Upgrade Amount
                  {(detailsDialog.client.gst_on_paid &&
                    detailsDialog.client.gst_amount_paid > 0) ||
                  (detailsDialog.client.gst_on_upgrade &&
                    detailsDialog.client.gst_amount_upgrade > 0)
                    ? " + GST"
                    : ""}
                  )
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {/* Company Information */}
                <Grid size={12}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Company Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Company Name
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.company_name}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Client Name
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.client_name}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Contact Number
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.number}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Company Email
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.company_email || "-"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    GST Number
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.company_gst_number || "-"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    GST Issued
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.gst_issued || "-"}
                  </Typography>
                </Grid>

                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary">
                    Company Address
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.company_address || "-"}
                  </Typography>
                </Grid>

                {/* Plan Information */}
                <Grid size={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Plan Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Client Type
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    <Chip
                      label={detailsDialog.client.client_type.toUpperCase()}
                      size="small"
                      color={
                        detailsDialog.client.client_type === "domestic"
                          ? "primary"
                          : "secondary"
                      }
                    />
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Plan Type
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    <Chip
                      label={detailsDialog.client.plan_type.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                    {detailsDialog.client.upgrade_plan_type && (
                      <Chip
                        label={`→ ${detailsDialog.client.upgrade_plan_type.toUpperCase()}`}
                        size="small"
                        color="info"
                        sx={{ ml: 0.5 }}
                      />
                    )}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Currency
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.currency}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Executive Name
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.executive?.name || "-"}
                  </Typography>
                </Grid>

                {/* Payment Information */}
                <Grid size={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Payment Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                {/* Highlighted Plan Amount and Upgrade Amount */}
                <Grid size={12}>
                  <Box
                    sx={{
                      bgcolor: "info.light",
                      p: 2,
                      borderRadius: 1,
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                    }}
                  >
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary">
                        Plan Amount (Pitched)
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="info.dark"
                      >
                        {formatCurrency(
                          detailsDialog.client.plan_amount,
                          detailsDialog.client.currency
                        )}
                      </Typography>
                    </Box>
                    {detailsDialog.client.upgrade_payment_amount > 0 && (
                      <>
                        <Divider orientation="vertical" flexItem />
                        <Box textAlign="center">
                          <Typography variant="caption" color="text.secondary">
                            Upgrade Amount
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="warning.dark"
                          >
                            {formatCurrency(
                              detailsDialog.client.upgrade_payment_amount,
                              detailsDialog.client.currency
                            )}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    GST on Paid Amount (18%)
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    <Chip
                      label={
                        detailsDialog.client.gst_on_paid &&
                        detailsDialog.client.client_type === "domestic"
                          ? "Yes"
                          : "No"
                      }
                      size="small"
                      color={
                        detailsDialog.client.gst_on_paid &&
                        detailsDialog.client.client_type === "domestic"
                          ? "success"
                          : "default"
                      }
                    />
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    GST on Upgrade Amount (18%)
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    <Chip
                      label={
                        detailsDialog.client.gst_on_upgrade &&
                        detailsDialog.client.client_type === "domestic"
                          ? "Yes"
                          : "No"
                      }
                      size="small"
                      color={
                        detailsDialog.client.gst_on_upgrade &&
                        detailsDialog.client.client_type === "domestic"
                          ? "success"
                          : "default"
                      }
                    />
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Paid Amount
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="success.main"
                  >
                    {formatCurrency(
                      detailsDialog.client.paid_amount,
                      detailsDialog.client.currency
                    )}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Paid Amount Date
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.paid_amount_date
                      ? format(
                          new Date(detailsDialog.client.paid_amount_date),
                          "MMM dd, yyyy"
                        )
                      : "-"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Pending Amount
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="error.main"
                  >
                    {formatCurrency(
                      detailsDialog.client.pending_amount,
                      detailsDialog.client.currency
                    )}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Pending Amount Condition
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.pending_amount_condition || "-"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Pending Amount Date
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.pending_amount_date
                      ? format(
                          new Date(detailsDialog.client.pending_amount_date),
                          "MMM dd, yyyy"
                        )
                      : "-"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Upgrade Payment Amount
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="info.main"
                  >
                    {formatCurrency(
                      detailsDialog.client.upgrade_payment_amount,
                      detailsDialog.client.currency
                    )}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Upgrade Payment Date
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.upgrade_payment_date
                      ? format(
                          new Date(detailsDialog.client.upgrade_payment_date),
                          "MMM dd, yyyy"
                        )
                      : "-"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Payment Status
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    <Chip
                      label={getPaymentStatusLabel(
                        detailsDialog.client.payment_status
                      )}
                      size="small"
                      color={
                        getPaymentStatusColor(
                          detailsDialog.client.payment_status
                        ) as any
                      }
                    />
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Payment Progress
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress
                        variant="determinate"
                        value={detailsDialog.client.payment_percentage}
                        sx={{ flex: 1, height: 8, borderRadius: 1 }}
                        color={
                          detailsDialog.client.payment_percentage === 100
                            ? "success"
                            : detailsDialog.client.payment_percentage > 0
                            ? "warning"
                            : "error"
                        }
                      />
                      <Typography variant="caption" fontWeight={500}>
                        {detailsDialog.client.payment_percentage}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Plan Features */}
                {detailsDialog.client.plan_features && (
                  <>
                    <Grid size={12} sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Plan Features
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid size={12}>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-wrap",
                          bgcolor: "grey.50",
                          p: 2,
                          borderRadius: 1,
                        }}
                      >
                        {detailsDialog.client.plan_features}
                      </Typography>
                    </Grid>
                  </>
                )}

                {/* Additional Information */}
                <Grid size={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detailsDialog.client.created_by?.name || "-"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {format(
                      new Date(detailsDialog.client.created_at),
                      "MMM dd, yyyy HH:mm"
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setDetailsDialog({ open: false, client: null })}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConvertedClientTable;

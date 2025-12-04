import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  Paper,
  TablePagination,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Badge,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignIcon,
  LocalOffer as LocalOfferIcon,
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  Note as NoteIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { Lead } from "../../types";
import { getStatusColor } from "../../utils/helpers";
import { LEAD_STATUS } from "../../utils/constants";
import { leadService } from "../../services/leadService";
import { useNotification } from "../../contexts/NotificationContext";
import LoadingSkeleton from "../common/LoadingSkeleton";
import { theme } from "../../styles/theme";

interface LeadTableProps {
  leads: Lead[];
  loading: boolean;
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onSelectionChange: (selectedIds: number[]) => void;
  selectedIds: number[];
  onSort: (field: string, direction: "asc" | "desc") => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  enableMultiSelect?: boolean;
  onRefresh?: () => void;
  onCreateTask?: (lead: Lead) => void;
  onScheduleFollowup?: (leadId: number) => void;
  onViewNotes?: (leadId: number) => void;
  currentUser?: any;
  rowsPerPageOptions?: number[];
}

// type Order = "asc" | "desc";

interface HeadCell {
  id: keyof Lead | "actions";
  label: string;
  sortable: boolean;
  align?: "left" | "right" | "center";
  minWidth?: number;
}

const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  loading,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onSelectionChange,
  selectedIds,
  onSort,
  sortField,
  sortDirection,
  enableMultiSelect = true,
  onRefresh,
  onCreateTask,
  onViewNotes,
  onScheduleFollowup,
  currentUser,
  rowsPerPageOptions = [50, 75, 100, 500],
}) => {
  const isLeadExecutive = currentUser?.role === "lead_executive";

  const headCells: HeadCell[] = [
    { id: "company_name", label: "Company", sortable: true, minWidth: 300 },
    { id: "owner_name", label: "Name", sortable: true, minWidth: 120 },
    { id: "product", label: "Product", sortable: true, minWidth: 120 },
    { id: "contact_number", label: "Phone", sortable: false, minWidth: 140 },
    { id: "source", label: "Source", sortable: true, minWidth: 140 },
    { id: "country", label: "Country", sortable: true, minWidth: 80 },
    { id: "type", label: "Type", sortable: true, minWidth: 140 },
    { id: "status", label: "Status", sortable: true, minWidth: 160 },

    // ✅ Show Assigned To only for admin/manager, hide date fields for manager
    ...(currentUser?.role !== "salesperson"
      ? currentUser?.role === "manager"
        ? [
            {
              id: "assigned_to" as keyof Lead,
              label: "Assigned To",
              sortable: false,
              minWidth: 140,
            },
          ]
        : [
            {
              id: "assigned_to" as keyof Lead,
              label: "Assigned To",
              sortable: false,
              minWidth: 100,
            },
            {
              id: "lead_executive_id" as keyof Lead, // ✅ NEW FIELD
              label: "Lead Executive",
              sortable: false,
              minWidth: 140,
            },
            {
              id: "date" as keyof Lead,
              label: "Date",
              sortable: true,
              minWidth: 120,
            },
            {
              id: "created_at" as keyof Lead,
              label: "Created On",
              sortable: true,
              minWidth: 140,
            },
          ]
      : []),
    // ✅ Show Assigned On for everyone
    {
      id: "assigned_date" as keyof Lead,
      label: "Assigned On",
      sortable: true,
      minWidth: 140,
    },

    {
      id: "actions",
      label: "Actions",
      sortable: false,
      align: "right" as const,
      minWidth: 100,
    },
  ];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [selectedLeadForTag, setSelectedLeadForTag] = useState<Lead | null>(
    null
  );

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    company_name: 300,
    owner_name: 120,
    product: 120,
    contact_number: 140,
    source: 140,
    country: 80,
    type: 140,
    status: 160,
    assigned_to: 140,
    lead_executive_id: 140,
    date: 120,
    created_at: 100,
    assigned_date: 80,
    actions: 80,
  });

  const [resizing, setResizing] = useState<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Status update dialog state
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    lead: Lead | null;
    newStatus: string;
    loading: boolean;
  }>({
    open: false,
    lead: null,
    newStatus: "",
    loading: false,
  });

  const { showNotification } = useNotification();

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
    { value: LEAD_STATUS.NOT_INTERESTED, label: "Not Interested" }, // ✅ Changed
    { value: LEAD_STATUS.WHATSAPPED, label: "WhatsApped" },
    { value: LEAD_STATUS.INVALID_CONTACT, label: "Invalid Contact" },
    { value: LEAD_STATUS.NOT_ON_WHATSAPP, label: "Not on WhatsApp" },
    { value: LEAD_STATUS.BUSY, label: "Busy" }, // ✅ Add
    { value: LEAD_STATUS.CALL_DISCONNECTED, label: "Call Disconnected" }, // ✅ Add
    { value: LEAD_STATUS.NO_RESPONSE, label: "No Response" }, // ✅ Add
    { value: LEAD_STATUS.SWITCHED_OFF, label: "Switched Off" }, // ✅ Add
    { value: LEAD_STATUS.NOT_REACHABLE, label: "Not Reachable" }, // ✅ Add
  ];

  const handleMouseDown = (
    e: React.MouseEvent,
    columnId: string,
    currentWidth: number
  ) => {
    e.preventDefault();
    setResizing({
      columnId,
      startX: e.clientX,
      startWidth: currentWidth,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing) return;

    const diff = e.clientX - resizing.startX;
    const newWidth = Math.max(50, resizing.startWidth + diff); // Min width 50px

    setColumnWidths((prev) => ({
      ...prev,
      [resizing.columnId]: newWidth,
    }));
  };

  const handleMouseUp = () => {
    setResizing(null);
  };

  // Add useEffect for mouse events
  React.useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizing]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelectedIds = leads.map((lead) => lead.id);
      onSelectionChange(newSelectedIds);
    } else {
      onSelectionChange([]);
    }
  };

  const canEditLead = (lead: Lead) => {
    if (!currentUser) return false;

    // Admin can edit any lead
    if (currentUser.role === "admin") return true;

    if (currentUser.role === "lead_executive") {
      return !lead.assigned_to; // Can edit only if not assigned
    }

    // Salesperson and Manager can only edit leads they created
    if (currentUser.role === "salesperson" || currentUser.role === "manager") {
      // ✅ Fix: Access the id from the created_by object
      const createdById =
        typeof lead.created_by === "object"
          ? lead.created_by?.id
          : lead.created_by;

      return createdById === currentUser.id;
    }

    return false;
  };

  const canDeleteLead = (lead: Lead) => {
    if (!currentUser) return false;

    // Only admin can delete OR creator can delete their own leads
    if (currentUser.role === "admin") return true;

    // const createdById =
    //   typeof lead.created_by === "object"
    //     ? lead.created_by?.id
    //     : lead.created_by;

    // return createdById === currentUser.id;
  };

  const handleClick = (
    event: React.MouseEvent<unknown>,
    id: number,
    index: number
  ) => {
    if (!enableMultiSelect) return;

    const selectedIndex = selectedIds.indexOf(id);
    let newSelected: number[] = [];

    if (event.shiftKey && lastSelectedIndex !== -1) {
      // Shift+Click: Select range
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = leads.slice(start, end + 1).map((lead) => lead.id);

      // Merge with existing selection
      newSelected = Array.from(new Set([...selectedIds, ...rangeIds]));
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl+Click: Toggle individual item
      if (selectedIndex === -1) {
        newSelected = [...selectedIds, id];
      } else {
        newSelected = selectedIds.filter((selectedId) => selectedId !== id);
      }
      setLastSelectedIndex(index);
    } else {
      // Regular click: Toggle individual item
      if (selectedIndex === -1) {
        newSelected = [...selectedIds, id];
      } else {
        newSelected = selectedIds.filter((selectedId) => selectedId !== id);
      }
      setLastSelectedIndex(index);
    }

    onSelectionChange(newSelected);
  };

  const handleRequestSort = (property: keyof Lead) => {
    const isAsc = sortField === property && sortDirection === "asc";
    onSort(property as string, isAsc ? "desc" : "asc");
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    lead: Lead
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLead(null);
  };

  const handleStatusClick = (event: React.MouseEvent, lead: Lead) => {
    event.stopPropagation();
    setStatusDialog({
      open: true,
      lead: lead,
      newStatus: lead.status,
      loading: false,
    });
  };

  const handleStatusUpdate = async () => {
    if (!statusDialog.lead || !statusDialog.newStatus) return;

    setStatusDialog({ ...statusDialog, loading: true });

    try {
      await leadService.updateLead(statusDialog.lead.id, {
        status: statusDialog.newStatus,
      } as any);

      showNotification("Status updated successfully", "success");
      if (onRefresh) onRefresh();
      setStatusDialog({
        open: false,
        lead: null,
        newStatus: "",
        loading: false,
      });
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Failed to update status",
        "error"
      );
      setStatusDialog({ ...statusDialog, loading: false });
    }
  };

  const handleStatusDialogClose = () => {
    if (!statusDialog.loading) {
      setStatusDialog({
        open: false,
        lead: null,
        newStatus: "",
        loading: false,
      });
    }
  };

  const isSelected = (id: number) => selectedIds.indexOf(id) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - total) : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeChip = (type: string) => {
    return (
      <Chip
        label={type === "domestic" ? "Domestic" : "International"}
        size="small"
        color={type === "domestic" ? "success" : "primary"}
        variant="outlined"
      />
    );
  };

  const handleTagClick = (lead: Lead) => {
    setSelectedLeadForTag(lead);
    setTagDialogOpen(true);
  };

  const handleTagUpdate = async (tag: string) => {
    if (!selectedLeadForTag) return;

    try {
      await leadService.updateTag(selectedLeadForTag.id, tag);
      showNotification?.("Tag updated successfully", "success");
      onRefresh?.();
    } catch (error) {
      showNotification?.("Failed to update tag", "error");
    } finally {
      setTagDialogOpen(false);
      setSelectedLeadForTag(null);
    }
  };

  if (loading) {
    return <LoadingSkeleton variant="leads" message="Loading leads..." />;
  }

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        cursor: resizing ? "col-resize" : "default",
      }}
    >
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-labelledby="tableTitle" size="medium">
          <TableHead>
            <TableRow>
              {enableMultiSelect && !isLeadExecutive && (
                <TableCell padding="checkbox">
                  <Tooltip title="Hold Shift to select range, Ctrl/Cmd to multi-select">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < leads.length
                      }
                      checked={
                        leads.length > 0 && selectedIds.length === leads.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{
                        "aria-label": "select all leads",
                      }}
                    />
                  </Tooltip>
                </TableCell>
              )}
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align || "left"}
                  padding="normal"
                  sortDirection={
                    sortField === headCell.id ? sortDirection : false
                  }
                  style={{
                    width: columnWidths[headCell.id],
                    minWidth: columnWidths[headCell.id],
                    position: "relative",
                    userSelect: resizing ? "none" : "auto",
                    overflow: "hidden",
                  }}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={sortField === headCell.id}
                      direction={
                        sortField === headCell.id ? sortDirection : "asc"
                      }
                      onClick={() =>
                        handleRequestSort(headCell.id as keyof Lead)
                      }
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}

                  {/* Resize Handle */}
                  <Box
                    onMouseDown={(e) =>
                      handleMouseDown(
                        e,
                        headCell.id as string,
                        columnWidths[headCell.id]
                      )
                    }
                    sx={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: "4px",
                      cursor: "col-resize",
                      backgroundColor: theme.palette.grey[500],
                      borderRight: "1px solid rgba(0, 0, 0, 0.2)", // Optional: adds a border line
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.4)", // Blue on hover
                        width: "6px", // Slightly wider on hover
                      },
                      zIndex: 1,
                    }}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.map((lead, index) => {
              const isItemSelected = isSelected(lead.id);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  onClick={(event) =>
                    !isLeadExecutive && handleClick(event, lead.id, index)
                  } // ✅ Add !isLeadExecutive
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={lead.id}
                  selected={isItemSelected}
                  sx={{
                    cursor:
                      enableMultiSelect && !isLeadExecutive
                        ? "pointer"
                        : "default",
                  }} // ✅ Update
                >
                  {enableMultiSelect && !isLeadExecutive && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          "aria-labelledby": labelId,
                        }}
                      />
                    </TableCell>
                  )}

                  <TableCell
                    component="th"
                    id={labelId}
                    scope="row"
                    style={{
                      width: columnWidths.company_name,
                      maxWidth: columnWidths.company_name,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Box>
                      {lead.tags && (
                        <Chip
                          label={lead.tags.toUpperCase()}
                          size="small"
                          color={lead.tags === "hot" ? "error" : "warning"}
                          variant="filled"
                          sx={{
                            mb: 0.5,
                            fontSize: "0.65rem",
                            height: "18px",
                            fontWeight: "bold",
                          }}
                        />
                      )}
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {lead.company_name}
                      </Typography>
                      {lead.email && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          noWrap
                        >
                          {lead.email}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell
                    style={{
                      width: columnWidths.owner_name,
                      maxWidth: columnWidths.owner_name,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Typography variant="body2" noWrap>
                      {lead.owner_name || "-"}
                    </Typography>
                  </TableCell>

                  <TableCell
                    style={{
                      width: columnWidths.product,
                      maxWidth: columnWidths.product,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Typography variant="body2" noWrap>
                      {lead.product || "-"}
                    </Typography>
                  </TableCell>

                  <TableCell
                    style={{
                      width: columnWidths.contact_number,
                      maxWidth: columnWidths.contact_number,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography variant="body2" noWrap>
                        {lead.contact_number}
                      </Typography>
                      <Tooltip title="Copy to clipboard">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(lead.contact_number);
                            showNotification?.(
                              "Phone number copied!",
                              "success"
                            );
                          }}
                          sx={{ padding: "2px" }}
                        >
                          <ContentCopyIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>

                  <TableCell
                    style={{
                      width: columnWidths.source,
                      maxWidth: columnWidths.source,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Chip label={lead.source} size="small" variant="outlined" />
                  </TableCell>

                  <TableCell
                    style={{
                      width: columnWidths.country,
                      maxWidth: columnWidths.country,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Typography variant="body2" noWrap>
                      {lead.country}
                    </Typography>
                  </TableCell>

                  <TableCell
                    style={{
                      width: columnWidths.type,
                      maxWidth: columnWidths.type,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getTypeChip(lead.type)}
                  </TableCell>

                  <TableCell
                    style={{
                      width: columnWidths.status,
                      maxWidth: columnWidths.status,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isLeadExecutive ? (
                      // ✅ Static display for lead executives - no click handler
                      <Chip
                        label={lead.assigned_to ? "ASSIGNED" : "UNASSIGNED"}
                        size="small"
                        color={lead.assigned_to ? "success" : "default"}
                        variant="filled"
                      />
                    ) : (
                      // Regular clickable status for others
                      <Tooltip title="Click to change status">
                        <Box
                          onClick={(e) => handleStatusClick(e, lead)}
                          sx={{
                            cursor: "pointer",
                            display: "inline-block",
                            "&:hover": {
                              opacity: 0.8,
                              transform: "scale(1.05)",
                              transition: "all 0.2s",
                            },
                          }}
                        >
                          <Chip
                            label={lead.status.replace(/_/g, " ").toUpperCase()}
                            size="small"
                            color={getStatusColor(lead.status) as any}
                            variant="filled"
                          />
                        </Box>
                      </Tooltip>
                    )}
                  </TableCell>

                  {(currentUser?.role === "admin" ||
                    currentUser?.role === "lead_executive") && (
                    <>
                      <TableCell
                        style={{
                          width: columnWidths.assigned_to,
                          maxWidth: columnWidths.assigned_to,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Typography variant="body2" noWrap>
                          {lead.assigned_user?.name || "Unassigned"}
                        </Typography>
                      </TableCell>

                      <TableCell
                        style={{
                          width: columnWidths.lead_executive_id,
                          maxWidth: columnWidths.lead_executive_id,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Typography variant="body2" noWrap>
                          {lead.lead_executive?.name || "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell
                        style={{
                          width: columnWidths.date,
                          maxWidth: columnWidths.date,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Typography variant="body2" noWrap>
                          {lead.date ? formatDate(lead.date) : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell
                        style={{
                          width: columnWidths.created_at,
                          maxWidth: columnWidths.created_at,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Typography variant="body2" noWrap>
                          {lead.created_at
                            ? formatDate(lead.created_at)
                            : "N/A"}
                        </Typography>
                      </TableCell>
                    </>
                  )}

                  {currentUser?.role === "manager" && (
                    <TableCell
                      style={{
                        width: columnWidths.assigned_to,
                        maxWidth: columnWidths.assigned_to,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Typography variant="body2" noWrap>
                        {lead.assigned_user?.name || "Unassigned"}
                      </Typography>
                    </TableCell>
                  )}

                  <TableCell
                    style={{
                      width: columnWidths.assigned_date,
                      maxWidth: columnWidths.assigned_date,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Typography variant="body2" noWrap>
                      {lead.assigned_date
                        ? formatDate(lead.assigned_date)
                        : "N/A"}
                    </Typography>
                  </TableCell>

                  <TableCell
                    align="right"
                    style={{
                      width: columnWidths.actions,
                      maxWidth: columnWidths.actions,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <Tooltip
                        title={
                          lead.notes_count && lead.notes_count > 0
                            ? `View ${lead.notes_count} Note(s)`
                            : "Add Note"
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewNotes) {
                              onViewNotes(lead.id);
                            }
                          }}
                          sx={{
                            color:
                              lead.notes_count && lead.notes_count > 0
                                ? "#1976d2"
                                : "inherit",
                          }}
                        >
                          <Badge
                            badgeContent={lead.notes_count || 0}
                            color="primary"
                            invisible={
                              !lead.notes_count || lead.notes_count === 0
                            }
                            sx={{
                              "& .MuiBadge-badge": {
                                fontSize: "0.6rem",
                                height: "16px",
                                minWidth: "16px",
                              },
                            }}
                          >
                            <NoteIcon fontSize="small" />
                          </Badge>
                        </IconButton>
                      </Tooltip>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, lead);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell
                  colSpan={
                    enableMultiSelect ? headCells.length + 1 : headCells.length
                  }
                />
              </TableRow>
            )}
            {leads.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={
                    (enableMultiSelect && !isLeadExecutive ? 1 : 0) +
                    headCells.length // ✅ Update
                  }
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography variant="body2" color="textSecondary">
                    No leads found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) =>
          onRowsPerPageChange(parseInt(event.target.value, 10))
        }
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Add Tag Option */}
        <MenuItem
          onClick={() => {
            if (selectedLead) handleTagClick(selectedLead);
            handleMenuClose();
          }}
        >
          <LocalOfferIcon fontSize="small" sx={{ mr: 1 }} />
          {leads && selectedLead?.tags ? "Change Tag" : "Add Tag"}
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedLead && onCreateTask) onCreateTask(selectedLead);
            handleMenuClose();
          }}
        >
          <AddIcon fontSize="small" sx={{ mr: 1 }} />
          Create Task
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedLead && onScheduleFollowup) {
              onScheduleFollowup(selectedLead.id);
            }
            handleMenuClose();
          }}
        >
          <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
          Set Reminder
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedLead) onEdit(selectedLead);
            handleMenuClose();
          }}
          disabled={selectedLead ? !canEditLead(selectedLead) : true} // ✅ Add disabled condition
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Lead
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedLead) onDelete(selectedLead);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
          disabled={selectedLead ? !canDeleteLead(selectedLead) : true} // ✅ Add disabled condition
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={handleStatusDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Update Status for {statusDialog.lead?.company_name}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Change the status of this lead. The change will be recorded in the
              lead history.
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Select Status</InputLabel>
              <Select
                value={statusDialog.newStatus}
                label="Select Status"
                onChange={(e) =>
                  setStatusDialog({
                    ...statusDialog,
                    newStatus: e.target.value,
                  })
                }
                disabled={statusDialog.loading}
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
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleStatusDialogClose}
            disabled={statusDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={
              statusDialog.loading ||
              !statusDialog.newStatus ||
              statusDialog.newStatus === statusDialog.lead?.status
            }
          >
            {statusDialog.loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tag Update Dialog */}
      <Dialog
        open={tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {" "}
          {leads && selectedLeadForTag?.tags ? "Change Tag" : "Add Tag"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select a tag for <strong>{selectedLeadForTag?.company_name}</strong>
          </Typography>
          <Box display="flex" flexDirection="column" gap={1} pt={1}>
            <Button
              variant={
                selectedLeadForTag?.tags === "hot" ? "contained" : "outlined"
              }
              color="error"
              onClick={() => handleTagUpdate("hot")}
              fullWidth
              startIcon={<LocalOfferIcon />}
            >
              HOT
            </Button>
            <Button
              variant={
                selectedLeadForTag?.tags === "warm" ? "contained" : "outlined"
              }
              color="warning"
              onClick={() => handleTagUpdate("warm")}
              fullWidth
              startIcon={<LocalOfferIcon />}
            >
              WARM
            </Button>
            {selectedLeadForTag?.tags && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => handleTagUpdate("")}
                fullWidth
              >
                Remove Tag
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default LeadTable;

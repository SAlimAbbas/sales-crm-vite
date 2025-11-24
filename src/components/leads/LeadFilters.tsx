import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  Box,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Autocomplete,
  Typography,
  Collapse,
  IconButton,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { LEAD_STATUS } from "../../utils/constants";
import { User } from "../../types";
import { debounce } from "lodash";

export interface FilterState {
  search: string;
  status: string[];
  type: string;
  source: string;
  country: string;
  assignedTo: string[];
  dateField: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  product: string;
  tags?: string;
}

interface LeadFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  loading?: boolean;
  currentUser?: any;
  isWorkingOnLeads?: boolean;
}

const initialFilters: FilterState = {
  search: "",
  status: [],
  type: "",
  source: "",
  country: "",
  assignedTo: [],
  dateField: "date",
  dateFrom: null,
  dateTo: null,
  product: "",
  tags: "",
};

const LeadFilters: React.FC<LeadFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  currentUser,
  loading = false,
  isWorkingOnLeads = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localCountry, setLocalCountry] = useState(filters.country);
  const [localProduct, setLocalProduct] = useState(filters.product);
  const [pendingFilters, setPendingFilters] = useState<FilterState>(filters);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const isCountryDisabled = useMemo(() => {
    return pendingFilters.type === "domestic";
  }, [pendingFilters.type]);

  const { data: usersData } = useQuery<any>({
    queryKey: ["salespeople"],
    queryFn: () => userService.getUsers({ role: "salesperson" }),
    select: (data) => data?.data || data,
  });

  const filtersRef = useRef(filters);

  // Update filtersRef when filters change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Update the sync effect to only sync when no pending changes
  useEffect(() => {
    if (!hasPendingChanges) {
      setPendingFilters(filters);
    }
  }, [filters, hasPendingChanges]);

  // Force assigned_date for salesperson
  useEffect(() => {
    if (currentUser?.role === "salesperson") {
      if (filters.dateField !== "assigned_date") {
        onFiltersChange({ ...filters, dateField: "assigned_date" });
      }
    }
  }, [currentUser?.role]);

  // Sync local state with filters
  useEffect(() => {
    setLocalSearch(filters.search);
    setLocalCountry(filters.country);
    setLocalProduct(filters.product);
  }, [filters.search, filters.country, filters.product]);

  // Cleanup debounced functions
  useEffect(() => {
    return () => {
      debouncedSearchRef.current.cancel();
      debouncedCountryRef.current.cancel();
      debouncedProductRef.current.cancel();
    };
  }, []);

  const debouncedCountryRef = useRef(
    debounce(
      (
        value: string,
        currentFilters: FilterState,
        callback: (filters: FilterState) => void
      ) => {
        if (value.length >= 2 || value.length === 0) {
          callback({ ...currentFilters, country: value });
        }
      },
      500
    )
  );

  const debouncedProductRef = useRef(
    debounce(
      (
        value: string,
        currentFilters: FilterState,
        callback: (filters: FilterState) => void
      ) => {
        if (value.length >= 2 || value.length === 0) {
          callback({ ...currentFilters, product: value });
        }
      },
      500
    )
  );

  const debouncedSearchRef = useRef(
    debounce((searchTerm: string, callback: (filters: FilterState) => void) => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        callback({ ...filtersRef.current, search: searchTerm });
      }
    }, 500)
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearch(value);
    debouncedSearchRef.current(value, onFiltersChange);
  };

  const handlePendingFilterChange = (key: keyof FilterState, value: any) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
    setHasPendingChanges(true); // ✅ Mark that user made changes
  };

  const handleApplyFilters = () => {
    setHasPendingChanges(false);

    // ✅ Check if filters are actually the same (it's a refresh, not a filter change)
    const filtersUnchanged =
      JSON.stringify(filters) === JSON.stringify(pendingFilters);

    // Pass a flag to indicate if this is a refresh
    if (isWorkingOnLeads && filtersUnchanged) {
      // @ts-ignore - We know onFiltersChange can accept a second parameter
      onFiltersChange(pendingFilters, true); // ✅ Pass true for shouldForceRefresh
    } else {
      onFiltersChange(pendingFilters);
    }
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalCountry("");
    setLocalProduct("");
    setPendingFilters(initialFilters);
    setHasPendingChanges(false); // ✅ Clear the flag on reset
    onFiltersChange(initialFilters);
    onReset();
  };

  const statusOptions = [
    { value: LEAD_STATUS.ASSIGNED, label: "Assigned" },
    ...(currentUser?.role === "admin" || currentUser?.role === "manager"
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
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "domestic", label: "Domestic" },
    { value: "international", label: "International" },
  ];

  const sourceOptions = [
    { value: "", label: "All Sources" },
    { value: "Websites", label: "Websites" },
    { value: "Referral", label: "Referral" },
    { value: "Social Media", label: "Social Media" },
    { value: "Cold Call", label: "Cold Call" },
    { value: "Paid Campaign", label: "Paid Campaign" },
    { value: "Email Campaign", label: "Email Campaign" },
    { value: "Trade Show", label: "Trade Show" },
    { value: "Other", label: "Other" },
  ];

  const assignmentOptions = [
    ...(usersData?.data || usersData || []).map((user: User) => ({
      value: user.id.toString(),
      label: user.name,
    })),
  ];

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "search") return value.trim() !== "";
      if (key === "dateFrom" || key === "dateTo") return value !== null;
      if (key === "status" || key === "assignedTo")
        return Array.isArray(value) && value.length > 0;
      if (key === "dateField") return false;
      return value !== "";
    }).length;
  }, [filters]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* Search Bar and Toggle */}
        <Box display="flex" gap={2} alignItems="center" mb={expanded ? 2 : 0}>
          <TextField
            placeholder="Search leads..."
            value={localSearch}
            onChange={handleSearchChange}
            disabled={loading}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setLocalSearch("");
                      onFiltersChange({ ...filters, search: "" });
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
            disabled={loading}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="text"
              startIcon={<ClearIcon />}
              onClick={handleReset}
              disabled={loading}
              size="small"
            >
              Clear All
            </Button>
          )}
        </Box>

        {/* Advanced Filters */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {/* Status Multi-Select */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Autocomplete
                multiple
                size="small"
                options={statusOptions}
                getOptionLabel={(option) => option.label}
                value={statusOptions.filter((opt) =>
                  pendingFilters.status.includes(opt.value)
                )}
                onChange={(_, newValue) => {
                  handlePendingFilterChange(
                    "status",
                    newValue.map((v) => v.value)
                  );
                }}
                disabled={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Status"
                    placeholder="Select statuses"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option.label}
                        size="small"
                        {...tagProps}
                      />
                    );
                  })
                }
              />
            </Grid>

            {/* Type Dropdown */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={pendingFilters.type}
                  label="Type"
                  onChange={(e) =>
                    handlePendingFilterChange("type", e.target.value)
                  }
                  disabled={loading}
                >
                  {typeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Source Dropdown */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Source</InputLabel>
                <Select
                  value={pendingFilters.source}
                  label="Source"
                  onChange={(e) =>
                    handlePendingFilterChange("source", e.target.value)
                  }
                  disabled={loading}
                >
                  {sourceOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Assignment Multi-Select */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Autocomplete
                multiple
                size="small"
                options={assignmentOptions}
                getOptionLabel={(option) => option.label}
                value={assignmentOptions.filter((opt) =>
                  pendingFilters.assignedTo.includes(opt.value)
                )}
                onChange={(_, newValue) => {
                  handlePendingFilterChange(
                    "assignedTo",
                    newValue.map((v) => v.value)
                  );
                }}
                disabled={loading || currentUser?.role === "salesperson"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assigned To"
                    placeholder="Select salespeople"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option.label}
                        size="small"
                        {...tagProps}
                      />
                    );
                  })
                }
              />
            </Grid>

            {/* Country - Instant Search */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <TextField
                label="Country"
                value={localCountry}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalCountry(value);
                  debouncedCountryRef.current(value, filters, onFiltersChange);
                }}
                disabled={loading || isCountryDisabled}
                fullWidth
                size="small"
                placeholder={
                  isCountryDisabled ? "Disabled for Domestic leads" : ""
                }
              />
            </Grid>

            {/* Product - Instant Search */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <TextField
                label="Product/Service"
                value={localProduct}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalProduct(value);
                  debouncedProductRef.current(value, filters, onFiltersChange);
                }}
                disabled={loading}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Tags Dropdown */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tags</InputLabel>
                <Select
                  value={pendingFilters.tags || ""}
                  label="Tags"
                  onChange={(e) => {
                    handlePendingFilterChange("tags", e.target.value);
                  }}
                  disabled={loading}
                >
                  <MenuItem value="">All Tags</MenuItem>
                  <MenuItem value="hot">Hot</MenuItem>
                  <MenuItem value="warm">Warm</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date Field Dropdown */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Field</InputLabel>
                <Select
                  value={pendingFilters.dateField}
                  label="Date Field"
                  onChange={(e) =>
                    handlePendingFilterChange("dateField", e.target.value)
                  }
                  disabled={loading || currentUser?.role === "salesperson"}
                >
                  <MenuItem value="date">Lead Date</MenuItem>
                  <MenuItem value="created_at">Created Date</MenuItem>
                  <MenuItem value="assigned_date">Assigned Date</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date Range Picker */}
            <Grid size={{ xs: 12, sm: 12, md: 8, lg: 6 }}>
              <Box display="flex" gap={1} alignItems="center">
                <DatePicker
                  label="From"
                  value={pendingFilters.dateFrom}
                  onChange={(value) =>
                    handlePendingFilterChange("dateFrom", value)
                  }
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
                <Typography variant="body2" color="textSecondary">
                  to
                </Typography>
                <DatePicker
                  label="To"
                  value={pendingFilters.dateTo}
                  minDate={pendingFilters.dateFrom || undefined}
                  onChange={(value) =>
                    handlePendingFilterChange("dateTo", value)
                  }
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Active Filters:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {filters.search && (
                  <Chip
                    label={`Search: "${filters.search}"`}
                    size="small"
                    onDelete={() => {
                      setLocalSearch("");
                      onFiltersChange({ ...filters, search: "" });
                    }}
                    variant="outlined"
                  />
                )}
                {filters.status.length > 0 && (
                  <Chip
                    label={`Status: ${
                      filters.status.length === 1
                        ? statusOptions.find(
                            (opt) => opt.value === filters.status[0]
                          )?.label
                        : `${filters.status.length} selected`
                    }`}
                    size="small"
                    onDelete={() => {
                      setPendingFilters((prev) => ({ ...prev, status: [] }));
                      onFiltersChange({ ...filters, status: [] });
                    }}
                    variant="outlined"
                  />
                )}
                {filters.type && (
                  <Chip
                    label={`Type: ${
                      typeOptions.find((opt) => opt.value === filters.type)
                        ?.label
                    }`}
                    size="small"
                    onDelete={() => {
                      setPendingFilters((prev) => ({ ...prev, type: "" }));
                      onFiltersChange({ ...filters, type: "" });
                    }}
                    variant="outlined"
                  />
                )}
                {filters.source && (
                  <Chip
                    label={`Source: ${filters.source}`}
                    size="small"
                    onDelete={() => {
                      setPendingFilters((prev) => ({ ...prev, source: "" }));
                      onFiltersChange({ ...filters, source: "" });
                    }}
                    variant="outlined"
                  />
                )}
                {filters.assignedTo.length > 0 && (
                  <Chip
                    label={`Assigned: ${
                      filters.assignedTo.length === 1
                        ? assignmentOptions.find(
                            (opt) => opt.value === filters.assignedTo[0]
                          )?.label
                        : `${filters.assignedTo.length} selected`
                    }`}
                    size="small"
                    onDelete={() => {
                      setPendingFilters((prev) => ({
                        ...prev,
                        assignedTo: [],
                      }));
                      onFiltersChange({ ...filters, assignedTo: [] });
                    }}
                    variant="outlined"
                  />
                )}
                {filters.country && (
                  <Chip
                    label={`Country: ${filters.country}`}
                    size="small"
                    onDelete={() => {
                      setLocalCountry("");
                      onFiltersChange({ ...filters, country: "" });
                    }}
                    variant="outlined"
                  />
                )}
                {filters.product && (
                  <Chip
                    label={`Product: ${filters.product}`}
                    size="small"
                    onDelete={() => {
                      setLocalProduct("");
                      onFiltersChange({ ...filters, product: "" });
                    }}
                    variant="outlined"
                  />
                )}
                {filters.tags && (
                  <Chip
                    label={`Tag: ${filters.tags.toUpperCase()}`}
                    size="small"
                    onDelete={() => {
                      setPendingFilters((prev) => ({ ...prev, tags: "" }));
                      onFiltersChange({ ...filters, tags: "" });
                    }}
                    variant="outlined"
                  />
                )}
                {filters.dateFrom && (
                  <Chip
                    label={`${
                      filters.dateField === "date"
                        ? "Lead Date"
                        : filters.dateField === "created_at"
                        ? "Created"
                        : "Assigned"
                    } From: ${filters.dateFrom.toLocaleDateString()}`}
                    size="small"
                    onDelete={() => {
                      setPendingFilters((prev) => ({
                        ...prev,
                        dateFrom: null,
                      }));
                      onFiltersChange({ ...filters, dateFrom: null });
                    }}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}

          <Box display="flex" gap={2} justifyContent="center" mt={3}>
            <Button variant="outlined" onClick={handleReset} disabled={loading}>
              Reset Filters
            </Button>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              disabled={loading}
              startIcon={isWorkingOnLeads ? <RefreshIcon /> : undefined}
            >
              {isWorkingOnLeads ? "Refresh & Apply Filters" : "Apply Filters"}
            </Button>
          </Box>
        </Collapse>
      </Paper>
    </LocalizationProvider>
  );
};

export default LeadFilters;

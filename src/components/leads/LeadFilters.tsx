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
  status: string;
  type: string;
  source: string;
  country: string;
  assignedTo: string;
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
}

const initialFilters: FilterState = {
  search: "",
  status: "",
  type: "",
  source: "",
  country: "",
  assignedTo: "",
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
}) => {
  const [expanded, setExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localCountry, setLocalCountry] = useState(filters.country);
  const [localProduct, setLocalProduct] = useState(filters.product);

  const { data: usersData } = useQuery<any>({
    queryKey: ["salespeople"],
    queryFn: () => userService.getUsers({ role: "salesperson" }),
    select: (data) => data?.data || data, // Handle both ApiResponse<UsersResponse> and UsersResponse
  });

  // Debounced search handler - only triggers after 500ms of no typing
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    setLocalCountry(filters.country);
    setLocalProduct(filters.product);
  }, [filters.country, filters.product]);

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

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
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
    { value: "Email Campaign", label: "Email Campaign" },
    { value: "Trade Show", label: "Trade Show" },
    { value: "Other", label: "Other" },
  ];

  const assignmentOptions = [
    { value: "", label: "All Assignment" },
    { value: "assigned", label: "Assigned" },
    { value: "unassigned", label: "Unassigned" },
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
      return value !== "";
    }).length;
  }, [filters]);

  const handleReset = () => {
    setLocalSearch("");
    setLocalCountry("");
    setLocalProduct("");
    onFiltersChange(initialFilters);
    onReset();
  };

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
                    onClick={() => handleFilterChange("search", "")}
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
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  disabled={loading}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Type"
                  onChange={(e) => handleFilterChange("type", e.target.value)}
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

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Source</InputLabel>
                <Select
                  value={filters.source}
                  label="Source"
                  onChange={(e) => handleFilterChange("source", e.target.value)}
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

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Assignment</InputLabel>
                <Select
                  value={
                    currentUser?.role === "salesperson"
                      ? currentUser.id.toString()
                      : filters.assignedTo
                  }
                  label="Assignment"
                  onChange={(e) =>
                    handleFilterChange("assignedTo", e.target.value)
                  }
                  disabled={loading || currentUser?.role === "salesperson"}
                >
                  {currentUser?.role === "salesperson"
                    ? [
                        {
                          value: currentUser.id.toString(),
                          label: currentUser.name,
                        },
                      ].map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))
                    : assignmentOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <TextField
                label="Country"
                value={localCountry}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalCountry(value); // Update local state immediately for UI
                  debouncedCountryRef.current(value, filters, onFiltersChange); // Debounce server call
                }}
                disabled={loading}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <TextField
                label="Product/Service"
                value={localProduct}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalProduct(value); // Update local state immediately for UI
                  debouncedProductRef.current(value, filters, onFiltersChange); // Debounce server call
                }}
                disabled={loading}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tags</InputLabel>
                <Select
                  value={filters.tags || ""}
                  label="Tags"
                  onChange={(e) => {
                    handleFilterChange("tags", e.target.value);
                  }}
                  disabled={loading}
                >
                  <MenuItem value="">All Tags</MenuItem>
                  <MenuItem value="hot">Hot</MenuItem>
                  <MenuItem value="warm">Warm</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <DatePicker
                label="Date From"
                value={filters.dateFrom}
                onChange={(value) => handleFilterChange("dateFrom", value)}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <DatePicker
                label="Date To"
                value={filters.dateTo}
                onChange={(value) => handleFilterChange("dateTo", value)}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
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
                    onDelete={() => handleFilterChange("search", "")}
                    variant="outlined"
                  />
                )}
                {filters.status && (
                  <Chip
                    label={`Status: ${
                      statusOptions.find((opt) => opt.value === filters.status)
                        ?.label
                    }`}
                    size="small"
                    onDelete={() => handleFilterChange("status", "")}
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
                    onDelete={() => handleFilterChange("type", "")}
                    variant="outlined"
                  />
                )}
                {filters.source && (
                  <Chip
                    label={`Source: ${filters.source}`}
                    size="small"
                    onDelete={() => handleFilterChange("source", "")}
                    variant="outlined"
                  />
                )}
                {filters.assignedTo && (
                  <Chip
                    label={`Assigned: ${
                      assignmentOptions.find(
                        (opt) => opt.value === filters.assignedTo
                      )?.label
                    }`}
                    size="small"
                    onDelete={() => handleFilterChange("assignedTo", "")}
                    variant="outlined"
                  />
                )}
                {filters.country && (
                  <Chip
                    label={`Country: ${filters.country}`}
                    size="small"
                    onDelete={() => handleFilterChange("country", "")}
                    variant="outlined"
                  />
                )}
                {filters.product && (
                  <Chip
                    label={`Product: ${filters.product}`}
                    size="small"
                    onDelete={() => handleFilterChange("product", "")}
                    variant="outlined"
                  />
                )}

                {filters.tags && (
                  <Chip
                    label={`Tag: ${filters.tags.toUpperCase()}`}
                    size="small"
                    onDelete={() => handleFilterChange("tags", "")}
                    variant="outlined"
                  />
                )}
                {filters.dateFrom && (
                  <Chip
                    label={`From: ${filters.dateFrom.toLocaleDateString()}`}
                    size="small"
                    onDelete={() => handleFilterChange("dateFrom", null)}
                    variant="outlined"
                  />
                )}
                {filters.dateTo && (
                  <Chip
                    label={`To: ${filters.dateTo.toLocaleDateString()}`}
                    size="small"
                    onDelete={() => handleFilterChange("dateTo", null)}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
        </Collapse>
      </Paper>
    </LocalizationProvider>
  );
};

export default LeadFilters;

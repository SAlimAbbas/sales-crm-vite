import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { debounce } from "lodash";

export interface FilterState {
  search: string;
  client_type: string;
  plan_type: string;
  payment_status: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

interface ConvertedClientFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  loading?: boolean;
}

const initialFilters: FilterState = {
  search: "",
  client_type: "",
  plan_type: "",
  payment_status: "",
  dateFrom: null,
  dateTo: null,
};

const ConvertedClientFilters: React.FC<ConvertedClientFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  loading = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    return () => {
      debouncedSearchRef.current.cancel();
    };
  }, []);

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

  const clientTypeOptions = [
    { value: "", label: "All Types" },
    { value: "domestic", label: "Domestic" },
    { value: "international", label: "International" },
  ];

  const planTypeOptions = [
    { value: "", label: "All Plans" },
    { value: "basic", label: "Basic" },
    { value: "premium", label: "Premium" },
    { value: "vip", label: "VIP" },
    { value: "advanced", label: "Advanced" },
  ];

  const paymentStatusOptions = [
    { value: "", label: "All Status" },
    { value: "fully_paid", label: "Fully Paid" },
    { value: "partially_paid", label: "Partially Paid" },
    { value: "unpaid", label: "Unpaid" },
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
    onFiltersChange(initialFilters);
    onReset();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* Search Bar and Toggle */}
        <Box display="flex" gap={2} alignItems="center" mb={expanded ? 2 : 0}>
          <TextField
            placeholder="Search clients..."
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Client Type</InputLabel>
                <Select
                  value={filters.client_type}
                  label="Client Type"
                  onChange={(e) =>
                    handleFilterChange("client_type", e.target.value)
                  }
                  disabled={loading}
                >
                  {clientTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Plan Type</InputLabel>
                <Select
                  value={filters.plan_type}
                  label="Plan Type"
                  onChange={(e) =>
                    handleFilterChange("plan_type", e.target.value)
                  }
                  disabled={loading}
                >
                  {planTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={filters.payment_status}
                  label="Payment Status"
                  onChange={(e) =>
                    handleFilterChange("payment_status", e.target.value)
                  }
                  disabled={loading}
                >
                  {paymentStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box display="flex" gap={1} alignItems="center">
                <DatePicker
                  label="From"
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
                <Typography variant="body2" color="textSecondary">
                  to
                </Typography>
                <DatePicker
                  label="To"
                  value={filters.dateTo}
                  minDate={filters.dateFrom || undefined}
                  onChange={(value) => handleFilterChange("dateTo", value)}
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
                    onDelete={() => handleFilterChange("search", "")}
                    variant="outlined"
                  />
                )}
                {filters.client_type && (
                  <Chip
                    label={`Type: ${
                      clientTypeOptions.find(
                        (opt) => opt.value === filters.client_type
                      )?.label
                    }`}
                    size="small"
                    onDelete={() => handleFilterChange("client_type", "")}
                    variant="outlined"
                  />
                )}
                {filters.plan_type && (
                  <Chip
                    label={`Plan: ${
                      planTypeOptions.find(
                        (opt) => opt.value === filters.plan_type
                      )?.label
                    }`}
                    size="small"
                    onDelete={() => handleFilterChange("plan_type", "")}
                    variant="outlined"
                  />
                )}
                {filters.payment_status && (
                  <Chip
                    label={`Status: ${
                      paymentStatusOptions.find(
                        (opt) => opt.value === filters.payment_status
                      )?.label
                    }`}
                    size="small"
                    onDelete={() => handleFilterChange("payment_status", "")}
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

export default ConvertedClientFilters;
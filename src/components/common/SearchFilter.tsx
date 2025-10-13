import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterOptions?: FilterOption[];
  selectedFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  placeholder?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  onSearchChange,
  filterOptions = [],
  selectedFilters = [],
  onFilterChange,
  placeholder = "Search...",
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (value: string) => {
    const newFilters = selectedFilters.includes(value)
      ? selectedFilters.filter((f) => f !== value)
      : [...selectedFilters, value];

    onFilterChange?.(newFilters);
  };

  const clearSearch = () => {
    onSearchChange("");
  };

  const clearFilters = () => {
    onFilterChange?.([]);
  };

  return (
    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
      <TextField
        size="small"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={clearSearch}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 250 }}
      />

      {filterOptions.length > 0 && (
        <>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
            sx={{ minWidth: "auto" }}
          >
            Filters
            {selectedFilters.length > 0 && ` (${selectedFilters.length})`}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleFilterClose}
            PaperProps={{
              sx: { minWidth: 200 },
            }}
          >
            {filterOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => handleFilterSelect(option.value)}
                selected={selectedFilters.includes(option.value)}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          {selectedFilters.length > 0 && (
            <Box display="flex" gap={1} flexWrap="wrap">
              {selectedFilters.map((filter) => {
                const option = filterOptions.find((f) => f.value === filter);
                return (
                  <Chip
                    key={filter}
                    label={option?.label || filter}
                    size="small"
                    onDelete={() => handleFilterSelect(filter)}
                  />
                );
              })}
              <Button
                size="small"
                onClick={clearFilters}
                sx={{ minWidth: "auto" }}
              >
                Clear all
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default SearchFilter;

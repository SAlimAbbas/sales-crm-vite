import { styled } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Box,
} from "@mui/material";

export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

export const StyledTable = styled(Table)({
  minWidth: 650,
});

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? "#121212" : theme.palette.grey[50],
  "& .MuiTableCell-head": {
    fontWeight: 600,
    color: theme.palette.text.primary,
    backgroundColor:
      theme.palette.mode === "dark" ? "#121212" : theme.palette.grey[50],
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:first-of-type": {
    paddingLeft: theme.spacing(3),
  },
  "&:last-of-type": {
    paddingRight: theme.spacing(3),
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:last-child td, &:last-child th": {
    borderBottom: "none",
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const StyledTablePagination = styled(TablePagination)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  "& .MuiTablePagination-toolbar": {
    padding: theme.spacing(1, 2),
  },
}));

export const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
  "&:hover": {
    color: theme.palette.primary.main,
  },
  "&.Mui-active": {
    color: theme.palette.primary.main,
  },
}));

export const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "0.75rem",
  height: 24,
}));

export const ActionCell = styled(Box)({
  display: "flex",
  gap: "8px",
  alignItems: "center",
});

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const EmptyState = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export const LoadingRow = styled(TableRow)({
  height: 53,
});

export const TableToolbar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

export const TableTitle = styled(Box)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const TableActions = styled(Box)({
  display: "flex",
  gap: "8px",
  alignItems: "center",
});

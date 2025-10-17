import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  TableSortLabel,
} from "@mui/material";
import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableCell,
  StyledTableRow,
  EmptyState,
} from "../../styles/components/tableStyles";
import LoadingSkeleton from "../common/LoadingSkeleton";

interface Column {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  width?: string | number;
  render?: (value: any, row: any) => React.ReactNode;
}

interface CustomTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  pagination?: {
    page: number;
    rowsPerPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
    rowsPerPageOptions?: number[];
  };
  sorting?: {
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSort: (sortBy: string, sortOrder: "asc" | "desc") => void;
  };
  emptyMessage?: string;
}

const CustomTable: React.FC<CustomTableProps> = ({
  columns,
  data,
  loading = false,
  pagination,
  sorting,
  emptyMessage = "No data available",
}) => {
  const handleSort = (columnId: string) => {
    if (!sorting) return;
    const isAsc = sorting.sortBy === columnId && sorting.sortOrder === "asc";
    sorting.onSort(columnId, isAsc ? "desc" : "asc");
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    pagination?.onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    pagination?.onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  if (loading) {
    return (
      <StyledTableContainer>
        <Paper>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Box py={4}>
                    <LoadingSkeleton variant="user" />
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </StyledTableContainer>
    );
  }

  if (data.length === 0) {
    return (
      <StyledTableContainer>
        <Paper>
          <EmptyState>
            <Typography variant="body1" color="textSecondary">
              {emptyMessage}
            </Typography>
          </EmptyState>
        </Paper>
      </StyledTableContainer>
    );
  }

  return (
    <StyledTableContainer>
      <Paper>
        <StyledTable>
          <StyledTableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell
                  key={column.id}
                  align={column.align || "left"}
                  width={column.width}
                  sortDirection={
                    sorting?.sortBy === column.id ? sorting.sortOrder : false
                  }
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sorting?.sortBy === column.id}
                      direction={
                        sorting?.sortBy === column.id ? sorting.sortOrder : "asc"
                      }
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </StyledTableCell>
              ))}
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {data.map((row, index) => (
              <StyledTableRow key={index}>
                {columns.map((column) => (
                  <StyledTableCell key={column.id} align={column.align || "left"}>
                    {column.render
                      ? column.render(row[column.id], row)
                      : row[column.id]}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            ))}
          </TableBody>
        </StyledTable>

        {pagination && (
          <TablePagination
            rowsPerPageOptions={pagination.rowsPerPageOptions || [10, 25, 50, 100]}
            component="div"
            count={pagination.total}
            rowsPerPage={pagination.rowsPerPage}
            page={pagination.page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </StyledTableContainer>
  );
};

export default CustomTable;
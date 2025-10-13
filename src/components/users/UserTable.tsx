import React from "react";
import { Box, Typography, Chip, Button } from "@mui/material";
import { User } from "../../types";
import { formatDate } from "../../utils/helpers";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  loading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  loading,
}) => {
  if (loading) {
    return (
      <Box py={4} textAlign="center">
        <Typography>Loading users...</Typography>
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Box py={4} textAlign="center">
        <Typography color="textSecondary">No users found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {users.map((user) => (
        <Box
          key={user.id}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            mb: 1,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight="medium">
                {user.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip
                  label={user.role}
                  size="small"
                  color={
                    user.role === "admin"
                      ? "error"
                      : user.role === "manager"
                      ? "warning"
                      : "primary"
                  }
                  variant="outlined"
                />
                <Chip
                  label={user.is_active ? "Active" : "Inactive"}
                  size="small"
                  color={user.is_active ? "success" : "default"}
                />
              </Box>
              {user.phone && (
                <Typography variant="body2" mt={1}>
                  Phone: {user.phone}
                </Typography>
              )}
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                mt={1}
              >
                Created: {formatDate(user.created_at)}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onEdit(user)}
              >
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={() => onDelete(user)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default UserTable;

import React from "react";
import { Button, ButtonProps, CircularProgress } from "@mui/material";

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  loading = false,
  children,
  disabled,
  startIcon,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} /> : startIcon}
    >
      {children}
    </Button>
  );
};

export default CustomButton;

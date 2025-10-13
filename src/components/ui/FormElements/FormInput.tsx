import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

interface FormInputProps extends Omit<TextFieldProps, "error"> {
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  error,
  helperText,
  ...props
}) => {
  const displayHelperText = error || helperText || "";

  return (
    <TextField
      {...props}
      error={!!error}
      helperText={displayHelperText}
      fullWidth
      variant="outlined"
      size="small"
    />
  );
};

export default FormInput;

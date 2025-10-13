import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label: string;
  name?: string; // Add name prop
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: (e: React.FocusEvent<any>) => void; // Add onBlur prop
  options: Option[];
  error?: string;
  helperText?: string; // Add helperText prop
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
}) => {
  const displayHelperText = error || helperText || "";

  return (
    <FormControl
      fullWidth={fullWidth}
      error={!!error}
      disabled={disabled}
      size="small"
    >
      <InputLabel>
        {label}
        {required ? " *" : ""}
      </InputLabel>
      <Select
        name={name}
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {displayHelperText && (
        <FormHelperText>{displayHelperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default FormSelect;

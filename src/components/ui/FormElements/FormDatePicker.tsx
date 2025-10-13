import React from "react";
import { TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TextFieldProps } from "@mui/material";

interface FormDatePickerProps {
  label: string;
  value: Date | string | null;
  onChange: (date: Date | null) => void;
  error?: string | boolean; // Accept both string and boolean
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  minDate,
  maxDate,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label + (required ? " *" : "")}
        value={value}
        onChange={onChange}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        enableAccessibleFieldDOMStructure={false}
        slots={{
          textField: TextField,
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            size: "small",
            error: !!error,
            helperText: error,
          } as TextFieldProps,
        }}
      />
    </LocalizationProvider>
  );
};

export default FormDatePicker;

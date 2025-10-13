import { styled } from "@mui/material/styles";
import {
  Paper,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Autocomplete,
  Chip,
  InputAdornment,
  IconButton,
} from "@mui/material";

export const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  maxWidth: 800,
  margin: "0 auto",
  backgroundColor: theme.palette.background.paper,
}));

export const FormTitle = styled(Box)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(3),
  textAlign: "center",
}));

export const FormGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

export const FormActions = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  justifyContent: "flex-end",
  marginTop: theme.spacing(4),
  paddingTop: theme.spacing(3),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius,
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.9rem",
  },
}));

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius,
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.9rem",
  },
}));

export const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 3),
  fontWeight: 500,
}));

export const FormSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
}));

export const SectionTitle = styled(Box)(({ theme }) => ({
  fontSize: "1.1rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const ErrorText = styled(FormHelperText)(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: 0,
  marginTop: theme.spacing(0.5),
}));

export const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
  "& .MuiFormControlLabel-label": {
    fontSize: "0.9rem",
  },
}));

export const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: theme.spacing(0.5),
}));

export const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
  },
}));

export const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export const FormRow = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  "& > *": {
    flex: 1,
  },
}));

export const FormColumn = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export const StyledInputAdornment = styled(InputAdornment)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const PasswordVisibilityButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
}));

export const FileUploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color 0.2s ease",
  backgroundColor: theme.palette.mode === "dark" ? "#2a2a2a" : "transparent",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor:
      theme.palette.mode === "dark" ? "#333" : theme.palette.grey[50],
  },
}));

export const UploadPreview = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor:
    theme.palette.mode === "dark" ? "#2a2a2a" : theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(1),
}));

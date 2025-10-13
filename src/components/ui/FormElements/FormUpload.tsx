import React, { useRef } from "react";
import { Box, Button, Typography, Chip, IconButton } from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

interface FormUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  value: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

const FormUpload: React.FC<FormUploadProps> = ({
  label,
  accept = "*/*",
  multiple = false,
  value,
  onChange,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (multiple) {
      onChange([...value, ...files]);
    } else {
      onChange(files);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const handleClearAll = () => {
    onChange([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Box>
      <Box
        sx={{
          border: `2px dashed ${error ? "error.main" : "grey.300"}`,
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          "&:hover": {
            borderColor: "primary.main",
          },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="body1" gutterBottom>
          {label}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Click to upload or drag and drop
        </Typography>
        <Button variant="contained" component="span" sx={{ mt: 1 }}>
          Browse Files
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {value.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="body2">
              Selected files ({value.length})
            </Typography>
            <Button size="small" onClick={handleClearAll}>
              Clear all
            </Button>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1}>
            {value.map((file, index) => (
              <Chip
                key={index}
                label={file.name}
                onDelete={() => handleRemoveFile(index)}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FormUpload;

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: (notes?: string) => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  severity?: "error" | "warning" | "info" | "success";
  loading?: boolean;
  showNotesField?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  severity = "warning",
  loading = false,
  showNotesField = false,
}) => {
  const [notes, setNotes] = useState("");

  const getColor = () => {
    switch (severity) {
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "success":
        return "success";
      default:
        return "primary";
    }
  };

  const handleConfirm = () => {
    if (showNotesField) {
      onConfirm(notes);
    } else {
      onConfirm();
    }
    setNotes(""); // Reset notes after confirmation
  };

  const handleCancel = () => {
    setNotes(""); // Reset notes on cancel
    onCancel();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ mb: showNotesField ? 2 : 0 }}>
          {message}
        </Typography>

        {showNotesField && (
          <TextField
            autoFocus
            margin="dense"
            label="Completion Notes"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this follow-up completion..."
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={handleCancel}
          disabled={loading}
          variant="outlined"
          size="large"
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          color={getColor()}
          size="large"
        >
          {loading ? "Processing..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

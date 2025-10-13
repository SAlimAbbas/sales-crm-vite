import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'md',
  fullWidth = true
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ ml: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions sx={{ p: 2 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CustomModal;
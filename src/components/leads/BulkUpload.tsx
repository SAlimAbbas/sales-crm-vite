import React, { useState } from "react";
import { Box, Typography, Button, Alert, LinearProgress } from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import CustomModal from "../ui/CustomModal";
import FormUpload from "../ui/FormElements/FormUpload";
import { leadService } from "../../services/leadService";
import { useNotification } from "../../contexts/NotificationContext";

interface BulkUploadProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkUpload: React.FC<BulkUploadProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { showNotification } = useNotification();

  const handleUpload = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);

      const result = await leadService.bulkUpload(formData);
      setUploadResult(result);

      if (result.success > 0) {
        showNotification(
          `Successfully uploaded ${result.success} leads`,
          "success"
        );
        onSuccess();
      }

      if (result.failed > 0) {
        showNotification(`${result.failed} leads failed to upload`, "warning");
      }
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Upload failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setUploadResult(null);
    onClose();
  };

  const downloadTemplate = () => {
    const template = `date,company_name,contact_number,source,country,product,owner_name,website,email
2024-01-15,ABC Company,+1234567890,Website,USA,Product A,John Doe,https://abc.com,john@abc.com
2024-01-15,XYZ Corp,+1987654321,Referral,India,Product B,,,info@xyz.com`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leads_template.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title="Bulk Upload Leads"
      maxWidth="sm"
      actions={
        <Box>
          <Button type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={loading || files.length === 0}
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </Box>
      }
    >
      <Box>
        <Typography variant="body2" color="textSecondary" paragraph>
          Upload a CSV or Excel file with lead information. Download the
          template below for the correct format.
        </Typography>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadTemplate}
          sx={{ mb: 3 }}
        >
          Download Template
        </Button>

        <FormUpload
          label="Upload Leads File"
          accept=".csv,.xlsx,.xls"
          value={files}
          onChange={setFiles}
        />

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Uploading file...
            </Typography>
          </Box>
        )}

        {uploadResult && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Upload completed: {uploadResult.success} successful,{" "}
              {uploadResult.failed} failed
              {uploadResult.duplicates &&
                `, ${uploadResult.duplicates} duplicates`}
            </Alert>

            {uploadResult.failed > 0 && (
              <Typography variant="body2" color="textSecondary">
                Please check your file format and try again. Ensure all required
                fields are filled.
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Required Fields:
          </Typography>
          <Typography variant="body2" color="textSecondary">
            date, company_name, contact_number, source, country, product
          </Typography>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            Optional Fields:
          </Typography>
          <Typography variant="body2" color="textSecondary">
            owner_name, website, email
          </Typography>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default BulkUpload;

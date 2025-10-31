import React, { useState } from "react";
import { Box, Typography, Button, Alert, LinearProgress } from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
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
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    duplicates?: number;
    errors?: Array<{ row: number; error: string }>;
  } | null>(null);
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

      // Show only ONE notification based on the result
      if (result.failed === 0 && result.success > 0) {
        showNotification(
          `Successfully uploaded ${result.success} leads`,
          "success"
        );
      } else if (result.success > 0 && result.failed > 0) {
        showNotification(
          `Uploaded ${result.success} leads, ${result.failed} failed`,
          "warning"
        );
      } else if (result.failed > 0 && result.success === 0) {
        showNotification(
          `Upload failed: ${result.failed} leads could not be processed`,
          "error"
        );
      }

      // Only call onSuccess if there were successful uploads
      if (result.success > 0) {
        onSuccess();
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <Typography variant="body2" color="primary">
                Processing {files[0]?.name}... This may take a moment.
              </Typography>
            </Box>
          </Box>
        )}

        {uploadResult && (
          <Box sx={{ mt: 2 }}>
            <Alert
              severity={uploadResult.failed > 0 ? "warning" : "success"}
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Upload Summary
              </Typography>
              <Typography variant="body2">
                ✓ {uploadResult.success} leads uploaded successfully
                {uploadResult.failed > 0 &&
                  ` • ✗ ${uploadResult.failed} failed`}
                {(uploadResult.duplicates ?? 0) > 0 &&
                  ` • ⚠ ${uploadResult.duplicates} duplicates skipped`}
              </Typography>
            </Alert>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Failed Rows:
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                  {uploadResult.errors.slice(0, 10).map((err, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      sx={{ fontSize: "0.85rem" }}
                    >
                      • Row {err.row}: {err.error}
                    </Typography>
                  ))}
                  {uploadResult.errors.length > 10 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      ...and {uploadResult.errors.length - 10} more errors
                    </Typography>
                  )}
                </Box>
              </Alert>
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

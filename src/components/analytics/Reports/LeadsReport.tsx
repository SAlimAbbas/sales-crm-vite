import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
} from "@mui/icons-material";

interface LeadsReportProps {
  onExport: (format: string) => void;
  dateRange: string;
}

const LeadsReport: React.FC<LeadsReportProps> = ({ onExport, dateRange }) => {
  const formatDateRange = (range: string) => {
    const formatMap: { [key: string]: string } = {
      today: "Today",
      week: "This Week",
      month: "This Month",
      quarter: "This Quarter",
      year: "This Year",
    };
    return formatMap[range] || range;
  };

  const reportFeatures = [
    "Complete lead information with contact details",
    "Lead status breakdown and conversion metrics",
    "Assignment history and salesperson performance",
    "Lead source analysis and tracking",
    "Follow-up status and completion rates",
    "Time-based lead generation trends",
    "Geographic distribution of leads",
    "Lead quality scoring and validation status",
  ];

  const exportFormats = [
    {
      format: "pdf",
      label: "PDF Report",
      icon: <PdfIcon />,
      description: "Professional formatted report with charts and graphs",
      color: "error" as const,
    },
    {
      format: "excel",
      label: "Excel Spreadsheet",
      icon: <ExcelIcon />,
      description: "Detailed data export for further analysis",
      color: "success" as const,
    },
    {
      format: "csv",
      label: "CSV File",
      icon: <CsvIcon />,
      description: "Raw data export for external tools",
      color: "primary" as const,
    },
  ];

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Leads Report</Typography>
            <Chip
              label={`Period: ${formatDateRange(dateRange)}`}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Typography variant="body2" color="textSecondary" paragraph>
            Generate comprehensive reports on lead management, conversion rates,
            and sales performance. This report includes detailed analytics on
            lead sources, status distribution, and team performance metrics.
          </Typography>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Report Contents:
          </Typography>
          <List dense>
            {reportFeatures.slice(0, 4).map((feature, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={<Typography variant="body2">• {feature}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Export Options
      </Typography>

      <Grid container spacing={2}>
        {exportFormats.map((option) => (
          <Grid size={{ xs: 12, md: 4 }} key={option.format}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: 3,
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => onExport(option.format)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      color: `${option.color}.main`,
                      mr: 2,
                    }}
                  >
                    {option.icon}
                  </Box>
                  <Typography variant="h6" color={`${option.color}.main`}>
                    {option.label}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {option.description}
                </Typography>
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    color={option.color}
                    size="small"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport(option.format);
                    }}
                  >
                    Export {option.label}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Additional Report Features:
        </Typography>
        <List dense>
          {reportFeatures.slice(4).map((feature, index) => (
            <ListItem key={index + 4} sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="body2" color="textSecondary">
                    • {feature}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: "info.light",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "info.main",
        }}
      >
        <Typography variant="body2" color="info.contrastText">
          <strong>Note:</strong> Report generation may take a few moments for
          large datasets. You'll be notified when your report is ready for
          download.
        </Typography>
      </Box>
    </Box>
  );
};

export default LeadsReport;

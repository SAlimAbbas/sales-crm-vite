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
  Alert,
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

interface PerformanceReportProps {
  onExport: (format: string) => void;
  dateRange: string;
}

const PerformanceReport: React.FC<PerformanceReportProps> = ({
  onExport,
  dateRange,
}) => {
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

  const reportMetrics = [
    {
      category: "Individual Performance",
      icon: <GroupIcon />,
      items: [
        "Conversion rates by salesperson",
        "Leads handled and closed deals",
        "Average response time to leads",
        "Follow-up completion rates",
      ],
    },
    {
      category: "Team Analytics",
      icon: <TrendingUpIcon />,
      items: [
        "Team-wide performance comparisons",
        "Top performers identification",
        "Performance trends over time",
        "Goal achievement tracking",
      ],
    },
    {
      category: "Efficiency Metrics",
      icon: <SpeedIcon />,
      items: [
        "Lead-to-conversion timeframes",
        "Response time benchmarking",
        "Activity volume analysis",
        "Resource utilization rates",
      ],
    },
    {
      category: "Management Insights",
      icon: <AssignmentIcon />,
      items: [
        "Performance bottleneck identification",
        "Training needs assessment",
        "Workload distribution analysis",
        "Success pattern recognition",
      ],
    },
  ];

  const exportFormats = [
    {
      format: "pdf",
      label: "Executive Report (PDF)",
      icon: <PdfIcon />,
      description:
        "Comprehensive performance report with visual analytics and insights",
      color: "error" as const,
      features: [
        "Executive summary",
        "Performance charts",
        "Trend analysis",
        "Action recommendations",
      ],
    },
    {
      format: "excel",
      label: "Detailed Analysis (Excel)",
      icon: <ExcelIcon />,
      description: "Complete dataset with pivot tables and advanced analytics",
      color: "success" as const,
      features: [
        "Raw performance data",
        "Pivot tables",
        "Formulas included",
        "Multi-sheet analysis",
      ],
    },
    {
      format: "csv",
      label: "Data Export (CSV)",
      icon: <CsvIcon />,
      description: "Raw performance data for custom analysis tools",
      color: "primary" as const,
      features: [
        "Clean data format",
        "All metrics included",
        "Time-series data",
        "External tool compatible",
      ],
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
            <Typography variant="h6">Performance Report</Typography>
            <Chip
              label={`Period: ${formatDateRange(dateRange)}`}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Typography variant="body2" color="textSecondary" paragraph>
            Generate comprehensive performance reports covering individual and
            team metrics, conversion analytics, and productivity insights. This
            report provides detailed analysis of sales team effectiveness and
            identifies opportunities for improvement.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Manager & Admin Only:</strong> Performance reports contain
              sensitive team data and are only available to users with
              appropriate permissions.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Report Metrics Overview */}
      <Typography variant="h6" gutterBottom>
        Report Metrics & Analytics
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {reportMetrics.map((metric, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={index}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      color: "primary.main",
                      mr: 2,
                      p: 1,
                      backgroundColor: "primary.light",
                      borderRadius: 1,
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {metric.category}
                  </Typography>
                </Box>
                <List dense>
                  {metric.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex} sx={{ py: 0.5, px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2">• {item}</Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" gutterBottom>
        Export Options
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {exportFormats.map((option) => (
          <Grid size={{ xs: 12, md: 4 }} key={option.format}>
            <Card
              sx={{
                height: "100%",
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

                <Typography variant="body2" color="textSecondary" paragraph>
                  {option.description}
                </Typography>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Includes:
                </Typography>
                <List dense>
                  {option.features.map((feature, index) => (
                    <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontSize="0.85rem">
                            • {feature}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

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
                    Export {option.label.split(" ")[0]}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Key Performance Indicators */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Key Performance Indicators (KPIs)
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Sales Performance KPIs
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Individual Conversion Rates"
                      secondary="Track each salesperson's lead-to-customer conversion percentage"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Average Deal Size"
                      secondary="Monitor the value of deals closed by each team member"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Sales Cycle Length"
                      secondary="Measure time from lead generation to deal closure"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Productivity KPIs
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Response Time Metrics"
                      secondary="Average time to respond to new leads and follow-ups"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Activity Volume"
                      secondary="Number of calls, emails, and meetings per salesperson"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Goal Achievement Rate"
                      secondary="Percentage of sales targets met by each team member"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          mt: 4,
          p: 3,
          backgroundColor: "warning.light",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "warning.main",
        }}
      >
        <Typography
          variant="subtitle2"
          gutterBottom
          color="warning.contrastText"
        >
          Performance Report Guidelines
        </Typography>
        <Typography variant="body2" color="warning.contrastText">
          • Reports are generated based on the selected date range and include
          all team members under your management
          <br />
          • Performance data is updated in real-time and reflects the most
          current metrics
          <br />
          • Sensitive performance information should be handled according to
          company privacy policies
          <br />
          • Large datasets may take several minutes to generate - please be
          patient during export
          <br />• Use the detailed Excel format for in-depth analysis and the
          PDF format for presentations
        </Typography>
      </Box>
    </Box>
  );
};

export default PerformanceReport;

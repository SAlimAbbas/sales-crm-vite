import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Upload,
  People,
  Language,
  Source as SourceIcon,
  Assignment,
  AssignmentLate,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { leadExecutiveService } from "../../services/leadExecutiveService";
import { useNavigate } from "react-router-dom";

const LeadExecutiveDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("this_month");

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["lead-executive-dashboard", dateRange],
    queryFn: () => leadExecutiveService.getDashboard({ range: dateRange }),
    refetchInterval: 60000, // Refetch every minute
  });

  const StatCard = ({
    title,
    value,
    icon,
    color = "primary",
    subtitle,
    trend,
  }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
    subtitle?: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <Card sx={{ height: "100%", position: "relative", overflow: "visible" }}>
      <CardContent>
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box flex={1}>
            <Typography
              color="textSecondary"
              gutterBottom
              variant="body2"
              fontWeight={500}
            >
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                {trend.isPositive ? (
                  <TrendingUp fontSize="small" color="success" />
                ) : (
                  <TrendingDown fontSize="small" color="error" />
                )}
                <Typography
                  variant="body2"
                  color={trend.isPositive ? "success.main" : "error.main"}
                  fontWeight={600}
                >
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  vs last period
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ListCard = ({
    title,
    items,
    icon,
    emptyMessage,
  }: {
    title: string;
    items: Array<{ label: string; value: number }>;
    icon: React.ReactNode;
    emptyMessage: string;
  }) => (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        {icon}
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      {items.length > 0 ? (
        <Box>
          {items.map((item, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
              pb={2}
              borderBottom={index < items.length - 1 ? "1px solid" : "none"}
              borderColor="divider"
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ minWidth: 20, fontWeight: 600 }}
                >
                  #{index + 1}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {item.label}
                </Typography>
              </Box>
              <Chip
                label={item.value.toLocaleString()}
                size="small"
                variant="outlined"
                color="primary"
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Typography
          variant="body2"
          color="textSecondary"
          textAlign="center"
          py={3}
        >
          {emptyMessage}
        </Typography>
      )}
    </Paper>
  );

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load dashboard data. Please try again.
        </Alert>
      </Box>
    );
  }

  const summary = data?.summary;
  const charts = data?.charts;
  const trends = data?.trends;

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Lead Executive Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Track your lead generation performance
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              displayEmpty
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="last_7_days">Last 7 Days</MenuItem>
              <MenuItem value="this_week">This Week</MenuItem>
              <MenuItem value="last_week">Last Week</MenuItem>
              <MenuItem value="last_30_days">Last 30 Days</MenuItem>
              <MenuItem value="this_month">This Month</MenuItem>
              <MenuItem value="last_month">Last Month</MenuItem>
              <MenuItem value="this_year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => navigate("/leads")}
          >
            Upload Leads
          </Button>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={() => navigate("/leads")}
          >
            View All Leads
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Total Leads"
            value={summary?.total_leads || 0}
            icon={<People sx={{ fontSize: 32 }} />}
            color="primary"
            subtitle="All time"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Today"
            value={summary?.today_leads || 0}
            icon={<TrendingUp sx={{ fontSize: 32 }} />}
            color="success"
            subtitle="Leads uploaded today"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="This Week"
            value={summary?.this_week_leads || 0}
            icon={<BarChartIcon sx={{ fontSize: 32 }} />}
            color="warning"
            subtitle="Leads this week"
            trend={
              trends?.weekly_comparison
                ? {
                    value: trends.weekly_comparison.growth_percentage,
                    isPositive: trends.weekly_comparison.growth_percentage >= 0,
                  }
                : undefined
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="This Month"
            value={summary?.this_month_leads || 0}
            icon={<Assessment sx={{ fontSize: 32 }} />}
            color="error"
            subtitle="Leads this month"
          />
        </Grid>
      </Grid>

      {/* Assignment Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Assigned Leads"
            value={summary?.assigned_count || 0}
            icon={<Assignment sx={{ fontSize: 32 }} />}
            color="success"
            subtitle={`${summary?.assignment_rate || 0}% assignment rate`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Unassigned Leads"
            value={summary?.unassigned_count || 0}
            icon={<AssignmentLate sx={{ fontSize: 32 }} />}
            color="warning"
            subtitle="Awaiting assignment"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Selected Period"
            value={summary?.date_range_leads || 0}
            icon={<People sx={{ fontSize: 32 }} />}
            color="info"
            subtitle={`Leads in selected range`}
          />
        </Grid>
      </Grid>

      {/* Type Breakdown */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Leads by Type
            </Typography>
            <Box mt={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="body1">Domestic</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: `${
                        summary?.total_leads
                          ? (charts?.by_type?.domestic / summary.total_leads) *
                            100
                          : 0
                      }%`,
                      minWidth: 100,
                      height: 8,
                      backgroundColor: "success.main",
                      borderRadius: 1,
                    }}
                  />
                  <Chip
                    label={charts?.by_type?.domestic?.toLocaleString() || 0}
                    color="success"
                    size="small"
                  />
                </Box>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">International</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: `${
                        summary?.total_leads
                          ? (charts?.by_type?.international /
                              summary.total_leads) *
                            100
                          : 0
                      }%`,
                      minWidth: 100,
                      height: 8,
                      backgroundColor: "primary.main",
                      borderRadius: 1,
                    }}
                  />
                  <Chip
                    label={
                      charts?.by_type?.international?.toLocaleString() || 0
                    }
                    color="primary"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Assignment Status
            </Typography>
            <Box mt={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="body1">Assigned</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: `${
                        summary?.total_leads
                          ? (charts?.assignment_status?.assigned /
                              summary.total_leads) *
                            100
                          : 0
                      }%`,
                      minWidth: 100,
                      height: 8,
                      backgroundColor: "success.main",
                      borderRadius: 1,
                    }}
                  />
                  <Chip
                    label={
                      charts?.assignment_status?.assigned?.toLocaleString() || 0
                    }
                    color="success"
                    size="small"
                  />
                </Box>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Unassigned</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: `${
                        summary?.total_leads
                          ? (charts?.assignment_status?.unassigned /
                              summary.total_leads) *
                            100
                          : 0
                      }%`,
                      minWidth: 100,
                      height: 8,
                      backgroundColor: "warning.main",
                      borderRadius: 1,
                    }}
                  />
                  <Chip
                    label={
                      charts?.assignment_status?.unassigned?.toLocaleString() ||
                      0
                    }
                    color="warning"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Analytics */}
      <Grid container spacing={3}>
        {/* Top Countries */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ListCard
            title="Top Countries"
            items={
              charts?.by_country?.map((item: any) => ({
                label: item.country,
                value: item.count,
              })) || []
            }
            icon={<Language color="primary" />}
            emptyMessage="No country data available"
          />
        </Grid>

        {/* Top Sources */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ListCard
            title="Top Sources"
            items={
              charts?.by_source?.map((item: any) => ({
                label: item.source,
                value: item.count,
              })) || []
            }
            icon={<SourceIcon color="secondary" />}
            emptyMessage="No source data available"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeadExecutiveDashboard;

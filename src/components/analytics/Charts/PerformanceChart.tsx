import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Avatar,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as StableIcon,
} from "@mui/icons-material";

interface PerformanceData {
  salesperson: string;
  leads_handled: number;
  conversions_achieved: number;
  conversion_rate: number;
  avg_response_time_hours: number;
  follow_ups_completed: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

type ChartView = "overview" | "conversion" | "response_time" | "followups";

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const theme = useTheme();
  const [chartView, setChartView] = useState<ChartView>("overview");

  if (!data || data.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={400}
      >
        <Typography color="textSecondary">
          No performance data available
        </Typography>
      </Box>
    );
  }

  // Sort data by conversion rate for better visualization
  const sortedData = [...data].sort(
    (a, b) => b.conversion_rate - a.conversion_rate
  );

  // Calculate team averages
  const teamStats = {
    avgConversionRate: Number(
      (
        data.reduce((acc, curr) => acc + curr.conversion_rate, 0) / data.length
      ).toFixed(2)
    ),
    avgResponseTime: Number(
      (
        data.reduce((acc, curr) => acc + curr.avg_response_time_hours, 0) /
        data.length
      ).toFixed(2)
    ),
    totalLeads: data.reduce((acc, curr) => acc + curr.leads_handled, 0),
    totalConversions: data.reduce(
      (acc, curr) => acc + curr.conversions_achieved,
      0
    ),
    totalFollowups: data.reduce(
      (acc, curr) => acc + curr.follow_ups_completed,
      0
    ),
  };

  const getPerformanceTrend = (value: number, average: number) => {
    const threshold = 5; // 5% threshold for determining trend
    if (value > average * (1 + threshold / 100)) return "up";
    if (value < average * (1 - threshold / 100)) return "down";
    return "stable";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUpIcon sx={{ color: "success.main", fontSize: 16 }} />;
      case "down":
        return <TrendingDownIcon sx={{ color: "error.main", fontSize: 16 }} />;
      default:
        return <StableIcon sx={{ color: "text.secondary", fontSize: 16 }} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "success";
      case "down":
        return "error";
      default:
        return "default";
    }
  };

  const chartConfigs = {
    overview: {
      title: "Team Performance Overview",
      dataKey: "conversion_rate",
      color: theme.palette.primary.main,
      formatter: (value: any) => [`${value}%`, "Conversion Rate"],
    },
    conversion: {
      title: "Conversion Analysis",
      dataKey: "conversions_achieved",
      color: theme.palette.success.main,
      formatter: (value: any) => [value, "Conversions"],
    },
    response_time: {
      title: "Response Time Performance",
      dataKey: "avg_response_time_hours",
      color: theme.palette.warning.main,
      formatter: (value: any) => [`${value}h`, "Avg Response Time"],
    },
    followups: {
      title: "Follow-up Completion",
      dataKey: "follow_ups_completed",
      color: theme.palette.info.main,
      formatter: (value: any) => [value, "Follow-ups"],
    },
  };

  const currentConfig = chartConfigs[chartView];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          <Typography variant="body2">
            Leads Handled: {data.leads_handled}
          </Typography>
          <Typography variant="body2">
            Conversions: {data.conversions_achieved}
          </Typography>
          <Typography variant="body2">
            Conversion Rate: {data.conversion_rate}%
          </Typography>
          <Typography variant="body2">
            Response Time: {data.avg_response_time_hours}h
          </Typography>
          <Typography variant="body2">
            Follow-ups: {data.follow_ups_completed}
          </Typography>
        </Card>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Team Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Team Avg Conversion
              </Typography>
              <Typography variant="h5">
                {teamStats.avgConversionRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Total Conversions
              </Typography>
              <Typography variant="h5">{teamStats.totalConversions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Avg Response Time
              </Typography>
              <Typography variant="h5">{teamStats.avgResponseTime}h</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Total Follow-ups
              </Typography>
              <Typography variant="h5">{teamStats.totalFollowups}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart View Selector and Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">{currentConfig.title}</Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Chart View</InputLabel>
              <Select
                value={chartView}
                onChange={(e) => setChartView(e.target.value as ChartView)}
                label="Chart View"
              >
                <MenuItem value="overview">Performance Overview</MenuItem>
                <MenuItem value="conversion">Conversion Analysis</MenuItem>
                <MenuItem value="response_time">Response Time</MenuItem>
                <MenuItem value="followups">Follow-up Completion</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="salesperson"
                  stroke="#666"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={currentConfig.dataKey}
                  fill={currentConfig.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Detailed Performance Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Performance Metrics
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Salesperson</TableCell>
                  <TableCell align="center">Leads</TableCell>
                  <TableCell align="center">Conversions</TableCell>
                  <TableCell align="center">Rate</TableCell>
                  <TableCell align="center">Response Time</TableCell>
                  <TableCell align="center">Follow-ups</TableCell>
                  <TableCell align="center">Performance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((person, index) => {
                  const conversionTrend = getPerformanceTrend(
                    person.conversion_rate,
                    teamStats.avgConversionRate
                  );
                  const responseTrend = getPerformanceTrend(
                    teamStats.avgResponseTime,
                    person.avg_response_time_hours
                  ); // Inverted - lower is better

                  return (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{ width: 32, height: 32, mr: 2, fontSize: 14 }}
                          >
                            {person.salesperson.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {person.salesperson}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {person.leads_handled}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {person.conversions_achieved}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {person.conversion_rate}%
                          </Typography>
                          {getTrendIcon(conversionTrend)}
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(person.conversion_rate, 100)}
                          sx={{
                            width: 60,
                            height: 4,
                            mt: 0.5,
                            backgroundColor: "grey.200",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor:
                                conversionTrend === "up"
                                  ? "success.main"
                                  : conversionTrend === "down"
                                  ? "error.main"
                                  : "primary.main",
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {person.avg_response_time_hours}h
                          </Typography>
                          {getTrendIcon(responseTrend)}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {person.follow_ups_completed}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={
                            person.conversion_rate >=
                            teamStats.avgConversionRate * 1.1
                              ? "High"
                              : person.conversion_rate >=
                                teamStats.avgConversionRate * 0.9
                              ? "Average"
                              : "Below Avg"
                          }
                          color={
                            person.conversion_rate >=
                            teamStats.avgConversionRate * 1.1
                              ? "success"
                              : person.conversion_rate >=
                                teamStats.avgConversionRate * 0.9
                              ? "default"
                              : "error"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PerformanceChart;

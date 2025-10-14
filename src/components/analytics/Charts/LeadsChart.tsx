import React from "react";
import { Box, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface LeadsChartProps {
  data: Array<{ date: string; leads: number }>;
}

const LeadsChart: React.FC<LeadsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={300}
      >
        <Typography color="textSecondary">No data available</Typography>
      </Box>
    );
  }

  // Format the data for the chart
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <Box sx={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#666" fontSize={12} />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--mui-palette-background-paper)",
              border: "1px solid var(--mui-palette-divider)",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: any) => [value, "Leads"]}
          />
          <Area
            type="monotone"
            dataKey="leads"
            stroke="#1976d2"
            strokeWidth={2}
            fill="url(#colorLeads)"
            fillOpacity={0.6}
          />
          <defs>
            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LeadsChart;

import React from "react";
import { Box, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ConversionData {
  converted: number;
  invalid: number;
  active: number;
}

interface ConversionChartProps {
  data?: ConversionData;
}

const COLORS = {
  converted: "#4caf50",
  active: "#2196f3",
  invalid: "#f44336",
};

const ConversionChart: React.FC<ConversionChartProps> = ({ data }) => {
  if (
    !data ||
    (data.converted === 0 && data.invalid === 0 && data.active === 0)
  ) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={300}
      >
        <Typography color="textSecondary">
          No conversion data available
        </Typography>
      </Box>
    );
  }

  // Format data for the pie chart
  const chartData = [
    {
      name: "Converted",
      value: Number(data.converted) || 0,
      color: COLORS.converted,
      percentage: 0,
    },
    {
      name: "Active",
      value: Number(data.active) || 0,
      color: COLORS.active,
      percentage: 0,
    },
    {
      name: "Invalid",
      value: Number(data.invalid) || 0,
      color: COLORS.invalid,
      percentage: 0,
    },
  ].filter((item) => item.value > 0);

  // Calculate percentages
  const total = data.converted + data.active + data.invalid;
  chartData.forEach((item) => {
    item.percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>
            {data.payload.name}: {data.value}
          </p>
          <p style={{ margin: 0, color: "#666" }}>
            {data.payload.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Box sx={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={entry.color}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color, fontSize: "14px" }}>
                {value} ({entry.payload.value})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ConversionChart;

import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
  trend,
}) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" gutterBottom>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Typography
                variant="body2"
                color={trend.isPositive ? "success.main" : "error.main"}
                sx={{ mt: 1 }}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              color: `${color}.main`,
              backgroundColor: `${color}.light`,
              borderRadius: "50%",
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;

import React from "react";
import { Box, Skeleton, Typography } from "@mui/material";

interface LoadingSkeletonProps {
  message?: string;
  variant?:
    | "text"
    | "rectangular"
    | "circular"
    | "card"
    | "list"
    | "kpi"
    | "chart"
    | "dashboard"
    | "leads"
    | "task"
    | "followups"
    | "user";
  fullScreen?: boolean;
  rows?: number;
  width?: string | number;
  height?: string | number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  message,
  variant = "rectangular",
  fullScreen = false,
  rows = 3,
  width = "100%",
  height = 40,
}) => {
  const renderSkeletonContent = () => {
    switch (variant) {
      case "dashboard":
        return (
          <Box sx={{ p: 3, minHeight: "100vh" }}>
            {/* Header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Skeleton variant="text" width={200} height={40} />
              <Box display="flex" gap={2}>
                <Skeleton
                  variant="rectangular"
                  width={150}
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  width={150}
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </Box>

            {/* KPI Cards Row */}
            <Box
              display="grid"
              gridTemplateColumns="repeat(4, 1fr)"
              gap={2}
              mb={3}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <Box key={index} p={2} sx={{ borderRadius: 2 }}>
                  <Box
                    display="flex"
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <Box flex={1}>
                      <Skeleton
                        variant="text"
                        width="70%"
                        height={20}
                        sx={{ mb: 1 }}
                      />
                      <Skeleton
                        variant="text"
                        width="40%"
                        height={48}
                        sx={{ mb: 1 }}
                      />
                      <Skeleton variant="text" width="50%" height={16} />
                    </Box>
                    <Skeleton variant="circular" width={56} height={56} />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Quick Actions */}
            <Box mb={3}>
              <Skeleton
                variant="text"
                width={150}
                height={32}
                sx={{ mb: 2 }}
              />
              <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    height={60}
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Box>
            </Box>

            {/* Charts Row */}
            <Box display="grid" gridTemplateColumns="2fr 1fr" gap={2}>
              <Box p={3} sx={{ borderRadius: 2 }}>
                <Skeleton
                  variant="text"
                  width="30%"
                  height={32}
                  sx={{ mb: 3 }}
                />
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={350}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
              <Box p={3} sx={{ borderRadius: 2 }}>
                <Skeleton
                  variant="text"
                  width="50%"
                  height={32}
                  sx={{ mb: 3 }}
                />
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height={350}
                >
                  <Skeleton
                    variant="circular"
                    width={280}
                    height={280}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        );

      case "leads":
        return (
          <Box sx={{p: 3, minHeight: "100vh",width: "100%" }}>
            {/* Table */}
            <Box sx={{borderRadius: 2, overflow: "hidden" }}>
              {/* Table Header */}
              <Box
                display="grid"
                gridTemplateColumns="2fr 1.5fr 1fr 1fr 1fr 1fr"
                gap={2}
                p={2}
                sx={{borderBottom: "1px solid #e0e0e0" }}
              >
                {["Name", "Email", "Phone", "Status", "Source", "Actions"].map(
                  (_, index) => (
                    <Skeleton
                      key={index}
                      variant="text"
                      width="70%"
                      height={20}
                    />
                  )
                )}
              </Box>

              {/* Table Rows */}
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <Box
                  key={rowIndex}
                  display="grid"
                  gridTemplateColumns="2fr 1.5fr 1fr 1fr 1fr 1fr"
                  gap={2}
                  p={2}
                >
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="90%" height={20} />
                  <Skeleton variant="text" width="70%" height={20} />
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={24}
                    sx={{ borderRadius: 3 }}
                  />
                  <Skeleton variant="text" width="60%" height={20} />
                  <Box display="flex" gap={1}>
                    <Skeleton
                      variant="rectangular"
                      width={50}
                      height={28}
                      sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={60}
                      height={28}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Pagination */}
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={2}
              mt={2}
            >
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton
                variant="rectangular"
                width={60}
                height={32}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          </Box>
        );

      case "task":
        return (
          <Box sx={{p: 3, minHeight: "100vh", width: "100%" }}>

            {/* Table */}
            <Box sx={{borderRadius: 2, overflow: "hidden" }}>
              {/* Table Header */}
              <Box
                display="grid"
                gridTemplateColumns="2fr 1fr 1fr 1fr 1.5fr 1fr"
                gap={2}
                p={2}
                sx={{borderBottom: "1px solid #e0e0e0" }}
              >
                {[
                  "Task",
                  "Due Date",
                  "Priority",
                  "Status",
                  "Assigned To",
                  "Actions",
                ].map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="text"
                    width="60%"
                    height={20}
                  />
                ))}
              </Box>

              {/* Table Rows */}
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <Box
                  key={rowIndex}
                  display="grid"
                  gridTemplateColumns="2fr 1fr 1fr 1fr 1.5fr 1fr"
                  gap={2}
                  p={2}
                  sx={{ borderBottom: "1px solid #f0f0f0" }}
                >
                  <Box>
                    <Skeleton
                      variant="text"
                      width="70%"
                      height={20}
                      sx={{ mb: 0.5 }}
                    />
                    <Skeleton variant="text" width="50%" height={16} />
                  </Box>
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton
                    variant="rectangular"
                    width={60}
                    height={24}
                    sx={{ borderRadius: 3 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={70}
                    height={24}
                    sx={{ borderRadius: 3 }}
                  />
                  <Skeleton variant="text" width="75%" height={20} />
                  <Box display="flex" gap={1}>
                    <Skeleton
                      variant="rectangular"
                      width={45}
                      height={28}
                      sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={55}
                      height={28}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Pagination */}
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={2}
              mt={2}
            >
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton
                variant="rectangular"
                width={60}
                height={32}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          </Box>
        );

      case "followups":
        return (
          <Box sx={{p: 3, minHeight: "100vh" }}>
            {/* Header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Skeleton variant="text" width={220} height={40} />
              <Box display="flex" gap={2}>
                <Skeleton
                  variant="rectangular"
                  width={40}
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  width={160}
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </Box>

            {/* Tabs */}
            <Box
              display="flex"
              gap={3}
              mb={3}
              borderBottom="1px solid #e0e0e0"
              pb={1}
            >
              {["SCHEDULED", "COMPLETED", "OVERDUE"].map((_, index) => (
                <Skeleton key={index} variant="text" width={100} height={24} />
              ))}
            </Box>

            {/* Table */}
            <Box sx={{ bgcolor: "white", borderRadius: 2, overflow: "hidden" }}>
              {/* Table Header */}
              <Box
                display="grid"
                gridTemplateColumns="2fr 1.5fr 1.5fr 1fr 1fr"
                gap={2}
                p={2}
                sx={{ bgcolor: "#fafafa", borderBottom: "1px solid #e0e0e0" }}
              >
                {[
                  "Lead",
                  "Scheduled For",
                  "Assigned To",
                  "Status",
                  "Actions",
                ].map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="text"
                    width="70%"
                    height={20}
                  />
                ))}
              </Box>

              {/* Table Rows */}
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <Box
                  key={rowIndex}
                  display="grid"
                  gridTemplateColumns="2fr 1.5fr 1.5fr 1fr 1fr"
                  gap={2}
                  p={2}
                  sx={{ borderBottom: "1px solid #f0f0f0" }}
                >
                  <Box>
                    <Skeleton
                      variant="text"
                      width="65%"
                      height={20}
                      sx={{ mb: 0.5 }}
                    />
                    <Skeleton variant="text" width="50%" height={16} />
                  </Box>
                  <Skeleton variant="text" width="85%" height={20} />
                  <Skeleton variant="text" width="70%" height={20} />
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={24}
                    sx={{ borderRadius: 3 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={60}
                    height={28}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Box>

            {/* Pagination */}
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={2}
              mt={2}
            >
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton
                variant="rectangular"
                width={60}
                height={32}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          </Box>
        );

      case "user":
        return (
          <Box sx={{minHeight: "100vh", width: "100%" }}>
            {/* Table */}
            <Box sx={{borderRadius: 2, overflow: "hidden" }}>
              {/* Table Header */}
              <Box
                display="grid"
                gridTemplateColumns="2fr 1fr 1fr 1fr 1fr"
                gap={2}
                p={2}
                sx={{ borderBottom: "1px solid #e0e0e0" }}
              >
                {["Name", "Role", "Phone", "Status", "Actions"].map(
                  (_, index) => (
                    <Skeleton
                      key={index}
                      variant="text"
                      width="60%"
                      height={20}
                    />
                  )
                )}
              </Box>

              {/* Table Rows */}
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <Box
                  key={rowIndex}
                  display="grid"
                  gridTemplateColumns="2fr 1fr 1fr 1fr 1fr"
                  gap={2}
                  p={2}
                  sx={{ borderBottom: "1px solid #f0f0f0" }}
                >
                  <Box>
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={20}
                      sx={{ mb: 0.5 }}
                    />
                    <Skeleton variant="text" width="70%" height={16} />
                  </Box>
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={24}
                    sx={{ borderRadius: 3 }}
                  />
                  <Skeleton variant="text" width="75%" height={20} />
                  <Box display="flex" alignItems="center" gap={1}>
                    <Skeleton
                      variant="rectangular"
                      width={60}
                      height={24}
                      sx={{ borderRadius: 3 }}
                    />
                    <Skeleton variant="circular" width={24} height={24} />
                  </Box>
                  <Box display="flex" gap={1}>
                    <Skeleton
                      variant="rectangular"
                      width={45}
                      height={28}
                      sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={55}
                      height={28}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Pagination */}
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={2}
              mt={2}
            >
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton
                variant="rectangular"
                width={60}
                height={32}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          </Box>
        );

      case "text":
        return (
          <Box>
            {Array.from({ length: rows }).map((_, index) => (
              <Skeleton
                key={index}
                variant="text"
                width={index === rows - 1 ? "60%" : width}
                height={height}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        );

      case "circular":
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <Skeleton variant="circular" width={60} height={60} />
            <Box flex={1}>
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="60%" height={16} />
            </Box>
          </Box>
        );

      case "card":
        return (
          <Box>
            <Skeleton
              variant="rectangular"
              width={width}
              height={200}
              sx={{ mb: 2 }}
            />
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        );

      case "kpi":
        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={2}
          >
            <Box flex={1}>
              <Skeleton variant="text" width="70%" height={16} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={32} />
            </Box>
            <Skeleton variant="circular" width={48} height={48} />
          </Box>
        );

      case "chart":
        return (
          <Box>
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={300} />
          </Box>
        );

      case "list":
        return (
          <Box>
            {Array.from({ length: rows }).map((_, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                gap={2}
                mb={2}
              >
                <Skeleton variant="circular" width={40} height={40} />
                <Box flex={1}>
                  <Skeleton variant="text" width="70%" height={20} />
                  <Skeleton variant="text" width="50%" height={16} />
                </Box>
              </Box>
            ))}
          </Box>
        );

      case "rectangular":
      default:
        return (
          <Box>
            {Array.from({ length: rows }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                width={width}
                height={height}
                sx={{ mb: 2 }}
              />
            ))}
          </Box>
        );
    }
  };

  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      p={2}
    >
      {renderSkeletonContent()}
      {message && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="background.paper"
        zIndex={9999}
        overflow="auto"
      >
        <Box width="100%" height="100%">
          {renderSkeletonContent()}
          {message && (
            <Typography
              variant="body2"
              color="textSecondary"
              textAlign="center"
              sx={{
                mt: 3,
                position: "absolute",
                bottom: 20,
                left: 0,
                right: 0,
              }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return content;
};

export default LoadingSkeleton;

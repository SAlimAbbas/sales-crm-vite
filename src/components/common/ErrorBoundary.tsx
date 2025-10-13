import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={3}
        >
          <Paper
            elevation={3}
            sx={{ p: 4, maxWidth: 500, textAlign: "center" }}
          >
            <Typography variant="h4" color="error" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              We apologize for the inconvenience. Please try refreshing the
              page.
            </Typography>
            {this.state.error && (
              <Typography
                variant="body2"
                sx={{
                  bgcolor: "grey.100",
                  p: 2,
                  borderRadius: 1,
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  mb: 3,
                }}
              >
                {this.state.error.toString()}
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              size="large"
            >
              Refresh Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
  Divider,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Campaign as CampaignIcon,
  KeyboardArrowDown as MinimizeIcon,
  KeyboardArrowUp as ExpandIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import {
  announcementService,
  Announcement,
} from "../../services/announcementService";
import { useAuth } from "../../contexts/AuthContext";
import { format } from "date-fns";

const TYPE_COLOR_MAP: Record<string, "info" | "warning" | "success" | "error"> =
  {
    info: "info",
    warning: "warning",
    success: "success",
    error: "error",
  };

const MINIMIZED_STORAGE_KEY = "announcements_minimized";
const getDismissedKey = (id: number) => `announcement_dismissed_${id}`;

export const isAnnouncementDismissed = (id: number): boolean => {
  return localStorage.getItem(getDismissedKey(id)) === "true";
};

export const dismissAnnouncement = (id: number) => {
  localStorage.setItem(getDismissedKey(id), "true");
};

const AnnouncementBanner: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, forceUpdate] = useState(0);

  const { data } = useQuery<any>({
    queryKey: ["my-announcements"],
    queryFn: () => announcementService.getMyAnnouncements(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });

  const allAnnouncements: Announcement[] = data?.data ?? [];

  // Filter out dismissed announcements
  const activeUndismissed = allAnnouncements.filter(
    (a) => !isAnnouncementDismissed(a.id)
  );

  // Initialize visibility on load / when data changes
  useEffect(() => {
    // Admin should not receive the auto-popup modal
    if (user?.role === "admin") {
      setOpen(false);
      setMinimized(false);
      return;
    }

    if (activeUndismissed.length > 0) {
      const isMinimized = localStorage.getItem(MINIMIZED_STORAGE_KEY) === "true";
      if (isMinimized) {
        setMinimized(true);
        setOpen(false);
      } else {
        setOpen(true);
        setMinimized(false);
      }
    } else {
      setOpen(false);
      setMinimized(false);
    }
  }, [activeUndismissed.length, user?.role]);

  // If user is admin or no active undismissed announcements, do not render banner
  if (user?.role === "admin" || activeUndismissed.length === 0) {
    return null;
  }

  const current = activeUndismissed[currentIndex] ?? activeUndismissed[0];

  const handleMinimize = () => {
    setOpen(false);
    setMinimized(true);
    localStorage.setItem(MINIMIZED_STORAGE_KEY, "true");
  };

  const handleExpand = () => {
    setMinimized(false);
    setOpen(true);
    localStorage.removeItem(MINIMIZED_STORAGE_KEY);
  };

  const handleDismissCurrent = () => {
    dismissAnnouncement(current.id);
    const remaining = activeUndismissed.filter((a) => a.id !== current.id);
    if (remaining.length === 0) {
      setOpen(false);
      setMinimized(false);
      localStorage.removeItem(MINIMIZED_STORAGE_KEY);
    } else {
      setCurrentIndex(0);
    }
    forceUpdate((n) => n + 1);
  };

  const handlePrev = () =>
    setCurrentIndex(
      (i) => (i - 1 + activeUndismissed.length) % activeUndismissed.length
    );

  const handleNext = () =>
    setCurrentIndex((i) => (i + 1) % activeUndismissed.length);

  return (
    <>
      {/* Minimized Bottom Strip */}
      {minimized && (
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 1,
            borderRadius: "12px 12px 0 0",
            background:
              current.type === "warning"
                ? "#fff8e1"
                : current.type === "error"
                  ? "#ffebee"
                  : current.type === "success"
                    ? "#e8f5e9"
                    : "#e3f2fd",
            borderTop: "3px solid",
            borderColor:
              current.type === "warning"
                ? "warning.main"
                : current.type === "error"
                  ? "error.main"
                  : current.type === "success"
                    ? "success.main"
                    : "info.main",
            cursor: "pointer",
            minWidth: 280,
            maxWidth: 550,
            boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
          }}
          onClick={handleExpand}
        >
          <CampaignIcon color={TYPE_COLOR_MAP[current.type]} fontSize="small" />
          <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
            {current.title}
          </Typography>
          {activeUndismissed.length > 1 && (
            <Chip
              label={`${activeUndismissed.length} announcements`}
              size="small"
              color={TYPE_COLOR_MAP[current.type]}
              variant="outlined"
            />
          )}
          <ExpandIcon fontSize="small" />
        </Paper>
      )}

      {/* Full Modal Banner */}
      <Dialog
        open={open}
        onClose={handleMinimize}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, overflow: "hidden" },
        }}
      >
        {/* Colored top accent bar */}
        <Box
          sx={{
            height: 6,
            bgcolor:
              current.type === "warning"
                ? "warning.main"
                : current.type === "error"
                  ? "error.main"
                  : current.type === "success"
                    ? "success.main"
                    : "info.main",
          }}
        />

        <DialogTitle sx={{ pb: 1, pt: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <CampaignIcon color={TYPE_COLOR_MAP[current.type]} fontSize="medium" />
            <Box flex={1}>
              <Typography variant="h6" fontWeight={700}>
                {current.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Valid until {format(new Date(current.end_date), "MMM dd, yyyy")}
              </Typography>
            </Box>

            {/* Pagination if multiple announcements */}
            {activeUndismissed.length > 1 && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <IconButton size="small" onClick={handlePrev}>
                  <PrevIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" fontWeight={600}>
                  {currentIndex + 1}/{activeUndismissed.length}
                </Typography>
                <IconButton size="small" onClick={handleNext}>
                  <NextIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Minimize button */}
            <Tooltip title="Minimize to bottom strip">
              <IconButton size="small" onClick={handleMinimize}>
                <MinimizeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2, pb: 2 }}>
          <Alert
            severity={TYPE_COLOR_MAP[current.type]}
            icon={false}
            sx={{ mb: 0, borderRadius: 1.5 }}
          >
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {current.description}
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: "space-between" }}>
          <Button
            size="small"
            color="inherit"
            variant="text"
            onClick={handleDismissCurrent}
            sx={{ color: "text.secondary" }}
          >
            Dismiss
          </Button>
          <Button
            variant="contained"
            color={TYPE_COLOR_MAP[current.type]}
            onClick={handleMinimize}
            startIcon={<MinimizeIcon />}
          >
            Minimize
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AnnouncementBanner;

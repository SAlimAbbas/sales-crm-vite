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
} from "@mui/material";
import {
  Campaign as CampaignIcon,
  KeyboardArrowDown as MinimizeIcon,
  KeyboardArrowUp as ExpandIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import {
  announcementService,
  Announcement,
} from "../../services/announcementService";
import { format } from "date-fns";

// ── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLOR_MAP: Record<string, "info" | "warning" | "success" | "error"> =
  {
    info: "info",
    warning: "warning",
    success: "success",
    error: "error",
  };

const SESSION_KEY = "announcements_minimized";

// ── Dismissed helpers (localStorage + 10 AM reset) ───────────────────────────

const getDismissedKey = (id: number) => `announcement_dismissed_${id}`;

const isDismissedToday = (id: number): boolean => {
  const stored = localStorage.getItem(getDismissedKey(id));
  if (!stored) return false;

  const dismissedAt = new Date(stored); 
  const now = new Date();

  const todayAt10AM = new Date();
  todayAt10AM.setHours(10, 0, 0, 0); 

  if (dismissedAt < todayAt10AM && now >= todayAt10AM) return false;

  return dismissedAt >= todayAt10AM;
};

const dismissForToday = (id: number) => {
  const now = new Date();
  // Store as locale string so it reflects the user's local time (IST)
  localStorage.setItem(
    getDismissedKey(id),
    now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const AnnouncementBanner: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, forceUpdate] = useState(0); // triggers re-render after dismiss

  const { data } = useQuery<any>({
    queryKey: ["my-announcements"],
    queryFn: () => announcementService.getMyAnnouncements(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // poll every 5 minutes
  });

  // Announcements filtered by today's dismiss state
  const allAnnouncements: Announcement[] = data?.data ?? [];
  const announcements = allAnnouncements.filter((a) => !isDismissedToday(a.id));

  // Auto-open modal when announcements arrive
  useEffect(() => {
    if (announcements.length > 0) {
      const wasMinimized = sessionStorage.getItem(SESSION_KEY) === "true";
      if (wasMinimized) {
        setMinimized(true);
      } else {
        setOpen(true);
      }
    }
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex] ?? announcements[0];

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleMinimize = () => {
    setOpen(false);
    setMinimized(true);
    sessionStorage.setItem(SESSION_KEY, "true");
  };

  const handleExpand = () => {
    setMinimized(false);
    setOpen(true);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const handleDismissCurrent = () => {
    dismissForToday(current.id);
    const remaining = announcements.filter((a) => a.id !== current.id);
    if (remaining.length === 0) {
      setOpen(false);
      setMinimized(false);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      setCurrentIndex(0);
    }
    forceUpdate((n) => n + 1); // re-render so filter picks up localStorage change
  };

  const handlePrev = () =>
    setCurrentIndex(
      (i) => (i - 1 + announcements.length) % announcements.length,
    );

  const handleNext = () =>
    setCurrentIndex((i) => (i + 1) % announcements.length);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Minimized Strip */}
      {minimized && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 3,
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
            maxWidth: 500,
          }}
          onClick={handleExpand}
        >
          <CampaignIcon color={TYPE_COLOR_MAP[current.type]} fontSize="small" />
          <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
            {current.title}
          </Typography>
          {announcements.length > 1 && (
            <Chip
              label={`${announcements.length} announcements`}
              size="small"
              color={TYPE_COLOR_MAP[current.type]}
              variant="outlined"
            />
          )}
          <ExpandIcon fontSize="small" />
        </Paper>
      )}

      {/* Full Modal */}
      <Dialog
        open={open}
        onClose={() => {}} // disabled — only minimize or dismiss can close
        disableEscapeKeyDown // prevent Escape key closing
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, overflow: "visible" },
        }}
      >
        {/* Colored top accent bar */}
        <Box
          sx={{
            height: 6,
            borderRadius: "8px 8px 0 0",
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

        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CampaignIcon color={TYPE_COLOR_MAP[current.type]} />
            <Box flex={1}>
              <Typography variant="h6" fontWeight={700}>
                {current.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Valid until {format(new Date(current.end_date), "MMM dd, yyyy")}
              </Typography>
            </Box>

            {/* Pagination if multiple announcements */}
            {announcements.length > 1 && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <IconButton size="small" onClick={handlePrev}>
                  <PrevIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption">
                  {currentIndex + 1}/{announcements.length}
                </Typography>
                <IconButton size="small" onClick={handleNext}>
                  <NextIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Minimize button */}
            <IconButton size="small" onClick={handleMinimize} title="Minimize">
              <MinimizeIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2 }}>
          <Alert
            severity={TYPE_COLOR_MAP[current.type]}
            icon={false}
            sx={{ mb: 0, borderRadius: 1.5 }}
          >
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {current.description}
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
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

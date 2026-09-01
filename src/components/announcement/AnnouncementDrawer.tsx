import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Card,
  CardContent,
  Stack,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  Campaign as CampaignIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { Announcement } from "../../services/announcementService";
import { format } from "date-fns";

interface AnnouncementDrawerProps {
  open: boolean;
  onClose: () => void;
  announcements: Announcement[];
}

const TYPE_CONFIG: Record<
  string,
  { label: string; color: "info" | "warning" | "success" | "error" }
> = {
  info: { label: "Information", color: "info" },
  warning: { label: "Warning", color: "warning" },
  success: { label: "Success", color: "success" },
  error: { label: "Alert", color: "error" },
};

const AnnouncementDrawer: React.FC<AnnouncementDrawerProps> = ({
  open,
  onClose,
  announcements,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400 },
          p: 0,
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2.5}
        bgcolor="primary.main"
        color="primary.contrastText"
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <CampaignIcon fontSize="medium" />
          <Typography variant="h6" fontWeight={700}>
            Announcements
          </Typography>
        </Box>
        <IconButton color="inherit" size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Announcements Count / Subtitle */}
      <Box px={2.5} py={1.5} bgcolor="action.hover">
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {announcements.length > 0
            ? `${announcements.length} active announcement${
                announcements.length > 1 ? "s" : ""
              } for you`
            : "No active announcements"}
        </Typography>
      </Box>

      <Divider />

      {/* Drawer Body */}
      <Box p={2.5} sx={{ overflowY: "auto", flex: 1 }}>
        {announcements.length === 0 ? (
          <Box
            textAlign="center"
            py={8}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1.5}
          >
            <CampaignIcon sx={{ fontSize: 56, color: "text.disabled" }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              No announcements right now
            </Typography>
            <Typography variant="caption" color="text.disabled">
              When new company announcements are posted, they will appear here.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {announcements.map((a) => {
              const typeCfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.info;

              return (
                <Card
                  key={a.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderLeft: "4px solid",
                    borderLeftColor: `${typeCfg.color}.main`,
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={1}
                    >
                      <Typography variant="subtitle1" fontWeight={700}>
                        {a.title}
                      </Typography>
                      <Chip
                        label={typeCfg.label}
                        color={typeCfg.color}
                        size="small"
                        sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                      />
                    </Box>

                    <Alert
                      severity={typeCfg.color}
                      icon={false}
                      sx={{
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: 1,
                        bgcolor: "background.default",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
                      >
                        {a.description}
                      </Typography>
                    </Alert>

                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mt={1}
                    >
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <EventIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Until {format(new Date(a.end_date), "MMM dd, yyyy")}
                        </Typography>
                      </Box>

                      {a.creator?.name && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                        >
                          By {a.creator.name}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};

export default AnnouncementDrawer;

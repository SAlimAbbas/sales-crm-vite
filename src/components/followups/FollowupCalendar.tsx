import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useQuery } from "@tanstack/react-query";
import { followupService } from "../../services/followupService";
// import { useNotification } from "../../contexts/NotificationContext";
import { Followup } from "../../types";
import { Close as CloseIcon } from "@mui/icons-material";

const localizer = momentLocalizer(moment);

interface CalendarEvent extends Event {
  followup: Followup;
}
interface FollowupCalendarProps {
  onRefresh?: () => void;
}

const FollowupCalendar: React.FC<FollowupCalendarProps> = ({ onRefresh }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null | undefined>(
    null
  );
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  // const { showNotification } = useNotification();

  const { data: followups } = useQuery<any>({
    queryKey: ["calendar-followups"],
    queryFn: () => followupService.getFollowups({ per_page: 100 }),
  });

  const events: CalendarEvent[] = (followups?.data || [])
    .filter((followup: any) => !followup.is_completed)
    .map((followup: any) => ({
      title: followup.lead?.company_name || "Unknown Company",
      start: new Date(followup.scheduled_at),
      end: new Date(new Date(followup.scheduled_at).getTime() + 30 * 60000), // 30 minutes duration
      allDay: false,
      followup: followup,
      resource: {
        status: followup.is_overdue ? "overdue" : "scheduled",
        lead: followup.lead,
      },
    }));

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = event.followup.is_overdue ? "#f44336" : "#2196f3";

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvents([event]);
    setSelectedDate(event?.start);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedEvents(
      events.filter((event) =>
        moment(event.start).isSame(slotInfo.start, "day")
      )
    );
    setSelectedDate(slotInfo.start);
  };

  const handleCloseDialog = () => {
    setSelectedEvents([]);
    setSelectedDate(null);
  };

  const formatTime = (date: Date) => {
    return moment(date).format("h:mm A");
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Calendar
      </Typography>

      <Paper sx={{ p: 3, height: "70vh" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          views={["month", "week", "day", "agenda"]}
          defaultView="week"
          step={30}
          timeslots={2}
        />
      </Paper>

      <Dialog
        open={selectedDate !== null}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">
              Follow-ups on{" "}
              {selectedDate && moment(selectedDate).format("MMMM D, YYYY")}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedEvents.length === 0 ? (
            <Typography color="textSecondary">
              No reminders scheduled for this date
            </Typography>
          ) : (
            <List>
              {selectedEvents.map((event: any, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          {event.title}
                        </Typography>
                        <Chip
                          label={
                            event.followup.is_overdue ? "Overdue" : "Scheduled"
                          }
                          color={
                            event.followup.is_overdue ? "error" : "primary"
                          }
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box component="span">
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          component="span"
                          display="block"
                        >
                          Time: {formatTime(event.start)} -{" "}
                          {formatTime(event.end)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          component="span"
                          display="block"
                        >
                          Contact: {event.followup.lead?.contact_number} •{" "}
                          {event.followup.lead?.email}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          component="span"
                          display="block"
                        >
                          Assigned to: {event.followup.salesperson?.name}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FollowupCalendar;

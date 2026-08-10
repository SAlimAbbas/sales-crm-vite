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
  Divider,
  Tooltip,
} from "@mui/material";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Task } from "../../types";
import {
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon,
} from "@mui/icons-material";
import { formatDateTime, formatDate, canEditTask, isTaskCompletedOverdue } from "../../utils/helpers";
import { useAuth } from "../../contexts/AuthContext";

const localizer = momentLocalizer(moment);

interface TaskCalendarEvent extends Event {
  task: Task;
}

interface TaskCalendarProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, status: string) => void;
  loading?: boolean;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  loading = false,
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<TaskCalendarEvent[]>([]);

  const isOverdue = (task: Task) => {
    return new Date(task.due_date) < new Date() && task.status !== "completed";
  };

  const events: TaskCalendarEvent[] = tasks.map((task) => {
    const dueDateObj = new Date(task.due_date);
    const start = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate(), 9, 0, 0);
    const end = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate(), 10, 0, 0);

    return {
      title: task.title + (task.lead?.company_name ? ` (${task.lead.company_name})` : ""),
      start,
      end,
      allDay: false,
      task: task,
      resource: {
        status: isOverdue(task) ? "overdue" : task.status,
      },
    };
  });

  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
        display: "block",
        padding: "1px 0",
        margin: "1px 0",
      },
    };
  };

  const CustomEventComponent = ({ event }: { event: TaskCalendarEvent }) => {
    const task = event.task;
    const overdue = isOverdue(task);
    const wasCompletedLate = isTaskCompletedOverdue(task);

    let dotColor = "#ff9800"; // default pending: orange
    if (task.status === "completed") {
      dotColor = "#4caf50"; // green
    } else if (overdue || task.status === "overdue") {
      dotColor = "#f44336"; // red
    } else if (task.status === "in_progress") {
      dotColor = "#2196f3"; // blue
    }

    return (
      <Tooltip
        title={
          <Box p={0.5}>
            <Typography variant="subtitle2" fontWeight={700}>
              {task.title}
            </Typography>
            {task.lead?.company_name && (
              <Typography variant="caption" display="block">
                Lead: {task.lead.company_name}
              </Typography>
            )}
            <Typography variant="caption" display="block">
              Status: {task.status.toUpperCase()} {wasCompletedLate ? "(Late Completion)" : ""}
            </Typography>
          </Box>
        }
        arrow
      >
        <Box
          display="flex"
          alignItems="center"
          gap={0.6}
          sx={{
            width: "100%",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            py: 0.3,
            px: 0.8,
            borderRadius: "12px",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${dotColor}`,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
            },
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: dotColor,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            {task.title}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  const handleSelectEvent = (event: TaskCalendarEvent) => {
    setSelectedEvents([event]);
    setSelectedDate(event.start as Date);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    const dayEvents = events.filter((event) =>
      moment(event.start).isSame(slotInfo.start, "day")
    );
    setSelectedEvents(dayEvents);
    setSelectedDate(slotInfo.start);
  };

  const handleCloseDialog = () => {
    setSelectedEvents([]);
    setSelectedDate(null);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, height: "75vh" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          eventPropGetter={eventStyleGetter}
          components={{
            event: CustomEventComponent,
          }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          popup={true}
          views={["month", "week", "day", "agenda"]}
          defaultView="month"
          step={30}
          timeslots={2}
        />
      </Paper>

      <Dialog
        open={selectedDate !== null}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Tasks on {selectedDate && moment(selectedDate).format("MMMM D, YYYY")}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {selectedEvents.length === 0 ? (
            <Typography color="textSecondary">No tasks found for this date.</Typography>
          ) : (
            <List disablePadding>
              {selectedEvents.map((event, index) => {
                const task = event.task;
                const overdue = isOverdue(task);
                const statusDisplay = overdue ? "overdue" : task.status;
                const statusColor =
                  statusDisplay === "completed"
                    ? "success"
                    : statusDisplay === "in_progress"
                    ? "info"
                    : statusDisplay === "overdue"
                    ? "error"
                    : "warning";

                return (
                  <React.Fragment key={task.id || index}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <ListItem disableGutters alignItems="flex-start" sx={{ flexDirection: "column" }}>
                      <Box display="flex" justifyContent="space-between" width="100%" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {task.title}
                        </Typography>
                        <Box display="flex" gap={1} alignItems="center">
                          <Chip
                            label={statusDisplay.replace("_", " ").toUpperCase()}
                            color={statusColor as any}
                            size="small"
                          />
                          {isTaskCompletedOverdue(task) && (
                            <Chip
                              label="LATE COMPLETION"
                              color="error"
                              size="small"
                              variant="filled"
                              sx={{ height: 20, fontSize: 10, fontWeight: "bold" }}
                            />
                          )}
                          <Chip
                            label={task.priority.toUpperCase()}
                            variant="outlined"
                            size="small"
                            color={
                              task.priority === "high"
                                ? "error"
                                : task.priority === "medium"
                                ? "warning"
                                : "success"
                            }
                          />
                        </Box>
                      </Box>

                      {task.description && (
                        <Typography variant="body2" color="textSecondary" mb={1.5}>
                          {task.description}
                        </Typography>
                      )}

                      <GridContainer>
                        {/* Due Date */}
                        <Box display="flex" alignItems="center" gap={0.5} mr={3} mb={1}>
                          <ScheduleIcon fontSize="small" color={overdue ? "error" : "action"} />
                          <Typography variant="caption" color={overdue ? "error.main" : "textSecondary"}>
                            <strong>Due:</strong> {formatDateTime(task.due_date)}
                          </Typography>
                        </Box>

                        {/* Created Date */}
                        <Box display="flex" alignItems="center" gap={0.5} mr={3} mb={1}>
                          <CalendarTodayIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="textSecondary">
                            <strong>Created:</strong> {formatDateTime(task.created_at)}
                          </Typography>
                        </Box>

                        {/* Assigned To */}
                        {((task.assigned_users && task.assigned_users.length > 0) || task.assigned_user) && (
                          <Box display="flex" alignItems="center" gap={0.5} mr={3} mb={1} flexWrap="wrap">
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="textSecondary" mr={0.5}>
                              <strong>Assigned To:</strong>
                            </Typography>
                            {task.assigned_users && task.assigned_users.length > 0 ? (
                              task.assigned_users.map((au) => (
                                <Chip key={au.id} label={au.name} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                              ))
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                {task.assigned_user?.name}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* Related Lead */}
                        {task.lead && (
                          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                            <BusinessIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="textSecondary">
                              <strong>Lead:</strong> {task.lead.company_name}
                            </Typography>
                          </Box>
                        )}
                      </GridContainer>

                      {/* Action Buttons */}
                      <Box display="flex" gap={1} mt={1.5} justifyContent="flex-end" width="100%">
                        {task.status !== "completed" && onStatusChange && (
                          <Button
                            size="small"
                            color="success"
                            variant="outlined"
                            startIcon={<CompleteIcon />}
                            onClick={() => {
                              onStatusChange(task, "completed");
                              handleCloseDialog();
                            }}
                          >
                            Complete
                          </Button>
                        )}
                        {onEdit && canEditTask(task, user) && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => {
                              onEdit(task);
                              handleCloseDialog();
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                              onDelete(task);
                              handleCloseDialog();
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </Box>
                    </ListItem>
                  </React.Fragment>
                );
              })}
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

const GridContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box display="flex" flexWrap="wrap" width="100%">
    {children}
  </Box>
);

export default TaskCalendar;

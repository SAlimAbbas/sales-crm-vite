import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Checkbox,
  ListItemText,
  FormHelperText,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "../ui/CustomModal";
import FormInput from "../ui/FormElements/FormInput";
import FormSelect from "../ui/FormElements/FormSelect";
import FormDatePicker from "../ui/FormElements/FormDatePicker";
import { taskService } from "../../services/taskService";
import { userService } from "../../services/userService";
import { leadService } from "../../services/leadService";
import { Task, TaskFormData } from "../../types";
import { formatForDateInput } from "../../utils/helpers";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task | null;
  preSelectedLeadId?: number | null;
}

const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const getValidationSchema = (task?: Task | null) =>
  yup.object({
    title: yup.string().required("Title is required").max(255, "Title too long"),
    description: yup.string().required("Description is required"),
    due_date: yup
      .mixed()
      .required("Due date is required")
      .test("not-in-past", "Due date cannot be in the past", function (value) {
        if (!value) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let d: Date | null = null;
        if (typeof value === "string") {
          d = parseLocalDate(value);
        } else if (value instanceof Date) {
          d = new Date(value);
        }

        if (!d || isNaN(d.getTime())) return false;
        d.setHours(0, 0, 0, 0);

        // When editing an existing task, allow keeping its original due date
        if (task && task.due_date) {
          const origDate = parseLocalDate(task.due_date);
          if (origDate) {
            origDate.setHours(0, 0, 0, 0);
            if (d.getTime() === origDate.getTime()) {
              return true;
            }
          }
        }

        return d.getTime() >= today.getTime();
      }),
    priority: yup
      .string()
      .required("Priority is required")
      .oneOf(["low", "medium", "high"]),
    assigned_to: yup
      .array()
      .of(yup.string())
      .min(1, "At least one assigned user is required")
      .required("Assigned user is required"),
    lead_id: yup.number().nullable(),
  });

const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onClose,
  onSuccess,
  task,
  preSelectedLeadId,
}) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Fetch users based on role permissions (only active users)
  const { data: usersData, isLoading: loadingUsers } = useQuery<any>({
    queryKey: ["users-for-assignment"],
    queryFn: () => userService.getUsers({ per_page: 100, is_active: true }),
    enabled: open,
  });

  // Fetch leads
  const { data: leadsData, isLoading: loadingLeads } = useQuery<any>({
    queryKey: ["leads-for-tasks"],
    queryFn: () => leadService.getLeads({ per_page: 100 }),
    enabled: open,
  });

  const validationSchema = React.useMemo(() => getValidationSchema(task), [task]);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      due_date: getLocalDateString(),
      priority: "medium" as "low" | "medium" | "high",
      assigned_to: [] as string[],
      lead_id: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setLoading(true);
      setSubmitting(true);

      try {
        const formData: TaskFormData = {
          title: values.title,
          description: values.description,
          due_date: `${values.due_date} 23:59:59`,
          priority: values.priority,
          assigned_to: values.assigned_to.map((id) => Number(id)),
          lead_id: values.lead_id ? Number(values.lead_id) : null,
        };

        if (task) {
          await taskService.updateTask(task.id, formData);
        } else {
          await taskService.createTask(formData);
        }

        onSuccess();
      } catch (error: any) {
        console.error("Task form submission error:", error);

        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          Object.keys(errors).forEach((field) => {
            setFieldError(field, errors[field][0]);
          });
        } else {
          const errorMessage =
            error.response?.data?.message || "An error occurred";
          setFieldError("title", errorMessage);
        }
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  // Update form values when editing
  useEffect(() => {
    if (open && task) {
      const assignedArray = Array.isArray(task.assigned_to)
        ? task.assigned_to.map(String)
        : task.assigned_to
        ? [task.assigned_to.toString()]
        : [];

      formik.setValues({
        title: task.title,
        description: task.description,
        due_date: formatForDateInput(task.due_date),
        priority: task.priority,
        assigned_to: assignedArray,
        lead_id: task.lead_id ? task.lead_id.toString() : "",
      });
    } else if (open && !task) {
      formik.resetForm();
      if (
        currentUser?.role === "salesperson" ||
        currentUser?.role === "backend" ||
        currentUser?.role === "crm"
      ) {
        formik.setFieldValue("assigned_to", [currentUser.id.toString()]);
      } else {
        formik.setFieldValue("assigned_to", []);
      }
      if (preSelectedLeadId) {
        formik.setFieldValue("lead_id", preSelectedLeadId.toString());
      }
    }
  }, [open, task, currentUser, preSelectedLeadId]);

  // Filter users based on current user's role and permissions (only active users)
  const getAvailableUsers = () => {
    const rawList: any[] = (usersData?.data?.data || usersData?.data || []).filter(
      (u: any) => u.is_active === true || u.is_active === 1 || u.is_active === "1"
    );
    if (!rawList) return [];

    let filtered: any[] = [];
    if (currentUser?.role === "admin" || currentUser?.role === "manager_staff") {
      filtered = rawList;
    } else if (currentUser?.role === "manager") {
      filtered = rawList.filter(
        (user: any) =>
          user.manager_id === currentUser.id || user.id === currentUser.id
      );
    } else if (currentUser?.role === "crm") {
      filtered = rawList.filter(
        (user: any) =>
          user.id === currentUser.id ||
          user.role === "crm" ||
          user.email?.toLowerCase().trim() === "shikhar@exportersworlds.com"
      );
    } else {
      filtered = rawList.filter((user: any) => user.id === currentUser?.id);
    }

    if (task) {
      const assignedUsers = task.assigned_users || (task.assigned_user ? [task.assigned_user] : []);
      assignedUsers.forEach((au: any) => {
        if (!filtered.some((u: any) => String(u.id) === String(au.id))) {
          filtered.push(au);
        }
      });
      const assignedArray = Array.isArray(task.assigned_to)
        ? task.assigned_to.map(String)
        : task.assigned_to ? [String(task.assigned_to)] : [];
      assignedArray.forEach((id: string) => {
        if (!filtered.some((u: any) => String(u.id) === id)) {
          const found = rawList.find((u: any) => String(u.id) === id);
          if (found) filtered.push(found);
        }
      });
    }

    return filtered;
  };

  const availableUsers = getAvailableUsers();

  const priorityOptions = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" },
  ];

  const leadOptions = [
    { value: "", label: "None (Standalone Task)" },
    ...(leadsData?.data?.map((lead: any) => ({
      value: lead.id.toString(),
      label: `${lead.company_name} (${lead.contact_number})`,
    })) || []),
  ];

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={task ? "Edit Task" : "Create New Task"}
      actions={
        <Box display="flex" gap={1}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => formik.handleSubmit()}
            disabled={loading}
          >
            {task ? "Update Task" : "Create Task"}
          </Button>
        </Box>
      }
    >
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <FormInput
              label="Task Title"
              name="title"
              value={formik.values.title}
              onChange={(e: any) => formik.setFieldValue("title", e.target.value)}
              onBlur={formik.handleBlur}
              error={formik.touched.title ? formik.errors.title : undefined}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormInput
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={(e: any) => formik.setFieldValue("description", e.target.value)}
              onBlur={formik.handleBlur}
              error={
                formik.touched.description
                  ? formik.errors.description
                  : undefined
              }
              multiline
              rows={3}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormDatePicker
              label="Due Date"
              value={parseLocalDate(formik.values.due_date)}
              onChange={(date) =>
                formik.setFieldValue(
                  "due_date",
                  date && !isNaN(date.getTime()) ? getLocalDateString(date) : ""
                )
              }
              error={
                formik.touched.due_date && formik.errors.due_date
                  ? formik.errors.due_date
                  : undefined
              }
              required
              minDate={
                task
                  ? undefined
                  : (() => {
                      const d = new Date();
                      d.setHours(0, 0, 0, 0);
                      return d;
                    })()
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect
              label="Priority"
              value={formik.values.priority}
              onChange={(value) => formik.setFieldValue("priority", value)}
              onBlur={formik.handleBlur}
              options={priorityOptions}
              error={
                formik.touched.priority ? formik.errors.priority : undefined
              }
              required
            />
          </Grid>

          {/* Assigned User - Multi Select */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl
              fullWidth
              size="small"
              error={formik.touched.assigned_to && Boolean(formik.errors.assigned_to)}
              disabled={loadingUsers || currentUser?.role === "salesperson"}
              required
            >
              <InputLabel id="assigned-to-label">Assigned To</InputLabel>
              <Select
                labelId="assigned-to-label"
                id="assigned-to-select"
                multiple
                value={formik.values.assigned_to || []}
                onChange={(e) => {
                  const value = e.target.value;
                  formik.setFieldValue(
                    "assigned_to",
                    typeof value === "string" ? value.split(",") : value
                  );
                }}
                input={<OutlinedInput label="Assigned To" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((val) => {
                      const found = availableUsers.find((u: any) => u.id.toString() === val);
                      return (
                        <Chip
                          key={val}
                          label={found ? `${found.name} (${found.role})` : val}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {availableUsers.map((user: any) => (
                  <MenuItem key={user.id} value={user.id.toString()}>
                    <Checkbox
                      checked={(formik.values.assigned_to || []).indexOf(user.id.toString()) > -1}
                      size="small"
                    />
                    <ListItemText primary={`${user.name} (${user.role})`} />
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.assigned_to && formik.errors.assigned_to && (
                <FormHelperText>{formik.errors.assigned_to as string}</FormHelperText>
              )}
            </FormControl>
            {currentUser?.role === "salesperson" && (
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                You can only assign tasks to yourself
              </Typography>
            )}
          </Grid>

          {/* Related Lead */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect
              label="Related Lead"
              value={formik.values.lead_id}
              onChange={(value) => formik.setFieldValue("lead_id", value)}
              onBlur={formik.handleBlur}
              options={leadOptions}
              error={formik.touched.lead_id ? (formik.errors.lead_id as string) : undefined}
              disabled={loadingLeads}
            />
            {leadOptions.length === 0 && !loadingLeads && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, display: "block" }}
              >
                No leads available. Please create a lead first.
              </Typography>
            )}
          </Grid>
        </Grid>
      </form>

      {/* Form Status */}
      {formik.isSubmitting && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            {task ? "Updating task..." : "Creating task..."}
          </Typography>
        </Box>
      )}
    </CustomModal>
  );
};

export default TaskForm;

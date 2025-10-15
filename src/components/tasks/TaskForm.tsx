import React, { useState, useEffect } from "react";
import { Box, Grid, Button, Typography } from "@mui/material";
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

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task | null;
  preSelectedLeadId?: number | null; // ADD THIS
}

const validationSchema = yup.object({
  title: yup.string().required("Title is required").max(255, "Title too long"),
  description: yup.string().required("Description is required"),
  due_date: yup
    .date()
    .required("Due date is required")
    .min(new Date(), "Due date must be in the future"),
  priority: yup
    .string()
    .required("Priority is required")
    .oneOf(["low", "medium", "high"]),
  assigned_to: yup.number().required("Assigned user is required"),
  lead_id: yup.number().required("Related lead is required"),
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

  // Fetch users based on role permissions
  const { data: usersData, isLoading: loadingUsers } = useQuery<any>({
    queryKey: ["users-for-assignment"],
    queryFn: () => userService.getUsers(),
    enabled: open,
  });

  // Fetch leads
  const { data: leadsData, isLoading: loadingLeads } = useQuery<any>({
    queryKey: ["leads-for-tasks"],
    queryFn: () => leadService.getLeads({ per_page: 100 }),
    enabled: open,
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      due_date: new Date().toISOString().split("T")[0], // Default to today
      priority: "medium" as "low" | "medium" | "high",
      assigned_to: "",
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
          due_date: new Date(values.due_date).toISOString(),
          priority: values.priority,
          assigned_to: Number(values.assigned_to),
          lead_id: Number(values.lead_id),
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
          // Handle validation errors from backend
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
      formik.setValues({
        title: task.title,
        description: task.description,
        due_date: task.due_date.split("T")[0], // Format for date input
        priority: task.priority,
        assigned_to: task.assigned_to.toString(),
        lead_id: task.lead_id.toString(),
      });
    } else if (open && !task) {
      formik.resetForm();
      // Set default assigned user to current user if they're a salesperson
      if (currentUser?.role === "salesperson") {
        formik.setFieldValue("assigned_to", currentUser.id.toString());
      }
      if (preSelectedLeadId) {
        formik.setFieldValue("lead_id", preSelectedLeadId.toString());
      }
    }
  }, [open, task, currentUser, preSelectedLeadId]);

  // Filter users based on current user's role and permissions
  const getAvailableUsers = () => {
    if (!usersData?.data) return [];

    if (currentUser?.role === "admin") {
      return usersData.data; // Admin can assign to anyone
    } else if (currentUser?.role === "manager") {
      // Manager can assign to their team members
      return usersData.data.filter(
        (user:any) =>
          user.manager_id === currentUser.id || user.id === currentUser.id
      );
    } else {
      // Salesperson can only assign to themselves
      return usersData.data.filter((user:any) => user.id === currentUser?.id);
    }
  };

  const availableUsers = getAvailableUsers();

  const priorityOptions = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" },
  ];

  const leadOptions =
    leadsData?.data?.map((lead:any) => ({
      value: lead.id.toString(),
      label: `${lead.company_name} (${lead.contact_number})`,
    })) || [];

  const userOptions = availableUsers.map((user:any) => ({
    value: user.id.toString(),
    label: `${user.name} (${user.role})`,
  }));

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={task ? "Edit Task" : "Create New Task"}
      maxWidth="md"
      actions={
        <Box display="flex" gap={2}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="task-form"
            variant="contained"
            disabled={loading || formik.isSubmitting}
          >
            {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
          </Button>
        </Box>
      }
    >
      <form id="task-form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Task Title */}
          <Grid size={{ xs: 12 }}>
            <FormInput
              label="Task Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title ? formik.errors.title : undefined}
              required
              fullWidth
            />
          </Grid>

          {/* Description */}
          <Grid size={{ xs: 12 }}>
            <FormInput
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.description
                  ? formik.errors.description
                  : undefined
              }
              required
              fullWidth
            />
          </Grid>

          {/* Due Date and Priority */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormDatePicker
              label="Due Date"
              value={
                formik.values.due_date ? new Date(formik.values.due_date) : null
              }
              onChange={(date) =>
                formik.setFieldValue(
                  "due_date",
                  date?.toISOString().split("T")[0]
                )
              }
              error={
                formik.touched.due_date && formik.errors.due_date
                  ? formik.errors.due_date
                  : undefined
              }
              required
              minDate={new Date()}
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

          {/* Assigned User */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect
              label="Assigned To"
              value={formik.values.assigned_to}
              onChange={(value) => formik.setFieldValue("assigned_to", value)}
              onBlur={formik.handleBlur}
              options={userOptions}
              error={
                formik.touched.assigned_to
                  ? formik.errors.assigned_to
                  : undefined
              }
              required
              disabled={loadingUsers || currentUser?.role === "salesperson"} // Disable if loading or salesperson
            />
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
              error={formik.touched.lead_id ? formik.errors.lead_id : undefined}
              required
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

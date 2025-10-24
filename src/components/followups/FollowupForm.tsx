import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { useFormik } from "formik";
import * as yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "../ui/CustomModal";
// import FormInput from "../ui/FormElements/FormInput";
import FormDatePicker from "../ui/FormElements/FormDatePicker";
import { followupService } from "../../services/followupService";
import { leadService } from "../../services/leadService";
import { useNotification } from "../../contexts/NotificationContext";
import { Followup, FollowupFormData, Lead } from "../../types";
import { useQuery } from "@tanstack/react-query";

interface FollowupFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  followup?: Followup | null;
  preSelectedLeadId?: number | null;
}

const validationSchema = yup.object({
  lead_id: yup.number().required("Lead is required"),
  scheduled_at: yup
    .date()
    .required("Scheduled time is required")
    .test(
      "is-future",
      "Scheduled time must be at least 1 minute in the future",
      (value) => value && value > new Date(Date.now() + 6000) // At least 1 minute ahead
    ),
});

const FollowupForm: React.FC<FollowupFormProps> = ({
  open,
  onClose,
  onSuccess,
  followup,
  preSelectedLeadId,
}) => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  // Fetch available leads
  const { data: leadsData, isLoading: loadingLeads } = useQuery<any>({
    queryKey: ["available-leads"],
    queryFn: () => leadService.getLeads({ per_page: 100 }),
    enabled: open,
  });

  const availableLeads =
    leadsData?.data?.filter(
      (lead: any) =>
        !lead.followups?.some((f: any) => !f.is_completed) &&
        lead.assigned_to === currentUser?.id
    ) || [];

  const formik = useFormik({
    initialValues: {
      lead_id: "",
      scheduled_at: new Date(Date.now() + 3600000).toISOString(), // Add 1 hour from now
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const formData: FollowupFormData = {
          lead_id: Number(values.lead_id),
          scheduled_at: new Date(values.scheduled_at).toISOString(),
        };

        if (followup) {
          await followupService.updateFollowup(followup.id, formData);
        } else {
          await followupService.createFollowup(formData);
        }

        onSuccess();
      } catch (error: any) {
        console.error("Form submission error:", error);
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        showNotification(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (open && followup) {
      formik.setValues({
        lead_id: followup.lead_id.toString(),
        scheduled_at: followup.scheduled_at,
      });
    } else if (open) {
      formik.resetForm();
      if (preSelectedLeadId) {
        formik.setFieldValue("lead_id", preSelectedLeadId.toString());
      }
    }
  }, [open, followup]);

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={followup ? "Edit Reminder" : "Schedule Reminder"}
      maxWidth="md"
      actions={
        <Box>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="followup-form"
            variant="contained"
            disabled={loading || loadingLeads}
            sx={{ ml: 2 }}
          >
            {loading ? "Saving..." : followup ? "Update" : "Schedule"}
          </Button>
        </Box>
      }
    >
      <form id="followup-form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <FormControl
              fullWidth
              error={formik.touched.lead_id && Boolean(formik.errors.lead_id)}
            >
              <InputLabel>Select Lead *</InputLabel>
              <Select
                name="lead_id"
                value={formik.values.lead_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Select Lead *"
                disabled={loadingLeads}
              >
                {availableLeads.map((lead: any) => (
                  <MenuItem key={lead.id} value={lead.id}>
                    {lead.company_name} - {lead.contact_number} (
                    {lead.name ? lead.name : "No Name"})
                  </MenuItem>
                ))}
                {availableLeads.length === 0 && (
                  <MenuItem disabled>
                    No available leads without existing reminders
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormDatePicker
              label="Scheduled Date & Time *"
              value={
                formik.values.scheduled_at
                  ? new Date(formik.values.scheduled_at)
                  : null
              }
              onChange={(value) =>
                formik.setFieldValue("scheduled_at", value?.toISOString())
              }
              error={
                formik.touched.scheduled_at &&
                Boolean(formik.errors.scheduled_at)
                  ? String(formik.errors.scheduled_at)
                  : undefined
              }
              minDate={new Date()}
            />
          </Grid>
        </Grid>
      </form>
    </CustomModal>
  );
};

export default FollowupForm;

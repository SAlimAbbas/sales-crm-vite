import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Alert,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useQuery } from "@tanstack/react-query";
import CustomModal from "../ui/CustomModal";
import FormInput from "../ui/FormElements/FormInput";
import FormSelect from "../ui/FormElements/FormSelect";
import { convertedClientService } from "../../services/convertedClientService";
import {
  ConvertedClient,
  ConvertedClientFormData,
} from "../../types/convertedClient";
import { userService } from "../../services/userService";

interface ConvertedClientFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: ConvertedClient | null;
}

const validationSchema = yup.object({
  lead_id: yup.number().nullable(),
  company_name: yup.string().required("Company name is required"),
  client_name: yup.string().required("Client name is required"),
  number: yup.string().required("Contact number is required"),
  company_gst_number: yup.string().nullable(), // Add
  gst_issued: yup.string().nullable(), // Add
  company_address: yup.string().nullable(), // Add
  company_email: yup.string().email("Invalid email").nullable(), // Add
  executive_id: yup.number().nullable(), // Add
  client_type: yup
    .string()
    .oneOf(["domestic", "international"])
    .required("Client type is required"),
  gst_on_paid: yup.boolean().nullable(), // Changed
  gst_on_upgrade: yup.boolean().nullable(), // Changed
  plan_type: yup
    .string()
    .oneOf(["basic", "premium", "vip", "advanced", "trial"])
    .required("Plan type is required"), // Added trial
  upgrade_plan_type: yup
    .string()
    .oneOf(["basic", "premium", "vip", "advanced", "trial"])
    .nullable(), // Add
  plan_amount: yup
    .number()
    .min(0, "Must be positive")
    .required("Plan amount is required"),
  paid_amount: yup.number().min(0, "Must be positive").nullable(),
  paid_amount_date: yup.string().nullable(),
  pending_amount_condition: yup.string().nullable(),
  pending_amount_date: yup.string().nullable(),
  upgrade_payment_amount: yup.number().min(0, "Must be positive").nullable(), // Add
  upgrade_payment_date: yup.string().nullable(), // Add
  plan_features: yup.string().nullable(),
  currency: yup.string().max(3).nullable(),
});

const ConvertedClientForm: React.FC<ConvertedClientFormProps> = ({
  open,
  onClose,
  onSuccess,
  client,
}) => {
  const [loading, setLoading] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  const { data: convertedLeads } = useQuery<any>({
    queryKey: ["converted-leads"],
    queryFn: () => convertedClientService.getConvertedLeads(),
    enabled: open && !client,
  });

  const { data: salespeople } = useQuery<any>({
    queryKey: ["salespeople"],
    queryFn: () => userService.getUsers({ role: "salesperson" }),
    enabled: open,
    select: (data) => data?.data || data,
  });
console.log(client);
  console.log(client?.gst_on_paid, client?.gst_on_upgrade);

  const formik = useFormik({
    initialValues: {
      lead_id: client?.lead_id || 0,
      company_name: client?.company_name || "",
      client_name: client?.client_name || "",
      number: client?.number || "",
      company_gst_number: client?.company_gst_number || "", // Add
      gst_issued: client?.gst_issued || "", // Add
      company_address: client?.company_address || "", // Add
      company_email: client?.company_email || "", // Add
      executive_id: client?.executive_id || 0, // Add
      client_type: client?.client_type || "domestic",
      gst_on_paid: client?.gst_on_paid || false, // Changed
      gst_on_upgrade: client?.gst_on_upgrade || false, // Changed
      plan_type: client?.plan_type || "basic",
      upgrade_plan_type: client?.upgrade_plan_type || "", // Add
      plan_amount: client?.plan_amount || 0,
      paid_amount: client?.paid_amount || 0,
      paid_amount_date: client?.paid_amount_date
        ? client.paid_amount_date.split("T")[0]
        : "",
      pending_amount_condition: client?.pending_amount_condition || "",
      pending_amount_date: client?.pending_amount_date
        ? client.pending_amount_date.split("T")[0]
        : "",
      upgrade_payment_amount: client?.upgrade_payment_amount ?? 0, // Add
      upgrade_payment_date: client?.upgrade_payment_date
        ? client.upgrade_payment_date.split("T")[0]
        : "", // Add
      plan_features: client?.plan_features || "",
      currency: client?.currency || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log("btn clicked");
      console.log("values - ",values);
      setLoading(true);
      try {
        const formData: ConvertedClientFormData = {
          lead_id: values.lead_id,
          company_name: values.company_name,
          client_name: values.client_name,
          number: values.number,
          company_gst_number: values.company_gst_number || undefined,
          gst_issued: values.gst_issued || undefined,
          company_address: values.company_address || undefined,
          company_email: values.company_email || undefined,
          executive_id: values.executive_id || undefined,
          client_type: values.client_type as "domestic" | "international",
          gst_on_paid: values.gst_on_paid, // Changed
          gst_on_upgrade: values.gst_on_upgrade, // Changed
          plan_type: values.plan_type as
            | "basic"
            | "premium"
            | "vip"
            | "advanced"
            | "trial",
          upgrade_plan_type: values.upgrade_plan_type
            ? (values.upgrade_plan_type as
                | "basic"
                | "premium"
                | "vip"
                | "advanced"
                | "trial")
            : undefined, // Fixed
          plan_amount: values.plan_amount,
          paid_amount: values.paid_amount || undefined,
          paid_amount_date: values.paid_amount_date || undefined,
          pending_amount_condition:
            values.pending_amount_condition || undefined,
          pending_amount_date: values.pending_amount_date || undefined,
          upgrade_payment_amount: values.upgrade_payment_amount || undefined,
          upgrade_payment_date: values.upgrade_payment_date || undefined,
          plan_features: values.plan_features || undefined,
          currency: values.currency || undefined,
        };

        if (client) {
          await convertedClientService.updateConvertedClient(
            client.id,
            formData
          );
        } else {
          await convertedClientService.createConvertedClient(formData);
        }

        onSuccess();
      } catch (error: any) {
        const errors = error.response?.data?.errors;
        if (errors) {
          const formikErrors: any = {};
          Object.keys(errors).forEach((key) => {
            formikErrors[key] = errors[key][0];
          });
          formik.setErrors(formikErrors);
        } else {
          formik.setErrors({
            company_name: error.response?.data?.message || "An error occurred",
          });
        }
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (open && client) {
      formik.setValues({
        lead_id: client.lead_id,
        company_name: client.company_name,
        client_name: client.client_name,
        number: client.number,
        company_gst_number: client.company_gst_number || "", // Add
        gst_issued: client.gst_issued || "", // Add
        company_address: client.company_address || "", // Add
        company_email: client.company_email || "", // Add
        executive_id: client.executive_id || 0, // Add
        client_type: client.client_type,
        gst_on_paid: client.gst_on_paid || false, // Changed
        gst_on_upgrade: client.gst_on_upgrade || false, // Changed
        plan_type: client.plan_type,
        upgrade_plan_type: client.upgrade_plan_type || "", // Add
        plan_amount: client.plan_amount,
        paid_amount: client.paid_amount,
        paid_amount_date: client.paid_amount_date
          ? client.paid_amount_date.split("T")[0]
          : "",
        upgrade_payment_amount: client.upgrade_payment_amount ?? 0, // Add
        upgrade_payment_date: client.upgrade_payment_date
          ? client.upgrade_payment_date.split("T")[0]
          : "", // Add
        pending_amount_condition: client.pending_amount_condition || "",
        pending_amount_date: client.pending_amount_date
          ? client.pending_amount_date.split("T")[0]
          : "",
        plan_features: client.plan_features || "",
        currency: client.currency,
      });
    } else if (open) {
      formik.resetForm();
    }
  }, [open, client]);

  // Auto-fill company name when lead is selected
  useEffect(() => {
    if (formik.values.lead_id && convertedLeads && !client && !isManualEntry) {
      const selectedLead = convertedLeads.find(
        (l: any) => l.id === formik.values.lead_id
      );
      if (selectedLead) {
        formik.setFieldValue("company_name", selectedLead.company_name);
        formik.setFieldValue("client_name", selectedLead.owner_name || "");
        formik.setFieldValue("number", selectedLead.contact_number);
        formik.setFieldValue("company_email", selectedLead.email || "");
        formik.setFieldValue("executive_id", selectedLead.assigned_to || 0); // This sets the executive
        formik.setFieldValue(
          "client_type",
          selectedLead.country.toLowerCase() === "india"
            ? "domestic"
            : "international"
        );
      }
    }
  }, [formik.values.lead_id, convertedLeads, isManualEntry]);

  // Auto-set currency based on client type
  useEffect(() => {
    if (formik.values.client_type === "domestic") {
      formik.setFieldValue("currency", "INR");
    } else if (formik.values.client_type === "international") {
      if (!formik.values.currency || formik.values.currency === "INR") {
        formik.setFieldValue("currency", "USD");
      }
    }
  }, [formik.values.client_type]);

  // Set initial currency on form open
  useEffect(() => {
    if (open && formik.values.currency) {
      formik.setFieldValue("currency", "INR");
    }
  }, [open]);

  const planTypeOptions = [
    { value: "basic", label: "Basic" },
    { value: "premium", label: "Premium" },
    { value: "vip", label: "VIP" },
    { value: "advanced", label: "Advanced" },
    { value: "trial", label: "Trial" }, // Add
  ];

  const clientTypeOptions = [
    { value: "domestic", label: "Domestic" },
    { value: "international", label: "International" },
  ];

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={client ? "Edit Converted Client" : "Add Converted Client"}
      maxWidth="lg"
      actions={
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="outlined" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            form="converted-client-form"
            disabled={loading}
          >
            {loading ? "Saving..." : client ? "Update" : "Create"}
          </Button>
        </Box>
      }
    >
      <form id="converted-client-form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {!client && (
            <>
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  Select a converted lead to create a client record, or toggle
                  manual entry for external payments.
                </Alert>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Typography variant="body2">Entry Mode:</Typography>
                  <Button
                    variant={!isManualEntry ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setIsManualEntry(false);
                      formik.setFieldValue("lead_id", 0);
                    }}
                  >
                    Select from Converted Leads
                  </Button>
                  <Button
                    variant={isManualEntry ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      setIsManualEntry(true);
                      formik.setFieldValue("lead_id", 0);
                    }}
                  >
                    Manual Entry (External Payment)
                  </Button>
                </Box>
              </Grid>

              {!isManualEntry && (
                <Grid size={{ xs: 12 }}>
                  <FormSelect
                    label="Select Converted Lead"
                    value={formik.values.lead_id}
                    onChange={(value) => formik.setFieldValue("lead_id", value)}
                    options={
                      convertedLeads?.map((lead: any) => ({
                        value: lead.id,
                        label: `${lead.company_name} - ${
                          lead.owner_name || "No contact"
                        } (${lead.country})`,
                      })) || []
                    }
                    error={
                      formik.touched.lead_id ? formik.errors.lead_id : undefined
                    }
                    required
                  />
                </Grid>
              )}
            </>
          )}

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Company Name"
              name="company_name"
              value={formik.values.company_name}
              onChange={formik.handleChange}
              error={
                formik.touched.company_name
                  ? formik.errors.company_name
                  : undefined
              }
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Client Name"
              name="client_name"
              value={formik.values.client_name}
              onChange={formik.handleChange}
              error={
                formik.touched.client_name
                  ? formik.errors.client_name
                  : undefined
              }
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Contact Number"
              name="number"
              value={formik.values.number}
              onChange={formik.handleChange}
              error={formik.touched.number ? formik.errors.number : undefined}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Company Email"
              name="company_email"
              type="email"
              value={formik.values.company_email}
              onChange={formik.handleChange}
              error={
                formik.touched.company_email
                  ? formik.errors.company_email
                  : undefined
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Company GST Number"
              name="company_gst_number"
              value={formik.values.company_gst_number}
              onChange={formik.handleChange}
              error={
                formik.touched.company_gst_number
                  ? formik.errors.company_gst_number
                  : undefined
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="GST Issued"
              name="gst_issued"
              value={formik.values.gst_issued}
              onChange={formik.handleChange}
              error={
                formik.touched.gst_issued ? formik.errors.gst_issued : undefined
              }
              placeholder="Enter GST details if issued"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormInput
              label="Company Address"
              name="company_address"
              value={formik.values.company_address}
              onChange={formik.handleChange}
              error={
                formik.touched.company_address
                  ? formik.errors.company_address
                  : undefined
              }
              multiline
              rows={2}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect
              label="Executive Name"
              value={formik.values.executive_id}
              onChange={(value) => formik.setFieldValue("executive_id", value)}
              options={[
                { value: 0, label: "Not Assigned" },
                ...(salespeople?.map((user: any) => ({
                  value: user.id,
                  label: user.name,
                })) || []),
              ]}
              error={
                formik.touched.executive_id
                  ? formik.errors.executive_id
                  : undefined
              }
              disabled={
                !isManualEntry && formik.values.lead_id !== 0 && !client
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormSelect
              label="Client Type"
              value={formik.values.client_type}
              onChange={(value) => formik.setFieldValue("client_type", value)}
              options={clientTypeOptions}
              error={
                formik.touched.client_type
                  ? formik.errors.client_type
                  : undefined
              }
              required
            />
          </Grid>

          {formik.values.client_type === "domestic" && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(formik.values.gst_on_paid)}
                      onChange={(e) =>
                        formik.setFieldValue("gst_on_paid", e.target.checked)
                      }
                      name="gst_on_paid"
                    />
                  }
                  label="Apply 18% GST on Paid Amount"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(formik.values.gst_on_upgrade)}
                      onChange={(e) =>
                        formik.setFieldValue("gst_on_upgrade", e.target.checked)
                      }
                      name="gst_on_upgrade"
                    />
                  }
                  label="Apply 18% GST on Upgrade Amount"
                />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormSelect
              label="Plan Type"
              value={formik.values.plan_type}
              onChange={(value) => formik.setFieldValue("plan_type", value)}
              options={planTypeOptions}
              error={
                formik.touched.plan_type ? formik.errors.plan_type : undefined
              }
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormSelect
              label="Upgrade Plan Type"
              value={formik.values.upgrade_plan_type}
              onChange={(value) =>
                formik.setFieldValue("upgrade_plan_type", value)
              }
              options={[{ value: "", label: "No Upgrade" }, ...planTypeOptions]}
              error={
                formik.touched.upgrade_plan_type
                  ? formik.errors.upgrade_plan_type
                  : undefined
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormInput
              label="Currency"
              name="currency"
              value={formik.values.currency}
              onChange={formik.handleChange}
              error={
                formik.touched.currency ? formik.errors.currency : undefined
              }
              disabled
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormInput
              label="Plan Amount (Pitched)"
              name="plan_amount"
              type="number"
              value={formik.values.plan_amount}
              onChange={formik.handleChange}
              error={
                formik.touched.plan_amount
                  ? formik.errors.plan_amount
                  : undefined
              }
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormInput
              label="Paid Amount"
              name="paid_amount"
              type="number"
              value={formik.values.paid_amount}
              onChange={formik.handleChange}
              error={
                formik.touched.paid_amount
                  ? formik.errors.paid_amount
                  : undefined
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormInput
              label="Paid Amount Date"
              name="paid_amount_date"
              type="date"
              value={formik.values.paid_amount_date}
              onChange={formik.handleChange}
              error={
                formik.touched.paid_amount_date
                  ? formik.errors.paid_amount_date
                  : undefined
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Pending Amount Condition"
              name="pending_amount_condition"
              value={formik.values.pending_amount_condition}
              onChange={formik.handleChange}
              error={
                formik.touched.pending_amount_condition
                  ? formik.errors.pending_amount_condition
                  : undefined
              }
              placeholder="e.g., After website delivery"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Pending Amount Date"
              name="pending_amount_date"
              type="date"
              value={formik.values.pending_amount_date}
              onChange={formik.handleChange}
              error={
                formik.touched.pending_amount_date
                  ? formik.errors.pending_amount_date
                  : undefined
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Upgrade Payment Amount"
              name="upgrade_payment_amount"
              type="number"
              value={formik.values.upgrade_payment_amount}
              onChange={formik.handleChange}
              error={
                formik.touched.upgrade_payment_amount
                  ? formik.errors.upgrade_payment_amount
                  : undefined
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Upgrade Payment Date"
              name="upgrade_payment_date"
              type="date"
              value={formik.values.upgrade_payment_date}
              onChange={formik.handleChange}
              error={
                formik.touched.upgrade_payment_date
                  ? formik.errors.upgrade_payment_date
                  : undefined
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormInput
              label="Plan Features"
              name="plan_features"
              value={formik.values.plan_features}
              onChange={formik.handleChange}
              error={
                formik.touched.plan_features
                  ? formik.errors.plan_features
                  : undefined
              }
              multiline
              rows={4}
              placeholder="Describe the plan features..."
            />
          </Grid>
        </Grid>
      </form>
    </CustomModal>
  );
};

export default ConvertedClientForm;

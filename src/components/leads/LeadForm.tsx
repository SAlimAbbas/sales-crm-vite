import React, { useState, useEffect } from "react";
import { Box, Button, Grid, MenuItem } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useQuery } from "@tanstack/react-query";
import CustomModal from "../ui/CustomModal";
import FormInput from "../ui/FormElements/FormInput";
import FormSelect from "../ui/FormElements/FormSelect";
import FormDatePicker from "../ui/FormElements/FormDatePicker";
import { leadService } from "../../services/leadService";
import { userService } from "../../services/userService";
import { Lead, LeadFormData } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

interface LeadFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead?: Lead | null;
}

const validationSchema = yup.object({
  date: yup.string().required("Date is required"),
  company_name: yup.string().required("Company name is required"),
  contact_number: yup.string().required("Contact number is required"),
  source: yup.string().required("Source is required"),
  country: yup.string().required("Country is required"),
  product: yup.string().required("Product is required"),
  owner_name: yup.string().nullable(),
  website: yup.string().url("Invalid URL").nullable(),
  email: yup.string().email("Invalid email").nullable(),
  assigned_to: yup.number().nullable(),
});

const LeadForm: React.FC<LeadFormProps> = ({
  open,
  onClose,
  onSuccess,
  lead,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { data: usersData } = useQuery<any>({
    queryKey: ["salespeople"],
    queryFn: () => userService.getUsers({ role: "salesperson" }),
    enabled: open,
  });

  const formik = useFormik({
    initialValues: {
      date: lead?.date
        ? lead.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      company_name: lead?.company_name || "",
      contact_number: lead?.contact_number || "",
      source: lead?.source || "",
      country: lead?.country || "",
      product: lead?.product || "",
      owner_name: lead?.owner_name || "",
      website: lead?.website || "",
      email: lead?.email || "",
      assigned_to: lead?.assigned_to || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const formData: LeadFormData = {
          date: values.date,
          company_name: values.company_name,
          contact_number: values.contact_number,
          source: values.source,
          country: values.country,
          product: values.product,
          owner_name: values.owner_name || undefined,
          website: values.website
            ? values.website.match(/^https?:\/\//)
              ? values.website
              : "https://" + values.website
            : undefined,
          email: values.email || undefined,
          assigned_to: values.assigned_to
            ? Number(values.assigned_to)
            : undefined,
        };

        if (lead) {
          await leadService.updateLead(lead.id, formData);
        } else {
          await leadService.createLead(formData);
        }

        onSuccess();
      } catch (error: any) {
        // ✅ Handle validation errors properly
        const errors = error.response?.data?.errors;

        if (errors) {
          // Map backend validation errors to formik fields
          const formikErrors: any = {};

          if (errors.contact_number) {
            formikErrors.contact_number = errors.contact_number[0];
          }

          if (errors.email) {
            formikErrors.email = errors.email[0];
          }

          if (errors.company_name) {
            formikErrors.company_name = errors.company_name[0];
          }

          // Set all errors at once
          formik.setErrors(formikErrors);
        } else {
          // Generic error message
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
    if (open && lead) {
      formik.setValues({
        date: lead.date.split("T")[0],
        company_name: lead.company_name,
        contact_number: lead.contact_number,
        source: lead.source,
        country: lead.country,
        product: lead.product,
        owner_name: lead.owner_name || "",
        website: lead.website || "",
        email: lead.email || "",
        assigned_to: lead.assigned_to || "",
      });
    } else if (open) {
      formik.resetForm();
      formik.setFieldValue("date", new Date().toISOString().split("T")[0]);
    }
  }, [open, lead]);

  useEffect(() => {
    if (user?.role === "salesperson" && !lead && user?.id) {
      // Auto-assign to self for new leads when user is salesperson
      formik.setFieldValue("assigned_to", user.id.toString());
    }
  }, [user?.role === "salesperson", lead, user?.id]);

  const sourceOptions = [
    "Websites",
    "Referral",
    "Social Media",
    "Cold Call",
    "Paid Campaign",
    "Email Campaign",
    "Trade Show",
    "Other",
  ];

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={lead ? "Edit Lead" : "Create Lead"}
      maxWidth="lg"
      actions={
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="outlined" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            form="lead-form"
            disabled={loading}
          >
            {loading ? "Saving..." : lead ? "Update" : "Create"}
          </Button>
        </Box>
      }
    >
      <form id="lead-form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormInput
              label="Contact Number"
              name="contact_number"
              value={formik.values.contact_number}
              onChange={formik.handleChange}
              error={
                formik.touched.contact_number
                  ? formik.errors.contact_number
                  : undefined
              }
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormInput
              label="Contact Person"
              name="owner_name"
              value={formik.values.owner_name}
              onChange={formik.handleChange}
              error={
                formik.touched.owner_name ? formik.errors.owner_name : undefined
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormSelect
              label="Source"
              value={formik.values.source}
              onChange={(value) => formik.setFieldValue("source", value)}
              options={sourceOptions.map((source) => ({
                value: source,
                label: source,
              }))}
              error={formik.touched.source ? formik.errors.source : undefined}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormInput
              label="Country"
              name="country"
              value={formik.values.country}
              onChange={formik.handleChange}
              error={formik.touched.country ? formik.errors.country : undefined}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormInput
              label="Product/Service"
              name="product"
              value={formik.values.product}
              onChange={formik.handleChange}
              error={formik.touched.product ? formik.errors.product : undefined}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email ? formik.errors.email : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormInput
              label="Website"
              name="website"
              value={formik.values.website}
              onChange={formik.handleChange}
              error={formik.touched.website ? formik.errors.website : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormInput
              label="Date"
              name="date"
              type="date"
              value={formik.values.date}
              onChange={formik.handleChange}
              error={formik.touched.date ? formik.errors.date : undefined}
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          {user?.role !== "lead_executive" && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormSelect
                label="Assign To"
                value={
                  user?.role === "salesperson"
                    ? user?.id.toString()
                    : formik.values.assigned_to
                }
                onChange={(value) => formik.setFieldValue("assigned_to", value)}
                options={
                  user?.role === "salesperson"
                    ? [
                        {
                          value: user?.id.toString() || "",
                          label: user?.name || "",
                        },
                      ]
                    : [
                        { value: "", label: "Unassigned" },
                        ...(usersData?.data?.map((user: any) => ({
                          value: user.id.toString(),
                          label: user.name,
                        })) || []),
                      ]
                }
                disabled={user?.role === "salesperson"} //  Disable for salesperson
                error={
                  formik.touched.assigned_to
                    ? formik.errors.assigned_to
                    : undefined
                }
              />
            </Grid>
          )}
        </Grid>
      </form>
    </CustomModal>
  );
};

export default LeadForm;

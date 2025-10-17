import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  // MenuItem,
  FormControlLabel,
  Switch,
  Button,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import CustomModal from "../ui/CustomModal";
import FormInput from "../ui/FormElements/FormInput";
import FormSelect from "../ui/FormElements/FormSelect";
import { userService } from "../../services/userService";
import { User, UserFormData } from "../../types";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { InputAdornment, IconButton } from "@mui/material";

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
}

// Replace the existing validationSchema with this:
const getValidationSchema = (isEditing: boolean) =>
  yup.object({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup.string().nullable(),
    role: yup.string().required("Role is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .when([], {
        is: () => !isEditing,
        then: (schema) => schema.required("Password is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    manager_id: yup.number().nullable(),
  });

const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  onSuccess,
  user,
}) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      role: "salesperson",
      password: "",
      manager_id: "",
      is_active: true,
    },
    validationSchema: getValidationSchema(!!user), // Pass whether we're editing
    enableReinitialize: true, // Add this to reinitialize when user prop changes
    onSubmit: async (values, { setSubmitting }) => {

      setLoading(true);
      setSubmitting(true);

      try {
        const formData: UserFormData = {
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          role: values.role as "admin" | "manager" | "salesperson",
          password: values.password || undefined,
          manager_id: values.manager_id ? Number(values.manager_id) : undefined,
          is_active: values.is_active,
        };

        if (user) {
          await userService.updateUser(user.id, formData);
        } else {
          await userService.createUser(formData);
        }

        onSuccess();
      } catch (error: any) {
        if (error.response?.data?.errors) {
          formik.setErrors(error.response.data.errors);
        } else {
          const errorMessage =
            error.response?.data?.message || "An error occurred";
          formik.setErrors({ email: errorMessage });
        }
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  const { data: managersData } = useQuery<any>({
    queryKey: ["managers"],
    queryFn: () => userService.getUsers({ role: "manager" }),
    enabled: open && formik.values.role === "salesperson",
  });

  useEffect(() => {
    if (open && user) {
      formik.setValues({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "salesperson",
        password: "",
        manager_id: user.manager_id ? String(user.manager_id) : "",
        is_active: user.is_active ?? true,
      });
    } else if (open) {
      formik.resetForm();
      formik.setValues({
        name: "",
        email: "",
        phone: "",
        role: "salesperson",
        password: "",
        manager_id: "",
        is_active: true,
      });
    }
  }, [open, user]);

  const roleOptions = [
    { value: "salesperson", label: "Salesperson" },
    { value: "manager", label: "Manager" },
    ...(currentUser?.role === "admin"
      ? [{ value: "admin", label: "Admin" }]
      : []),
  ];

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={user ? "Edit User" : "Create User"}
      maxWidth="md"
      actions={
        <Box>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-form"
            variant="contained"
            disabled={loading}
            sx={{ ml: 2 }}
          >
            {loading ? "Saving..." : user ? "Update" : "Create"}
          </Button>
        </Box>
      }
    >
      <form id="user-form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Full Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name ? formik.errors.name : undefined}
              helperText={formik.touched.name ? formik.errors.name || "" : ""}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email ? formik.errors.email : undefined}
              helperText={formik.touched.email ? formik.errors.email || "" : ""}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Phone Number"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone ? formik.errors.phone : undefined}
              helperText={formik.touched.phone ? formik.errors.phone || "" : ""}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect
              label="Role"
              name="role"
              value={formik.values.role}
              onChange={(value) => formik.setFieldValue("role", value)}
              onBlur={formik.handleBlur}
              error={formik.touched.role ? formik.errors.role : undefined}
              helperText={formik.touched.role ? formik.errors.role || "" : ""}
              options={roleOptions}
              required
            />
          </Grid>

          {formik.values.role === "salesperson" && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormSelect
                label="Assign Manager"
                name="manager_id"
                value={formik.values.manager_id}
                onChange={(value) => formik.setFieldValue("manager_id", value)}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.manager_id
                    ? formik.errors.manager_id
                    : undefined
                }
                helperText={
                  formik.touched.manager_id
                    ? formik.errors.manager_id || ""
                    : ""
                }
                options={[
                  { value: "", label: "No Manager" },
                  ...(managersData?.data?.data || managersData?.data || []).map(
                    (manager: User) => ({
                      value: manager.id.toString(),
                      label: `${manager.name} (${manager.email})`,
                    })
                  ),
                ]}
              />
            </Grid>
          )}
          {!user && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormInput
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password ? formik.errors.password : undefined
                }
                helperText={
                  formik.touched.password ? formik.errors.password || "" : ""
                }
                required
                InputProps={{
                  // ✅ Correct - wrap in InputProps
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  name="is_active"
                  checked={formik.values.is_active}
                  onChange={(e) =>
                    formik.setFieldValue("is_active", e.target.checked)
                  }
                  onBlur={formik.handleBlur}
                />
              }
              label="Active User"
            />
          </Grid>
        </Grid>
      </form>
    </CustomModal>
  );
};

export default UserForm;

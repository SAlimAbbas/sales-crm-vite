import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  styled,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { motion, Variants } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import TwoFactorVerification from "./TwoFactorVerification";

// Styled Components (keep all your existing styled components)
const VideoBackground = styled("video")({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  zIndex: -2,
});

const GlassContainer = styled(motion.div)({
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(20px)",
  borderRadius: "24px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  padding: "48px",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  width: "100%",
  maxWidth: "440px",
});

const GradientButton = styled(Button)({
  background: "#0d4aa7",
  border: 0,
  borderRadius: "12px",
  color: "white",
  height: 56,
  padding: "0 30px",
  fontSize: "16px",
  fontWeight: 600,
  textTransform: "none",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #17101dff 0%, #0d4aa7 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
  },
  "&:disabled": {
    background: "rgba(255, 255, 255, 0.3)",
  },
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    transition: "all 0.3s ease",
    "&:hover": {},
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#0d4aa7",
        borderWidth: "2px",
      },
    },
  },
  "& .MuiInputLabel-root": {
    color: "#666",
    "&.Mui-focused": {
      color: "#0d4aa7",
    },
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "none !important",
    WebkitTextFillColor: "none !important",
    borderRadius: "0px",
    transition: "background-color 5000s ease-in-out 0s",
  },
});

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });

      // Check if 2FA is required
      if (response.requires_2fa) {
        setRequires2FA(true);
        setTempEmail(email);
        setError(""); // Clear any previous errors
      } else {
        // Regular login successful, update auth context
        await login({ email, password });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerify = async (code: string, rememberDevice: boolean) => {
    setError("");
    setIsLoading(true);

    try {
      await authService.verify2FA(tempEmail, code, rememberDevice);
      // After successful verification, reload to update auth state
      window.location.href = "/";
    } catch (err: any) {
      // ✅ Don't throw error - just set it and stay on 2FA page
      setError(
        err.response?.data?.message ||
          "Verification failed. Please check your code and try again."
      );
      // ❌ REMOVE THIS - Don't re-throw, user should stay on 2FA page
      // throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAResend = async () => {
    setError("");
    try {
      await authService.resend2FA(tempEmail);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to resend code. Please try again."
      );
      throw err;
    }
  };

  const handleBackToLogin = () => {
    setRequires2FA(false);
    setTempEmail("");
    setError("");
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      {/* Background Video */}
      <VideoBackground autoPlay loop muted playsInline>
        <source src="/videos/blur-background.mp4" type="video/mp4" />
      </VideoBackground>

      <Container
        component="main"
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <GlassContainer
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo/Title */}
          {!requires2FA && (
            <motion.div variants={itemVariants}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <motion.img
                  src="/images/logo.png"
                  alt="Company Logo"
                  style={{
                    width: "90px",
                    height: "90px",
                    objectFit: "contain",
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                />
              </Box>
              <Typography
                component="h1"
                variant="h3"
                align="center"
                sx={{
                  fontWeight: 700,
                  background: "#0d4aa7",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                EW Sales Leads
              </Typography>
              <Typography
                variant="body1"
                align="center"
                sx={{
                  mb: 4,
                  fontWeight: 500,
                }}
              >
                Enter your email and password to login
              </Typography>
            </motion.div>
          )}

          {/* Conditional Rendering: Login Form or 2FA */}
          {!requires2FA ? (
            <>
              {/* Error Alert */}
              {error && (
                <motion.div
                  variants={itemVariants}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: "12px",
                      background: "rgba(211, 47, 47, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit}>
                {/* Email Field */}
                <motion.div variants={itemVariants}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                    }}
                  >
                    Email
                  </Typography>
                  <StyledTextField
                    required
                    fullWidth
                    id="email"
                    placeholder="Enter Email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: "#0d4aa7" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                    }}
                  >
                    Password
                  </Typography>
                  <StyledTextField
                    required
                    fullWidth
                    name="password"
                    placeholder="Enter Password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#0d4aa7" }} />
                        </InputAdornment>
                      ),
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
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GradientButton type="submit" fullWidth disabled={isLoading}>
                    {isLoading ? "SIGNING IN..." : "SIGN IN"}
                  </GradientButton>
                </motion.div>
              </Box>
            </>
          ) : (
            <>
              {/* Two Factor Verification Component */}
              <TwoFactorVerification
                email={tempEmail}
                onVerify={handle2FAVerify}
                onResend={handle2FAResend}
                error={error}
                isLoading={isLoading}
              />

              {/* Back to Login Button */}
              <Box sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleBackToLogin}
                  sx={{
                    background: "#0d4aa7",
                    border: 0,
                    borderRadius: "12px",
                    color: "white",
                    height: 56,
                    padding: "0 30px",
                    fontSize: "16px",
                    fontWeight: 600,
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #17101dff 0%, #0d4aa7 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                    },
                    "&:disabled": {
                      background: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                >
                  ← Back to Login
                </Button>
              </Box>
            </>
          )}
        </GlassContainer>
      </Container>
    </>
  );
};

export default Login;

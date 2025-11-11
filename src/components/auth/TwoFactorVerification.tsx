import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Checkbox,
  FormControlLabel,
  styled,
} from "@mui/material";
import { motion } from "framer-motion";
import { Lock as LockIcon, Refresh as RefreshIcon } from "@mui/icons-material";

const CodeInput = styled("input")({
  width: "50px",
  height: "60px",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center",
  border: "2px solid #e0e0e0",
  borderRadius: "8px",
  margin: "0 6px",
  outline: "none",
  transition: "all 0.3s ease",
  fontFamily: "'Courier New', monospace",
  "&:focus": {
    borderColor: "#667eea",
    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
  },
  "&:disabled": {
    backgroundColor: "#f5f5f5",
    cursor: "not-allowed",
  },
});

const GradientButton = styled(Button)({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
    background: "linear-gradient(135deg, #5568d3 0%, #6a4190 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
  },
  "&:disabled": {
    background: "rgba(0, 0, 0, 0.12)",
    color: "rgba(0, 0, 0, 0.26)",
  },
});

interface TwoFactorVerificationProps {
  email: string;
  onVerify: (code: string, rememberDevice: boolean) => Promise<void>;
  onResend: () => Promise<void>;
  error: string;
  isLoading: boolean;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  email,
  onVerify,
  onResend,
  error,
  isLoading,
}) => {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every((digit) => digit !== "") && !isLoading) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newCode = pastedData
      .split("")
      .concat(Array(6 - pastedData.length).fill(""));
    setCode(newCode as string[]);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex((digit) => !digit);
    inputRefs.current[nextEmptyIndex !== -1 ? nextEmptyIndex : 5]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6 && !isLoading) {
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (codeValue: string) => {
    await onVerify(codeValue, rememberDevice);
  };

  const handleManualSubmit = () => {
    const codeValue = code.join("");
    if (codeValue.length === 6) {
      handleSubmit(codeValue);
    }
  };

  const handleResend = async () => {
    if (resendCooldown === 0) {
      await onResend();
      setResendCooldown(60); // 60 seconds cooldown
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockIcon sx={{ fontSize: 40, color: "#667eea" }} />
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          align="center"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: "#333",
          }}
        >
          Two-Factor Authentication
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          align="center"
          sx={{
            mb: 4,
            color: "#333",
            lineHeight: 1.6,
          }}
        >
          We've sent a 6-digit verification code to
          <br />
          <strong>{email}</strong>
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: "12px",
              background: "rgba(211, 47, 47, 0.1)",
            }}
          >
            {error}
          </Alert>
        )}

        {/* Code Input Fields */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          {code.map((digit, index) => (
            <CodeInput
              key={index}
              ref={(el: HTMLInputElement | null) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading}
            />
          ))}
        </Box>

        {/* Remember Device Checkbox */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                sx={{
                  color: "#667eea",
                  "&.Mui-checked": {
                    color: "#667eea",
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "#333" }}>
                Remember this device for 30 days
              </Typography>
            }
          />
        </Box>

        {/* Verify Button */}
        <GradientButton
          fullWidth
          onClick={handleManualSubmit}
          disabled={!isCodeComplete || isLoading}
          sx={{ mb: 2 }}
        >
          {isLoading ? "VERIFYING..." : "VERIFY CODE"}
        </GradientButton>

        {/* Resend Code Button */}
        <Button
          fullWidth
          variant="text"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isLoading}
          startIcon={<RefreshIcon />}
          sx={{
            textTransform: "none",
            color: "#667eea",
            "&:hover": {
              backgroundColor: "rgba(102, 126, 234, 0.05)",
            },
          }}
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Resend code"}
        </Button>

        {/* Help Text */}
        <Typography
          variant="caption"
          align="center"
          display="block"
          sx={{ mt: 3, color: "#333" }}
        >
          Code expires in 10 minutes
        </Typography>
      </motion.div>
    </Box>
  );
};

export default TwoFactorVerification;

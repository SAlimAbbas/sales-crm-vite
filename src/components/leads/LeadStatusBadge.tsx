import React from "react";
import { Chip } from "@mui/material";
import { LEAD_STATUS } from "../../utils/constants";
import { getStatusColor } from "../../utils/helpers";

interface LeadStatusBadgeProps {
  status: string;
  size?: "small" | "medium";
}

const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({
  status,
  size = "small",
}) => {
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      [LEAD_STATUS.UNASSIGNED]: "Unassigned",
      [LEAD_STATUS.ASSIGNED]: "Assigned",
      [LEAD_STATUS.RINGING]: "Ringing",
      [LEAD_STATUS.CALL_BACK]: "Call Back",
      [LEAD_STATUS.FOLLOW_UP]: "Follow Up",
      [LEAD_STATUS.PROSPECTS]: "Prospects",
      [LEAD_STATUS.CONVERTED]: "Converted",
      [LEAD_STATUS.NOT_INTERESTED]: "Not Interested",
      [LEAD_STATUS.WHATSAPPED]: "WhatsApped",
      [LEAD_STATUS.INVALID_CONTACT]: "Invalid Contact",
      [LEAD_STATUS.NOT_ON_WHATSAPP]: "Not on WhatsApp",
      [LEAD_STATUS.BUSY]: "Busy", // ✅ Add
      [LEAD_STATUS.CALL_DISCONNECTED]: "Call Disconnected", // ✅ Add
      [LEAD_STATUS.NO_RESPONSE]: "No Response", // ✅ Add
      [LEAD_STATUS.SWITCHED_OFF]: "Switched Off", // ✅ Add
      [LEAD_STATUS.NOT_REACHABLE]: "Not Reachable", // ✅ Add
    };

    return statusMap[status] || status;
  };

  return (
    <Chip
      label={getStatusLabel(status)}
      size={size}
      color={getStatusColor(status) as any}
      variant="outlined"
    />
  );
};

export default LeadStatusBadge;

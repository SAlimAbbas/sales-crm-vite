export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  SALESPERSON: "salesperson",
} as const;

export const LEAD_STATUS = {
  UNASSIGNED: "unassigned",
  ASSIGNED: "assigned",
  PROSPECTS: "prospects",
  CONVERTED: "converted",
  RINGING: "ringing",
  CALL_BACK: "call_back",
  FOLLOW_UP: "follow_up",
  NOT_INTERESTED: "not_interested",
  WHATSAPPED: "whatsapped",
  INVALID_CONTACT: "invalid_contact",
  NOT_ON_WHATSAPP: "not_on_whatsapp",
  BUSY: "busy", // ✅ Add
  CALL_DISCONNECTED: "call_disconnected", // ✅ Add
  NO_RESPONSE: "no_response", // ✅ Add
  SWITCHED_OFF: "switched_off", // ✅ Add
  NOT_REACHABLE: "not_reachable", // ✅ Add
};

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  OVERDUE: "overdue",
} as const;

export const PAGE_SIZES = [10, 25, 50, 100];

export const DATE_FORMAT = "YYYY-MM-DD";
export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

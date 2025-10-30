import { ROLES, LEAD_STATUS, TASK_PRIORITY, TASK_STATUS } from "./constants";

export const hasPermission = (user: any, permission: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

export const canManageUser = (currentUser: any, targetUser: any): boolean => {
  if (!currentUser || !targetUser) return false;

  if (currentUser.role === ROLES.ADMIN) return true;
  if (
    currentUser.role === ROLES.MANAGER &&
    targetUser.role === ROLES.SALESPERSON
  ) {
    return targetUser.manager_id === currentUser.id;
  }
  return currentUser.id === targetUser.id;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // Lead statuses
    [LEAD_STATUS.CONVERTED]: "success",
    [LEAD_STATUS.PROSPECTS]: "info",
    [LEAD_STATUS.ASSIGNED]: "primary",
    [LEAD_STATUS.UNASSIGNED]: "default",
    [LEAD_STATUS.RINGING]: "warning",
    [LEAD_STATUS.CALL_BACK]: "warning",
    [LEAD_STATUS.FOLLOW_UP]: "info",
    [LEAD_STATUS.NOT_INTERESTED]: "error",
    [LEAD_STATUS.INVALID_CONTACT]: "error",
    [LEAD_STATUS.WHATSAPPED]: "success",
    [LEAD_STATUS.NOT_ON_WHATSAPP]: "default",

    // Task statuses
    [TASK_STATUS.COMPLETED]: "success",
    [TASK_STATUS.OVERDUE]: "error",
    [TASK_STATUS.IN_PROGRESS]: "info",
    [TASK_STATUS.PENDING]: "warning",
  };
  return statusColors[status] || "default";
};

export const getPriorityColor = (priority: string): string => {
  const priorityColors: Record<string, string> = {
    [TASK_PRIORITY.HIGH]: "error",
    [TASK_PRIORITY.MEDIUM]: "warning",
    [TASK_PRIORITY.LOW]: "success",
  };
  return priorityColors[priority] || "default";
};

export const exportToCSV = (data: any[], filename: string): void => {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => JSON.stringify(row[header])).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

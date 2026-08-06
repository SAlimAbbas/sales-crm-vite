import { ROLES, LEAD_STATUS, TASK_PRIORITY, TASK_STATUS } from "./constants";

export const hasPermission = (user: any, permission: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

export const isAdminUser = (user: any): boolean => {
  if (!user) return false;
  return user.role === ROLES.ADMIN || user.role === ROLES.MANAGER_STAFF;
};

export const canManageUser = (currentUser: any, targetUser: any): boolean => {
  if (!currentUser || !targetUser) return false;

  if (currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.MANAGER_STAFF) return true;
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

export const formatForDateInput = (dateString: string): string => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString.split("T")[0];
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const canEditTask = (task: any, user: any): boolean => {
  if (!user || !task) return false;
  if (user.role === ROLES.ADMIN || user.role === ROLES.MANAGER_STAFF) return true;
  return task.created_by === user.id;
};

export const isTaskCompletedOverdue = (task: any): boolean => {
  if (!task || task.status !== "completed" || !task.due_date) return false;
  const dueDate = new Date(task.due_date);
  if (task.completed_at) {
    return new Date(task.completed_at) > dueDate;
  }
  return task.actual_status === "overdue";
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // Lead statuses
    [LEAD_STATUS.CONVERTED]: "success",
    [LEAD_STATUS.PROSPECTS]: "warning",
    [LEAD_STATUS.ASSIGNED]: "primary",
    [LEAD_STATUS.UNASSIGNED]: "default",
    [LEAD_STATUS.RINGING]: "warning",
    [LEAD_STATUS.CALL_BACK]: "warning",
    [LEAD_STATUS.FOLLOW_UP]: "yellow",
    [LEAD_STATUS.NOT_INTERESTED]: "error",
    [LEAD_STATUS.INVALID_CONTACT]: "error",
    [LEAD_STATUS.WHATSAPPED]: "success",
    [LEAD_STATUS.NOT_ON_WHATSAPP]: "default",
    [LEAD_STATUS.BUSY]: "warning", // ✅ Add
    [LEAD_STATUS.CALL_DISCONNECTED]: "secondary", // ✅ Add
    [LEAD_STATUS.NO_RESPONSE]: "info", // ✅ Add
    [LEAD_STATUS.SWITCHED_OFF]: "default", // ✅ Add
    [LEAD_STATUS.NOT_REACHABLE]: "secondary", // ✅ Add

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

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import {
  FileDownload as DownloadIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as ReportIcon,
  TrackChanges as TargetIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  performanceService,
  PerformanceReportRow,
} from "../../services/performanceService";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import SetTargetsPanel from "./SetTargetsPanel";

// ── Constants (outside component) ────────────────────────────────────────────

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

// Used in the UI table
const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

// Used ONLY in PDF — avoids ₹ HTML encoding issue in jsPDF
const formatINRPDF = (amount: number) =>
  "Rs. " +
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);

const PDF_TABLE_HEAD = [
  "Name",
  "Role",
  "Shift",
  "Type",
  "Manager",
  "Target (Rs.)",
  "Achieved (Rs.)",
  "Achievement %",
  "Overachievement %",
  "Counters Target",
  "Counters Achieved",
  "Counter Achievement %", // ADD
  "Notes",
];

const getPDFTableStyles = () => ({
  styles: { fontSize: 7.5, cellPadding: 2 },
  headStyles: {
    fillColor: [25, 118, 210] as [number, number, number],
    textColor: 255,
    fontStyle: "bold" as const,
  },
  alternateRowStyles: {
    fillColor: [245, 248, 255] as [number, number, number],
  },
  margin: { left: 10, right: 10 },
  didDrawCell(data: any) {
    // Do nothing — row highlighting is handled via didParseCell on the Name column
  },
  didParseCell(data: any) {
    if (data.section !== "body") return;

    // Get the row data via data.row.index
    const row = data.row.raw as string[];

    // Overachievement % is index 8
    if (data.column.index === 8) {
      const val = parseFloat(
        String(data.cell.raw).replace("%", "").replace("+", ""),
      );
      data.cell.styles.textColor = val >= 0 ? [46, 125, 50] : [211, 47, 47];
      data.cell.styles.fontStyle = "bold";
    }

    // Counter Achievement % is index 11
    if (data.column.index === 11) {
      const raw = String(data.cell.raw);
      if (raw !== "-") {
        const val = parseFloat(raw.replace("%", ""));
        data.cell.styles.textColor =
          val >= 100
            ? [46, 125, 50]
            : val >= 70
              ? [237, 108, 2]
              : [211, 47, 47];
        data.cell.styles.fontStyle = "bold";
      }
    }

    // Highlight entire row green if either target is 100%+ achieved
    const achievementPct = parseFloat(String(row[7]).replace("%", "")); // Achievement %
    const counterAchievePct =
      String(row[11]) !== "-"
        ? parseFloat(String(row[11]).replace("%", ""))
        : null;

    const eitherAchieved =
      achievementPct >= 100 ||
      (counterAchievePct !== null && counterAchievePct >= 100);

    if (eitherAchieved) {
      data.cell.styles.fillColor = [232, 245, 233]; // light green background
      data.cell.styles.textColor = data.cell.styles.textColor ?? [0, 0, 0];
    }
  },
});

// ── Component ─────────────────────────────────────────────────────────────────

const PerformanceReport: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // Tabs: 0 = Report, 1 = Set Targets (admin only)
  const [activeTab, setActiveTab] = useState(0);

  // Report filters
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [shift, setShift] = useState("");
  const [type, setType] = useState("");
  const [role, setRole] = useState("");
  const [countersTarget, setCountersTarget] = useState("");
  const [countersAchieved, setCountersAchieved] = useState("");

  // Inline edit dialog
  const [targetDialog, setTargetDialog] = useState(false);
  const [targetRow, setTargetRow] = useState<PerformanceReportRow | null>(null);
  const [targetAmount, setTargetAmount] = useState("");
  const [achievedAmount, setAchievedAmount] = useState("");
  const [notes, setNotes] = useState("");

  // ── Data fetching ───────────────────────────────────────────────────────────

  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: ["performance-report", month, year, shift, type, role],
    queryFn: () =>
      performanceService.getReport({
        month,
        year,
        shift: shift || undefined,
        type: type || undefined,
        role: role || undefined,
      }),
    enabled: activeTab === 0,
  });

  const rows: PerformanceReportRow[] = data?.data?.data ?? data?.data ?? [];

  // ── Mutations ───────────────────────────────────────────────────────────────

  const setTargetMutation = useMutation({
    mutationFn: performanceService.setTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-report"] });
      showNotification("Target saved successfully", "success");
      handleCloseDialog();
    },
    onError: () => showNotification("Failed to save target", "error"),
  });

  // ── Dialog handlers ─────────────────────────────────────────────────────────

  const handleOpenTarget = (row: PerformanceReportRow) => {
    setTargetRow(row);
    setTargetAmount(row.target_amount > 0 ? String(row.target_amount) : "");
    setAchievedAmount(
      row.achieved_amount > 0 ? String(row.achieved_amount) : "",
    );
    setCountersTarget(
      row.counters_target > 0 ? String(row.counters_target) : "",
    );
    setCountersAchieved(
      row.counters_achieved > 0 ? String(row.counters_achieved) : "",
    );
    setNotes(row.notes ?? "");
    setTargetDialog(true);
  };

  const handleCloseDialog = () => {
    setTargetDialog(false);
    setTargetRow(null);
    setTargetAmount("");
    setAchievedAmount("");
    setCountersTarget("");
    setCountersAchieved("");
    setNotes("");
  };

  const handleSaveTarget = () => {
    if (!targetRow || !targetAmount) return;
    setTargetMutation.mutate({
      user_id: targetRow.user_id,
      month,
      year,
      target_amount: parseFloat(targetAmount),
      achieved_amount: parseFloat(achievedAmount) || 0,
      counters_target: parseInt(countersTarget) || 0,
      counters_achieved: parseInt(countersAchieved) || 0,
      notes: notes || undefined,
    });
  };

  // ── Row mapper for PDF (inside component — accesses rows) ───────────────────

  const mapRowForPDF = (r: PerformanceReportRow) => [
    r.name,
    r.role,
    r.shift,
    r.type,
    r.manager_name,
    formatINRPDF(r.target_amount),
    formatINRPDF(r.achieved_amount),
    `${r.achievement_percent}%`,
    `${r.overachievement_percent > 0 ? "+" : ""}${r.overachievement_percent}%`,
    r.counters_target || "-", // ADD
    r.counters_achieved || "-", // ADD
    r.counters_target > 0 ? `${r.counters_achievement_percent}%` : "-", // ADD
    r.notes || "-",
  ];

  // ── Download Excel ──────────────────────────────────────────────────────────

  const downloadExcel = () => {
    const monthLabel = MONTHS.find((m) => m.value === month)?.label;
    const ws = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        Name: r.name,
        Role: r.role,
        Shift: r.shift,
        Type: r.type,
        Manager: r.manager_name,
        "Target (Rs.)": r.target_amount,
        "Achieved (Rs.)": r.achieved_amount,
        "Achievement %": r.achievement_percent,
        "Overachievement %": r.overachievement_percent,
        "Counters Target": r.counters_target || "-",
        "Counters Achieved": r.counters_achieved || "-",
        "Counter Achievement %":
          r.counters_target > 0 ? `${r.counters_achievement_percent}%` : "-",
        Notes: r.notes || "",
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Performance");
    XLSX.writeFile(wb, `Performance_${monthLabel}_${year}.xlsx`);
    showNotification("Excel downloaded", "success");
  };

  // ── Download PDF ────────────────────────────────────────────────────────────

  const downloadPDF = async () => {
    const monthLabel = MONTHS.find((m) => m.value === month)?.label;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pageW = doc.internal.pageSize.getWidth();

    // With this:
    try {
      const img = new Image();
      img.src = "/images/exporters-worlds-full-logo.png";
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL("image/png");
      doc.addImage(base64, "PNG", 10, 8, 36, 18);
    } catch {
      // fallback to placeholder if image fails
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(10, 8, 36, 18, 2, 2, "FD");
    }

    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const addressLines = [
      "J1/104, near by cylinder Chauraha, Keshavpuram,",
      "Awas Vikas Number 1, Kalyanpur,",
      "Kanpur, Uttar Pradesh 208017",
    ];
    addressLines.forEach((line, i) => {
      doc.text(line, pageW - 10, 11 + i * 4.5, { align: "right" });
    });

    // Divider
    doc.setDrawColor(25, 118, 210);
    doc.setLineWidth(0.5);
    doc.line(10, 28, pageW - 10, 28);

    // Report title
    doc.setFontSize(14);
    doc.setTextColor(25, 118, 210);
    doc.setFont("helvetica", "bold");
    doc.text(`Performance Report — ${monthLabel} ${year}`, 10, 36);
    doc.setFont("helvetica", "normal");

    // Active filters
    const filterParts: string[] = [];
    if (shift) filterParts.push(`Shift: ${shift}`);
    if (type) filterParts.push(`Type: ${type}`);
    if (role) filterParts.push(`Role: ${role}`);
    if (filterParts.length) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Filters: ${filterParts.join("  |  ")}`, 10, 42);
    }

    const isFiltered = shift !== "" || type !== "" || role !== "";
    let startY = filterParts.length ? 47 : 42;

    if (isFiltered) {
      // Single flat table when filters are applied
      autoTable(doc, {
        startY,
        head: [PDF_TABLE_HEAD],
        body: rows.map(mapRowForPDF),
        ...getPDFTableStyles(),
      });
    } else {
      // Group by Type + Shift
      const combos = [
        { type: "Domestic", shift: "Day" },
        { type: "Domestic", shift: "Night" },
        { type: "International", shift: "Day" },
        { type: "International", shift: "Night" },
      ];

      const groups: { label: string; data: PerformanceReportRow[] }[] = [];

      combos.forEach(({ type: t, shift: s }) => {
        const grouped = rows.filter((r) => r.type === t && r.shift === s);
        if (grouped.length > 0) {
          groups.push({ label: `${t} — ${s} Shift`, data: grouped });
        }
      });

      // Users with missing type/shift
      const ungrouped = rows.filter((r) => r.type === "-" || r.shift === "-");
      if (ungrouped.length > 0) {
        groups.push({ label: "Others", data: ungrouped });
      }

      groups.forEach((group) => {
        // Blue section heading bar
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(25, 118, 210);
        doc.roundedRect(10, startY, pageW - 20, 7, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.text(group.label, 14, startY + 5);
        doc.setFont("helvetica", "normal");

        autoTable(doc, {
          startY: startY + 8,
          head: [PDF_TABLE_HEAD],
          body: group.data.map(mapRowForPDF),
          ...getPDFTableStyles(),
        });

        startY = (doc as any).lastAutoTable.finalY + 8;
      });
    }

    // Motivational closing section
    const finalY = (doc as any).lastAutoTable.finalY + 12;
    const centerX = pageW / 2;

    // Divider
    doc.setDrawColor(25, 118, 210);
    doc.setLineWidth(0.3);
    doc.line(10, finalY, pageW - 10, finalY);

    // Quote
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bolditalic");
    doc.text(
      ` "Your dream doesn't have an expiry date. Take a deep breath,`,
      centerX,
      finalY + 8,
      { align: "center" },
    );
    doc.text(
      `reset your goals, and go harder next month!" `,
      centerX,
      finalY + 14,
      { align: "center" },
    );

    // Report created by line
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Report created by: Sales Manager  |  ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
      centerX,
      finalY + 22,
      { align: "center" },
    );

    // Footer on every page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}  |  Generated on ${new Date().toLocaleDateString("en-IN")}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" },
      );
    }

    doc.save(`Performance_${monthLabel}_${year}.pdf`);
    showNotification("PDF downloaded", "success");
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* Page Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={600}>
          Target Performance Report
        </Typography>

        {activeTab === 0 && (
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={() => refetch()} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadExcel}
              disabled={rows.length === 0}
            >
              Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadPDF}
              disabled={rows.length === 0}
            >
              PDF
            </Button>
          </Box>
        )}
      </Box>

      {/* Tabs — admin only */}
      {user?.role === "admin" && (
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab
              icon={<ReportIcon />}
              iconPosition="start"
              label="Report"
              value={0}
            />
            <Tab
              icon={<TargetIcon />}
              iconPosition="start"
              label="Set Targets"
              value={1}
            />
          </Tabs>
        </Paper>
      )}

      {/* ── Report Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 0 && (
        <>
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={month}
                  label="Month"
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {MONTHS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={year}
                  label="Year"
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {YEARS.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Shift</InputLabel>
                <Select
                  value={shift}
                  label="Shift"
                  onChange={(e) => setShift(e.target.value)}
                >
                  <MenuItem value="">All Shifts</MenuItem>
                  <MenuItem value="Day">Day</MenuItem>
                  <MenuItem value="Night">Night</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={type}
                  label="Type"
                  onChange={(e) => setType(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Domestic">Domestic</MenuItem>
                  <MenuItem value="International">International</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="salesperson">Salesperson</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Table */}
          <Paper sx={{ p: 2 }}>
            {isLoading ? (
              <Box py={6} display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            ) : rows.length === 0 ? (
              <Alert severity="info">
                No data found for the selected filters.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Role</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Shift</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Type</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Manager</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Target (₹)</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Achieved (₹)</strong>
                      </TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <strong>Achievement</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Overachievement</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Counters Target</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Counters Achieved</strong>
                      </TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <strong>Counter Achievement</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Notes</strong>
                      </TableCell>
                      {user?.role === "admin" && (
                        <TableCell align="center">
                          <strong>Edit</strong>
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => {
                      const isOver = row.overachievement_percent >= 0;
                      const progressColor =
                        row.achievement_percent >= 100
                          ? "success"
                          : row.achievement_percent >= 70
                            ? "warning"
                            : "error";

                      return (
                        <TableRow key={row.user_id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {row.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.role}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{row.shift}</TableCell>
                          <TableCell>{row.type}</TableCell>
                          <TableCell>{row.manager_name}</TableCell>

                          <TableCell align="right">
                            {row.target_amount > 0 ? (
                              formatINR(row.target_amount)
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Not set
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell align="right">
                            {formatINR(row.achieved_amount)}
                          </TableCell>

                          <TableCell>
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {row.achievement_percent}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(row.achievement_percent, 100)}
                                color={progressColor}
                                sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                              />
                            </Box>
                          </TableCell>

                          <TableCell align="center">
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              gap={0.5}
                            >
                              {isOver ? (
                                <TrendingUpIcon
                                  fontSize="small"
                                  color="success"
                                />
                              ) : (
                                <TrendingDownIcon
                                  fontSize="small"
                                  color="error"
                                />
                              )}
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color={isOver ? "success.main" : "error.main"}
                              >
                                {isOver ? "+" : ""}
                                {row.overachievement_percent}%
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell align="center">
                            {row.counters_target || "-"}
                          </TableCell>
                          <TableCell align="center">
                            {row.counters_achieved || "-"}
                          </TableCell>
                          <TableCell>
                            {row.counters_target > 0 ? (
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {row.counters_achievement_percent}%
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(
                                    row.counters_achievement_percent,
                                    100,
                                  )}
                                  color={
                                    row.counters_achievement_percent >= 100
                                      ? "success"
                                      : row.counters_achievement_percent >= 70
                                        ? "warning"
                                        : "error"
                                  }
                                  sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                                />
                              </Box>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Not set
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell sx={{ maxWidth: 200 }}>
                            <Typography
                              variant="body2"
                              color={
                                row.notes ? "text.primary" : "text.secondary"
                              }
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 180,
                              }}
                              title={row.notes || ""}
                            >
                              {row.notes || "-"}
                            </Typography>
                          </TableCell>

                          {user?.role === "admin" && (
                            <TableCell align="center">
                              <Tooltip
                                title={
                                  row.target_id ? "Edit Target" : "Set Target"
                                }
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenTarget(row)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}

      {/* ── Set Targets Tab ─────────────────────────────────────────────────── */}
      {activeTab === 1 && user?.role === "admin" && <SetTargetsPanel />}

      {/* ── Inline Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog
        open={targetDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {targetRow?.target_id ? "Edit Target" : "Set Target"} —{" "}
          {targetRow?.name}
        </DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: "16px !important",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {MONTHS.find((m) => m.value === month)?.label} {year}
            {targetRow?.shift !== "-" ? ` • ${targetRow?.shift}` : ""}
            {targetRow?.type !== "-" ? ` • ${targetRow?.type}` : ""}
          </Typography>

          <Divider />

          <TextField
            label="Target Amount (₹) *"
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            fullWidth
            inputProps={{ min: 0 }}
            autoFocus
          />

          <TextField
            label="Achieved Amount (₹)"
            type="number"
            value={achievedAmount}
            onChange={(e) => setAchievedAmount(e.target.value)}
            fullWidth
            inputProps={{ min: 0 }}
          />

          <TextField
            label="Counters Target"
            type="number"
            value={countersTarget}
            onChange={(e) => setCountersTarget(e.target.value)}
            fullWidth
            inputProps={{ min: 0 }}
            placeholder="Number of clients target"
          />
          <TextField
            label="Counters Achieved"
            type="number"
            value={countersAchieved}
            onChange={(e) => setCountersAchieved(e.target.value)}
            fullWidth
            inputProps={{ min: 0 }}
            placeholder="Number of clients achieved"
          />

          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            placeholder="Add any remarks or notes..."
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTarget}
            disabled={!targetAmount || setTargetMutation.isPending}
          >
            {setTargetMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerformanceReport;

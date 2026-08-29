"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Add,
  ChevronLeft,
  ChevronRight,
  DeleteOutlined,
  EditOutlined,
  Lock,
  Print,
  Search,
  TrendingDown,
  TrendingUp,
  Visibility,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

type InvestItem = {
  id: number;
  dateTime: string;
  itemName: string;
  weight: number;
  quantity: number;
  quantityPerPack: number;
  rate: number;
  marketRate: number;
  month?: number;
  year?: number;
  isClosed?: boolean;
  closedAt?: string | null;
};

type InvestmentMonth = {
  month: number;
  year: number;
  isClosed: boolean;
  closedAt: string | null;
  items: InvestItem[];
  totalItems: number;
  totalInvestment: number;
  totalMarketValue: number;
  totalProfit: number;
};

type InvestForm = {
  itemName: string;
  weight: string;
  quantity: string;
  quantityPerPack: string;
  rate: string;
  marketRate: string;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const emptyForm: InvestForm = {
  itemName: "",
  weight: "",
  quantity: "",
  quantityPerPack: "",
  rate: "",
  marketRate: "",
};

const formatPrice = (value: number) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  })}`;

const formatNumber = (value: number) =>
  Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  });

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getMonthLabel = (month: number, year: number) => `${MONTH_NAMES[month - 1] ?? "Month"} ${year}`;

export default function InvestPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [currentMonthData, setCurrentMonthData] = useState<InvestmentMonth | null>(null);
  const [history, setHistory] = useState<InvestmentMonth[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<InvestForm>({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [closingMonth, setClosingMonth] = useState(false);
  const [viewingMonth, setViewingMonth] = useState<InvestmentMonth | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const isClosed = currentMonthData?.isClosed ?? false;
  const items = useMemo(() => currentMonthData?.items ?? [], [currentMonthData]);

  const filteredItems = useMemo(() => {
    const key = search.trim().toLowerCase();
    if (!key) return items;
    return items.filter((item) => item.itemName.toLowerCase().includes(key));
  }, [items, search]);

  const showSnackbar = useCallback((message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const loadMonthData = useCallback(async () => {
    try {
      const response = await fetch(`/api/invest?month=${selectedMonth}&year=${selectedYear}`, {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load investment month.");
      }
      setCurrentMonthData(payload);
    } catch (error) {
      console.error("Failed to load month data:", error);
      showSnackbar(error instanceof Error ? error.message : "Failed to load month data.", "error");
    }
  }, [selectedMonth, selectedYear, showSnackbar]);

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/invest?closed=true", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load investment history.");
      }
      setHistory(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }, []);

  useEffect(() => {
    loadMonthData();
    loadHistory();
  }, [loadMonthData, loadHistory]);

  const calculateRatePerUnit = (rate: number, quantityPerPack: number) => {
    if (quantityPerPack <= 0) return 0;
    return rate / quantityPerPack;
  };

  const calculateMarketRatePerUnit = (marketRate: number, quantityPerPack: number) => {
    if (quantityPerPack <= 0) return 0;
    return marketRate / quantityPerPack;
  };

  const calculateMarginPerUnit = (item: InvestItem) => {
    return (
      calculateMarketRatePerUnit(item.marketRate, item.quantityPerPack) -
      calculateRatePerUnit(item.rate, item.quantityPerPack)
    );
  };

  const calculateProfit = useCallback((item: InvestItem) => calculateMarginPerUnit(item) * item.quantity, []);

  const summary = useMemo(() => {
    let totalQuantity = 0;
    let totalInvestment = 0;
    let totalMarketValue = 0;
    let totalProfit = 0;

    items.forEach((item) => {
      totalQuantity += item.quantity;
      totalInvestment += item.rate * item.quantity;
      totalMarketValue += item.marketRate * item.quantity;
      totalProfit += calculateProfit(item);
    });

    const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
    return { totalQuantity, totalInvestment, totalMarketValue, totalProfit, profitPercentage };
  }, [items]);

  const liveQuantity = Number(form.quantity) || 0;
  const liveQuantityPerPack = Number(form.quantityPerPack) || 0;
  const liveRate = Number(form.rate) || 0;
  const liveMarketRate = Number(form.marketRate) || 0;
  const liveRatePerUnit = calculateRatePerUnit(liveRate, liveQuantityPerPack);
  const liveMarketRatePerUnit = calculateMarketRatePerUnit(liveMarketRate, liveQuantityPerPack);
  const liveMarginPerUnit = liveMarketRatePerUnit - liveRatePerUnit;
  const liveProfit = liveMarginPerUnit * liveQuantity;
  const liveProfitPercentage = liveRatePerUnit > 0 ? (liveMarginPerUnit / liveRatePerUnit) * 100 : 0;

  const handleChange = (field: keyof InvestForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAddModal = () => {
    if (isClosed) {
      showSnackbar("This month is closed. You cannot add more investment records here.", "error");
      return;
    }
    setEditingId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEditModal = (item: InvestItem) => {
    if (isClosed || item.isClosed) {
      showSnackbar("This month is closed. You cannot edit old investment records.", "error");
      return;
    }
    setEditingId(item.id);
    setForm({
      itemName: item.itemName,
      weight: String(item.weight),
      quantity: String(item.quantity),
      quantityPerPack: String(item.quantityPerPack),
      rate: String(item.rate),
      marketRate: String(item.marketRate),
    });
    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const saveItem = async () => {
    const itemName = form.itemName.trim();
    const weight = Number(form.weight);
    const quantity = Number(form.quantity);
    const quantityPerPack = Number(form.quantityPerPack);
    const rate = Number(form.rate);
    const marketRate = Number(form.marketRate);

    if (!itemName || !Number.isFinite(weight) || !Number.isFinite(quantity) || !Number.isFinite(quantityPerPack) || !Number.isFinite(rate) || !Number.isFinite(marketRate)) {
      showSnackbar("Please fill all fields correctly.", "error");
      return;
    }

    if (weight <= 0 || quantity <= 0 || quantityPerPack <= 0 || rate < 0 || marketRate < 0) {
      showSnackbar("Please enter valid values for weight, quantity, and rates.", "error");
      return;
    }

    const existingItem = editingId !== null ? items.find((item) => item.id === editingId) : undefined;

    setSaving(true);
    try {
      const body = {
        ...existingItem,
        itemName,
        weight,
        quantity,
        quantityPerPack,
        rate,
        marketRate,
        dateTime: existingItem?.dateTime ?? new Date().toISOString(),
      };

      const response = await fetch(editingId !== null ? `/api/invest/${editingId}` : "/api/invest", {
        method: editingId !== null ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || result?.error || "Failed to save investment.");
      }

      showSnackbar(editingId !== null ? "Investment updated successfully." : "Investment added successfully.", "success");
      await loadMonthData();
      await loadHistory();
      closeModal();
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : "Failed to save investment.", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: number) => {
    const item = items.find((investment) => investment.id === id);
    if (!item) return;
    if (isClosed || item.isClosed) {
      showSnackbar("This month is closed. You cannot delete old investment records.", "error");
      return;
    }

    const confirmed = window.confirm(`Delete "${item.itemName}" investment?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/invest/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || result?.error || "Failed to delete investment.");
      }
      showSnackbar("Investment deleted successfully.", "success");
      await loadMonthData();
      await loadHistory();
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : "Failed to delete investment.", "error");
    }
  };

  const handleCloseMonth = async () => {
    if (!window.confirm(`Close ${getMonthLabel(selectedMonth, selectedYear)}?`)) return;

    setClosingMonth(true);
    try {
      const response = await fetch("/api/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close-month", month: selectedMonth, year: selectedYear }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Failed to close month.");
      showSnackbar("Month closed successfully.", "success");
      const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
      const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
      setSelectedMonth(nextMonth);
      setSelectedYear(nextYear);
      await loadMonthData();
      await loadHistory();
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : "Unable to close month.", "error");
    } finally {
      setClosingMonth(false);
    }
  };

  const goPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const goNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const openHistoryDialog = (month: InvestmentMonth) => {
    setViewingMonth(month);
    setViewDialogOpen(true);
  };

  const printHistoryMonth = (month: InvestmentMonth) => {
    const rows = month.items.map((item, index) => {
      const profit = (item.marketRate - item.rate) * item.quantity;
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.itemName}</td>
          <td>${item.weight}</td>
          <td>${item.quantity}</td>
          <td>Rs. ${item.rate.toLocaleString("en-PK")}</td>
          <td>Rs. ${item.marketRate.toLocaleString("en-PK")}</td>
          <td>Rs. ${(item.marketRate - item.rate).toLocaleString("en-PK", { maximumFractionDigits: 2 })}</td>
          <td>Rs. ${profit.toLocaleString("en-PK", { maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join("");

    const printWindow = window.open("", "", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Investment Report - ${getMonthLabel(month.month, month.year)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
          .summary { margin: 20px 0; }
        </style>
      </head>
      <body>
        <h2>Investment Report</h2>
        <div class="summary">
          <p><strong>Month:</strong> ${getMonthLabel(month.month, month.year)}</p>
          <p><strong>Status:</strong> ${month.isClosed ? "CLOSED" : "OPEN"}</p>
          <p><strong>Total Items:</strong> ${month.totalItems}</p>
          <p><strong>Total Investment:</strong> Rs. ${month.totalInvestment.toLocaleString("en-PK", { maximumFractionDigits: 2 })}</p>
          <p><strong>Total Profit:</strong> Rs. ${month.totalProfit.toLocaleString("en-PK", { maximumFractionDigits: 2 })}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Weight</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Market Rate</th>
              <th>Margin</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2, mb: 4 }}>
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <TrendingUp color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Investments</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage stock investment, market value and expected profit.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openAddModal} disabled={isClosed}>Add Investment</Button>
      </Stack>

      <Card sx={{ mb: 3, border: "1px solid", borderColor: isClosed ? "warning.main" : "primary.main", borderRadius: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" }, gap: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <IconButton onClick={goPreviousMonth} size="small"><ChevronLeft /></IconButton>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{getMonthLabel(selectedMonth, selectedYear)}</Typography>
              <IconButton onClick={goNextMonth} size="small"><ChevronRight /></IconButton>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Chip label={isClosed ? "CLOSED" : "OPEN"} color={isClosed ? "warning" : "success"} />
              {!isClosed && (
                <Button variant="outlined" color="warning" onClick={handleCloseMonth} disabled={closingMonth || (items.length === 0)}>
                  {closingMonth ? "Closing..." : "Close Month"}
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Investments</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>{filteredItems.length}</Typography>
              <Typography variant="caption" color="text.secondary">Records</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Quantity</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>{formatNumber(summary.totalQuantity)}</Typography>
              <Typography variant="caption" color="text.secondary">Total units</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Investment</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>{formatPrice(summary.totalInvestment)}</Typography>
              <Typography variant="caption" color="text.secondary">Purchase value</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: summary.totalProfit >= 0 ? "success.main" : "error.main", borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Expected Profit</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 800, color: summary.totalProfit >= 0 ? "success.main" : "error.main" }}>{formatPrice(summary.totalProfit)}</Typography>
              <Typography variant="caption" color="text.secondary">{summary.profitPercentage.toFixed(2)}% margin</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" } }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Investment List</Typography>
              <Typography variant="body2" color="text.secondary">Current month investment records</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                size="small"
                placeholder="Search item..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{ minWidth: { sm: 260 } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Chip label={`${filteredItems.length} Records`} color="primary" variant="outlined" />
            </Stack>
          </Stack>
        </Box>
        <Divider />

        {items.length === 0 ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <TrendingUp sx={{ fontSize: 60, color: "text.disabled" }} />
            <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>No Investments</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Start by adding your first investment.</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={openAddModal} disabled={isClosed}>Add Investment</Button>
          </Box>
        ) : filteredItems.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Search sx={{ fontSize: 50, color: "text.disabled" }} />
            <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>No matching investment</Typography>
            <Typography variant="body2" color="text.secondary">Try another item name.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 650, overflowX: "auto" }}>
            <Table stickyHeader sx={{ minWidth: 1500 }}>
              <TableHead>
                <TableRow>
                  <TableCell><b>#</b></TableCell>
                  <TableCell><b>Date</b></TableCell>
                  <TableCell><b>Item</b></TableCell>
                  <TableCell align="right"><b>Weight</b></TableCell>
                  <TableCell align="right"><b>Qty</b></TableCell>
                  <TableCell align="right"><b>Qty / Pack</b></TableCell>
                  <TableCell align="right"><b>Rate</b></TableCell>
                  <TableCell align="right"><b>Market Rate</b></TableCell>
                  <TableCell align="right"><b>Rate / Unit</b></TableCell>
                  <TableCell align="right"><b>Market / Unit</b></TableCell>
                  <TableCell align="right"><b>Margin</b></TableCell>
                  <TableCell align="right"><b>Profit</b></TableCell>
                  <TableCell align="center"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item, index) => {
                  const ratePerUnit = calculateRatePerUnit(item.rate, item.quantityPerPack);
                  const marketPerUnit = calculateMarketRatePerUnit(item.marketRate, item.quantityPerPack);
                  const margin = marketPerUnit - ratePerUnit;
                  const profit = calculateProfit(item);

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell><Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>{formatDateTime(item.dateTime)}</Typography></TableCell>
                      <TableCell><Typography sx={{ fontWeight: 700 }}>{item.itemName}</Typography></TableCell>
                      <TableCell align="right">{formatNumber(item.weight)}</TableCell>
                      <TableCell align="right">{formatNumber(item.quantity)}</TableCell>
                      <TableCell align="right">{formatNumber(item.quantityPerPack)}</TableCell>
                      <TableCell align="right">{formatPrice(item.rate)}</TableCell>
                      <TableCell align="right">{formatPrice(item.marketRate)}</TableCell>
                      <TableCell align="right">{formatPrice(ratePerUnit)}</TableCell>
                      <TableCell align="right">{formatPrice(marketPerUnit)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: margin >= 0 ? "success.main" : "error.main" }}>{formatPrice(margin)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: profit >= 0 ? "success.main" : "error.main" }}>{formatPrice(profit)}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={() => openEditModal(item)} disabled={isClosed || item.isClosed}><EditOutlined fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteItem(item.id)} disabled={isClosed || item.isClosed}><DeleteOutlined fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}

                <TableRow>
                  <TableCell colSpan={11} align="right"><Typography sx={{ fontWeight: 800 }}>GRAND TOTAL</Typography></TableCell>
                  <TableCell align="right"><Typography sx={{ fontWeight: 800, color: summary.totalProfit >= 0 ? "success.main" : "error.main" }}>{formatPrice(summary.totalProfit)}</Typography></TableCell>
                  <TableCell /></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {history.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Previous Months / History</Typography>
          <Stack spacing={2}>
            {history.map((month) => (
              <Card key={`${month.month}-${month.year}`} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                <CardContent>
                  <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2 }}>
                    <Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{getMonthLabel(month.month, month.year)}</Typography>
                        <Chip label="CLOSED" color="warning" size="small" icon={<Lock sx={{ fontSize: 16 }} />} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{month.totalItems} items • {formatPrice(month.totalInvestment)} investment • {formatPrice(month.totalProfit)} profit</Typography>
                    </Box>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button variant="outlined" startIcon={<Visibility />} size="small" onClick={() => openHistoryDialog(month)}>View</Button>
                      <Button variant="outlined" startIcon={<Print />} size="small" onClick={() => printHistoryMonth(month)}>Print</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      <Dialog open={open} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{editingId !== null ? "Edit Investment" : "Add Investment"}</Typography>
          <Typography variant="body2" color="text.secondary">Enter stock investment details below.</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={12}><TextField fullWidth label="Item Name" value={form.itemName} onChange={(event) => handleChange("itemName", event.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Weight" type="number" value={form.weight} onChange={(event) => handleChange("weight", event.target.value)} slotProps={{ htmlInput: { min: 0, step: "any" } }} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Quantity" type="number" value={form.quantity} onChange={(event) => handleChange("quantity", event.target.value)} slotProps={{ htmlInput: { min: 1, step: "any" } }} /></Grid>
            <Grid size={12}><TextField fullWidth label="Quantity per Carton / Dozen" type="number" value={form.quantityPerPack} onChange={(event) => handleChange("quantityPerPack", event.target.value)} helperText="Example: 12 pieces in one carton" slotProps={{ htmlInput: { min: 1, step: "any" } }} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Purchase Rate" type="number" value={form.rate} onChange={(event) => handleChange("rate", event.target.value)} slotProps={{ htmlInput: { min: 0, step: "any" } }} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Market Rate" type="number" value={form.marketRate} onChange={(event) => handleChange("marketRate", event.target.value)} slotProps={{ htmlInput: { min: 0, step: "any" } }} /></Grid>

            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Automatic Calculation</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Purchase / Unit</Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800 }}>{formatPrice(liveRatePerUnit)}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Market / Unit</Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800 }}>{formatPrice(liveMarketRatePerUnit)}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: liveMarginPerUnit >= 0 ? "success.main" : "error.main", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Margin / Unit</Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800, color: liveMarginPerUnit >= 0 ? "success.main" : "error.main" }}>{formatPrice(liveMarginPerUnit)}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={12}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: liveProfit >= 0 ? "success.main" : "error.main", bgcolor: liveProfit >= 0 ? "success.50" : "error.50", borderRadius: 2 }}>
                <CardContent>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Expected Total Profit</Typography>
                      <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800, color: liveProfit >= 0 ? "success.main" : "error.main" }}>{formatPrice(liveProfit)}</Typography>
                      <Typography variant="caption" color="text.secondary">{liveProfitPercentage.toFixed(2)}% expected return</Typography>
                    </Box>
                    {liveProfit >= 0 ? <TrendingUp sx={{ fontSize: 45, color: "success.main" }} /> : <TrendingDown sx={{ fontSize: 45, color: "error.main" }} />}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeModal} color="inherit" disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={saveItem} disabled={saving} startIcon={editingId !== null ? <EditOutlined /> : <Add />}>
            {saving ? "Saving..." : editingId !== null ? "Update Investment" : "Add Investment"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{viewingMonth ? getMonthLabel(viewingMonth.month, viewingMonth.year) : "Month Record"}</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {viewingMonth && (
            <>
              <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
                <Chip label="CLOSED" color="warning" size="small" icon={<Lock sx={{ fontSize: 16 }} />} />
                <Typography variant="body2" color="text.secondary">{viewingMonth.totalItems} items • {formatPrice(viewingMonth.totalInvestment)} invested • {formatPrice(viewingMonth.totalProfit)} profit</Typography>
              </Stack>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><b>#</b></TableCell>
                      <TableCell><b>Item</b></TableCell>
                      <TableCell align="right"><b>Weight</b></TableCell>
                      <TableCell align="right"><b>Qty</b></TableCell>
                      <TableCell align="right"><b>Rate</b></TableCell>
                      <TableCell align="right"><b>Market Rate</b></TableCell>
                      <TableCell align="right"><b>Profit</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewingMonth.items.map((item, index) => {
                      const profit = (item.marketRate - item.rate) * item.quantity;
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell align="right">{formatNumber(item.weight)}</TableCell>
                          <TableCell align="right">{formatNumber(item.quantity)}</TableCell>
                          <TableCell align="right">{formatPrice(item.rate)}</TableCell>
                          <TableCell align="right">{formatPrice(item.marketRate)}</TableCell>
                          <TableCell align="right">{formatPrice(profit)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {viewingMonth && <Button variant="contained" startIcon={<Print />} onClick={() => { printHistoryMonth(viewingMonth); setViewDialogOpen(false); }}>Print</Button>}
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

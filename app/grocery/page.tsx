"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Add,
  ArrowBackIosNew,
  ArrowForwardIos,
  CalendarMonth,
  Close,
  DeleteOutlined,
  EditOutlined,
  LocalGroceryStore,
  Lock,
  Print,
  Search,
  Visibility,
} from "@mui/icons-material";
import {
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
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  useCloseGroceryMonth,
  useCreateGrocery,
  useDeleteGrocery,
  useGrocery,
  useGroceryHistory,
  useGroceryMonth,
  useGrocerySearch,
  useUpdateGrocery,
} from "@/lib/hooks/useGrocery";
import type { GroceryItem, GroceryMonth } from "@/lib/api/grocery";
import LoadingScreen from "@/components/LoadingScreen";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Popover from "@mui/material/Popover";

type GroceryForm = {
  itemName: string;
  date: string;
  weight: string;
  quantity: string;
  rate: string;
  transportation: string;
  sellingPrice: string;
};

const emptyForm: GroceryForm = {
  itemName: "",
  date: dayjs().format("YYYY-MM-DD"),
  weight: "",
  quantity: "",
  rate: "",
  transportation: "",
  sellingPrice: "",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function GroceryPage() {
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<GroceryForm>(emptyForm);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [viewingMonth, setViewingMonth] = useState<GroceryMonth | null>(null);

  useEffect(() => {
    const now = new Date();
    setCurrentMonth(now.getMonth() + 1);
    setCurrentYear(now.getFullYear());
    setSelectedDate(dayjs(now));
  }, []);

  const selectedDateKey = selectedDate?.format("YYYY-MM-DD");
  const currentGroceryQuery = useGrocery(currentMonth, currentYear, selectedDateKey);
  const historyQuery = useGroceryHistory();
  const searchQuery_ = useGrocerySearch(searchQuery, currentMonth, currentYear, selectedDateKey);
  const viewMonthQuery = useGroceryMonth(viewingMonth?.month ?? 0, viewingMonth?.year ?? 0);

  const createMutation = useCreateGrocery();
  const updateMutation = useUpdateGrocery();
  const deleteMutation = useDeleteGrocery();
  const closeMonthMutation = useCloseGroceryMonth();

  const items = useMemo(() => {
    if (searchQuery.length > 0) {
      return searchQuery_.data ?? [];
    }
    return currentGroceryQuery.data?.items ?? [];
  }, [searchQuery, searchQuery_.data, currentGroceryQuery.data?.items]);

  const currentMonthData = useMemo(() => {
    if (searchQuery.length > 0) {
      return null;
    }
    return currentGroceryQuery.data;
  }, [searchQuery, currentGroceryQuery.data]);

  const isClosed = currentMonthData?.isClosed ?? false;
  const history = historyQuery.data ?? [];

  const formatPrice = (value: number) => {
    return `Rs. ${value.toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
  };

  const formatEntryDate = (value: string | null | undefined) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const getCostPerKg = (item: GroceryItem) => {
    if (item.weight <= 0) return 0;
    return (item.rate + item.transportation) / item.weight;
  };

  const getMarginPerKg = (item: GroceryItem) => {
    return item.sellingPrice - getCostPerKg(item);
  };

  const getMarginPercent = (item: GroceryItem) => {
    const costPerKg = getCostPerKg(item);
    if (costPerKg <= 0) return 0;
    return (getMarginPerKg(item) / costPerKg) * 100;
  };

  const getTotalSales = (item: GroceryItem) => {
    return item.sellingPrice * item.weight * item.quantity;
  };

  const getTotalCost = (item: GroceryItem) => {
    return (item.rate + item.transportation) * item.quantity;
  };

  const getTotalProfit = (item: GroceryItem) => {
    return getTotalSales(item) - getTotalCost(item);
  };

  const handleChange = (field: keyof GroceryForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAddDialog = () => {
    if (isClosed) {
      showSnackbar("Cannot add items to a closed month.", "error");
      return;
    }
    setEditingId(null);
    setForm({
      ...emptyForm,
      date: selectedDateKey || dayjs().format("YYYY-MM-DD"),
    });
    setOpenAddModal(true);
  };

  const openEditDialog = (item: GroceryItem) => {
    if (isClosed) {
      showSnackbar("Cannot edit items in a closed month.", "error");
      return;
    }
    setEditingId(item.id);
    setForm({
      itemName: item.itemName,
      date: item.entryDate ? item.entryDate.split("T")[0] : dayjs().format("YYYY-MM-DD"),
      weight: String(item.weight),
      quantity: String(item.quantity),
      rate: String(item.rate),
      transportation: String(item.transportation),
      sellingPrice: String(item.sellingPrice),
    });
    setOpenAddModal(true);
  };

  const closeAddModal = () => {
    setOpenAddModal(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const closeViewModal = () => {
    setOpenViewModal(false);
    setViewingMonth(null);
  };

  const saveItem = async () => {
    const itemName = form.itemName.trim();
    const entryDate = form.date || selectedDateKey || dayjs().format("YYYY-MM-DD");
    const weight = Number(form.weight);
    const quantity = Number(form.quantity);
    const rate = Number(form.rate);
    const transportation = Number(form.transportation);
    const sellingPrice = Number(form.sellingPrice);

    if (
      !itemName ||
      !entryDate ||
      weight <= 0 ||
      quantity <= 0 ||
      rate < 0 ||
      transportation < 0 ||
      sellingPrice <= 0
    ) {
      showSnackbar("Please fill all fields correctly.", "error");
      return;
    }

    try {
      if (editingId !== null) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload: {
            itemName,
            weight,
            quantity,
            rate,
            transportation,
            sellingPrice,
            entryDate,
          },
        });
        showSnackbar("Item updated successfully.", "success");
      } else {
        await createMutation.mutateAsync({
          itemName,
          weight,
          quantity,
          rate,
          transportation,
          sellingPrice,
          entryDate,
        });
        showSnackbar("Item added successfully.", "success");
      }
      closeAddModal();
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : "Failed to save item.", "error");
    }
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      showSnackbar("Item deleted successfully.", "success");
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : "Failed to delete item.", "error");
    }
  };

  const handleCloseMonth = async () => {
    if (!window.confirm(`Are you sure you want to close ${MONTH_NAMES[currentMonth - 1]} ${currentYear} Grocery?`)) {
      return;
    }

    try {
      await closeMonthMutation.mutateAsync({ month: currentMonth, year: currentYear });
      showSnackbar("Month closed successfully.", "success");
      
      const today = dayjs();
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const nextPeriod = dayjs(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01`);

      if (!nextPeriod.isAfter(today, "month")) {
        setCurrentMonth(nextMonth);
        setCurrentYear(nextYear);
        setSelectedDate(nextPeriod);
      }
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : "Failed to close month.", "error");
    }
  };

  const currentMonthDate = dayjs().startOf("month");
  const displayedMonth = selectedDate ?? dayjs();
  const rangeStart = displayedMonth.startOf("month");
  const rangeEnd = displayedMonth.endOf("month").isAfter(dayjs(), "day")
    ? dayjs()
    : displayedMonth.endOf("month");
  const canGoNext = displayedMonth.startOf("month").isBefore(currentMonthDate, "month");

  const handleMonthChange = (value: Dayjs | null) => {
    if (!value) return;

    const nextMonth = value.startOf("month");
    if (nextMonth.isAfter(currentMonthDate, "month")) {
      showSnackbar("Future months are not available.", "error");
      return;
    }

    setSelectedDate(nextMonth);
    setCurrentMonth(nextMonth.month() + 1);
    setCurrentYear(nextMonth.year());
  };

  const moveMonth = (amount: number) => {
    const nextMonth = displayedMonth.add(amount, "month").startOf("month");
    if (nextMonth.isAfter(currentMonthDate, "month")) return;
    setSelectedDate(nextMonth);
    setCurrentMonth(nextMonth.month() + 1);
    setCurrentYear(nextMonth.year());
  };

  const handlePrintMonth = (month: GroceryMonth) => {
    const itemRows = month.items.map((item, idx) => {
      const costPerKg = (item.rate + item.transportation) / item.weight;
      const totalSales = item.sellingPrice * item.weight * item.quantity;
      const totalCost = (item.rate + item.transportation) * item.quantity;
      const totalProfit = totalSales - totalCost;
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.itemName}</td>
          <td>${item.weight}</td>
          <td>${item.quantity}</td>
          <td>Rs. ${item.rate.toLocaleString()}</td>
          <td>Rs. ${item.transportation.toLocaleString()}</td>
          <td>Rs. ${costPerKg.toFixed(2)}</td>
          <td>Rs. ${item.sellingPrice.toLocaleString()}</td>
          <td>Rs. ${totalSales.toLocaleString("en-PK", { maximumFractionDigits: 2 })}</td>
          <td>Rs. ${totalProfit.toLocaleString("en-PK", { maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join("");

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Grocery Report - ${MONTH_NAMES[month.month - 1]} ${month.year}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .summary { margin: 20px 0; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>GROCERY REPORT</h1>
        <div class="summary">
          <p><strong>Month:</strong> ${MONTH_NAMES[month.month - 1]} ${month.year}</p>
          <p><strong>Status:</strong> ${month.isClosed ? "CLOSED" : "OPEN"}</p>
          ${month.closedAt ? `<p><strong>Closed Date:</strong> ${new Date(month.closedAt).toLocaleDateString()}</p>` : ""}
        </div>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Item Name</th>
              <th>Weight (KG)</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Transport</th>
              <th>Cost/KG</th>
              <th>Selling/KG</th>
              <th>Total Sales</th>
              <th>Total Profit</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
        <div class="summary">
          <strong>Totals:</strong>
          <p>Total Items: ${month.totalItems}</p>
          <p>Total Weight: ${month.totalWeight.toLocaleString()} KG</p>
          <p>Total Sales: Rs. ${month.totalSales.toLocaleString("en-PK", { maximumFractionDigits: 2 })}</p>
          <p>Total Profit: Rs. ${month.totalProfit.toLocaleString("en-PK", { maximumFractionDigits: 2 })}</p>
        </div>
        <div class="footer">
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>© Store Management System</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "", "width=900,height=600");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const liveWeight = Number(form.weight) || 0;
  const liveRate = Number(form.rate) || 0;
  const liveTransport = Number(form.transportation) || 0;
  const liveSellingPrice = Number(form.sellingPrice) || 0;
  const liveQuantity = Number(form.quantity) || 0;

  const liveCostPerKg = liveWeight > 0 ? (liveRate + liveTransport) / liveWeight : 0;
  const liveMarginPerKg = liveSellingPrice - liveCostPerKg;
  const liveMarginPercent = liveCostPerKg > 0 ? (liveMarginPerKg / liveCostPerKg) * 100 : 0;
  const liveTotalProfit = liveMarginPerKg * liveWeight * liveQuantity;

  const summary = useMemo(() => {
    let totalWeight = 0;
    let totalSales = 0;
    let totalCost = 0;
    let totalProfit = 0;

    items.forEach((item) => {
      totalWeight += item.weight * item.quantity;
      totalSales += item.sellingPrice * item.weight * item.quantity;
      totalCost += (item.rate + item.transportation) * item.quantity;
      totalProfit += item.sellingPrice * item.weight * item.quantity - 
                     (item.rate + item.transportation) * item.quantity;
    });

    return { totalWeight, totalSales, totalCost, totalProfit };
  }, [items]);

  if (currentMonth === 0) {
    return <LoadingScreen label="Grocery loading" />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      
       
       
     

      <Card
        sx={{
          mb: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>GROCERY PERIOD</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack
                  direction="row"
                  sx={{
                    mt: 1,
                    width: { xs: "100%", sm: "fit-content" },
                    minWidth: { sm: 330 },
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    overflow: "hidden",
                  }}
                >
                  <IconButton
                    size="small"
                    aria-label="Previous month"
                    onClick={() => moveMonth(-1)}
                    disableRipple
                    disableFocusRipple
                    sx={{
                      borderRadius: 0,
                      px: 1.5,
                      transition: "color 160ms ease",
                      "&:hover": {
                        bgcolor: "transparent",
                        color: "primary.main",
                      },
                      "&:focus-visible": {
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    <ArrowBackIosNew fontSize="small" />
                  </IconButton>
                  <Button
                    variant="text"
                    onClick={(event) => setCalendarAnchor(event.currentTarget)}
                    startIcon={<CalendarMonth fontSize="small" />}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      px: 1.5,
                      color: "text.primary",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rangeStart.format("D MMM YYYY")} - {rangeEnd.format("D MMM YYYY")}
                  </Button>
                  <IconButton
                    size="small"
                    aria-label="Next month"
                    onClick={() => moveMonth(1)}
                    disabled={!canGoNext}
                    disableRipple
                    disableFocusRipple
                    sx={{
                      borderRadius: 0,
                      px: 1.5,
                      transition: "color 160ms ease",
                      "&:hover": {
                        bgcolor: "transparent",
                        color: "primary.main",
                      },
                      "&.Mui-disabled:hover": {
                        bgcolor: "transparent",
                        color: "action.disabled",
                      },
                      "&:focus-visible": {
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    <ArrowForwardIos fontSize="small" />
                  </IconButton>
                </Stack>
                <Popover
                  open={Boolean(calendarAnchor)}
                  anchorEl={calendarAnchor}
                  onClose={() => setCalendarAnchor(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                  <DateCalendar
                    value={selectedDate}
                    onChange={(value) => {
                      handleMonthChange(value);
                      setCalendarAnchor(null);
                    }}
                    maxDate={dayjs()}
                    disableFuture
                  />
                </Popover>
              </LocalizationProvider>
              <Typography variant="body2" color="text.secondary">Status: {isClosed ? <Chip label="CLOSED" size="small" color="warning" /> : <Chip label="OPEN" size="small" color="success" />}</Typography>
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{
                width: { xs: "100%", sm: "auto" },
                alignItems: { xs: "stretch", sm: "center" },
              }}
            >
              {!isClosed && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCloseMonth}
                  disabled={items.length === 0}
                  sx={{ minWidth: { sm: 130 } }}
                >
                  Close Month
                </Button>
              )}
              {isClosed && <Chip icon={<Lock />} label="This month is closed" color="warning" />}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openAddDialog}
                disabled={isClosed}
                sx={{ minWidth: { sm: 130 } }}
              >
                Add Item
              </Button>
            </Stack>
          </Stack>

          <TextField fullWidth placeholder="Search by item name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} slotProps={{ input: { startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />, endAdornment: searchQuery && <IconButton size="small" onClick={() => setSearchQuery("")}><Close fontSize="small" /></IconButton>, } }} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
                    

      {currentMonthData && <Grid container spacing={2} sx={{ mb: 3, alignItems: "stretch" }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3 }}><CardContent sx={{ minHeight: 122 }}><Typography variant="body2" color="text.secondary">Total Items</Typography><Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{items.length}</Typography></CardContent></Card></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3 }}><CardContent sx={{ minHeight: 122 }}><Typography variant="body2" color="text.secondary">Total Weight</Typography><Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{summary.totalWeight.toLocaleString()} KG</Typography></CardContent></Card></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3 }}><CardContent sx={{ minHeight: 122 }}><Typography variant="body2" color="text.secondary">Total Sales</Typography><Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{formatPrice(summary.totalSales)}</Typography></CardContent></Card></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: summary.totalProfit >= 0 ? "success.main" : "error.main", borderRadius: 3, bgcolor: summary.totalProfit >= 0 ? "success.50" : "error.50" }}><CardContent sx={{ minHeight: 122 }}><Typography variant="body2" color={summary.totalProfit >= 0 ? "success.dark" : "error.dark"}>Total Profit</Typography><Typography variant="h5" sx={{ mt: 1, fontWeight: 700, color: summary.totalProfit >= 0 ? "success.main" : "error.main" }}>{formatPrice(summary.totalProfit)}</Typography></CardContent></Card></Grid>
      </Grid>}

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden", mb: 4 }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Grocery Items</Typography>
              <Typography variant="body2" color="text.secondary">Inventory and profit calculation</Typography>
            </Box>
            <Chip label={`${items.length} Items`} color="primary" variant="outlined" />
          </Stack>
        </Box>
        <Divider />
        {items.length === 0 ? <Box sx={{ py: 10, textAlign: "center" }}><LocalGroceryStore sx={{ fontSize: 55, color: "text.disabled" }} /><Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>No grocery items</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Add your first grocery item</Typography><Button variant="contained" startIcon={<Add />} onClick={openAddDialog} disabled={isClosed}>Add Item</Button></Box> : <TableContainer sx={{ maxHeight: 600, overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 1500 }}>
            <TableHead>
              <TableRow>
                <TableCell><b>S.No</b></TableCell>
                <TableCell><b>Item Name</b></TableCell>
                <TableCell><b>Date</b></TableCell>
                <TableCell align="right"><b>Weight KG</b></TableCell>
                <TableCell align="right"><b>Qty</b></TableCell>
                <TableCell align="right"><b>Rate</b></TableCell>
                <TableCell align="right"><b>Transport</b></TableCell>
                <TableCell align="right"><b>Cost/KG</b></TableCell>
                <TableCell align="right"><b>Selling/KG</b></TableCell>
                <TableCell align="right"><b>Margin/KG</b></TableCell>
                <TableCell align="right"><b>Margin %</b></TableCell>
                <TableCell align="right"><b>Total</b></TableCell>
                <TableCell align="right"><b>Total Profit</b></TableCell>
                <TableCell align="center"><b>Action</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => {
                const costPerKg = getCostPerKg(item);
                const marginPerKg = getMarginPerKg(item);
                const marginPercent = getMarginPercent(item);
                const totalSales = getTotalSales(item);
                const totalProfit = getTotalProfit(item);
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell><Typography sx={{ fontWeight: 600 }}>{item.itemName}</Typography></TableCell>
                    <TableCell>{formatEntryDate(item.entryDate)}</TableCell>
                    <TableCell align="right">{item.weight}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{formatPrice(item.rate)}</TableCell>
                    <TableCell align="right">{formatPrice(item.transportation)}</TableCell>
                    <TableCell align="right">{formatPrice(costPerKg)}</TableCell>
                    <TableCell align="right">{formatPrice(item.sellingPrice)}</TableCell>
                    <TableCell align="right" sx={{ color: marginPerKg >= 0 ? "success.main" : "error.main", fontWeight: 600 }}>{formatPrice(marginPerKg)}</TableCell>
                    <TableCell align="right">{marginPercent.toFixed(2)}%</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{formatPrice(totalSales)}</TableCell>
                    <TableCell align="right" sx={{ color: totalProfit >= 0 ? "success.main" : "error.main", fontWeight: 700 }}>{formatPrice(totalProfit)}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => openEditDialog(item)} disabled={isClosed}><EditOutlined fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => deleteItem(item.id)} disabled={isClosed}><DeleteOutlined fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell colSpan={11} align="right"><Typography sx={{ fontWeight: 700 }}>GRAND TOTAL</Typography></TableCell>
                <TableCell align="right"><Typography sx={{ fontWeight: 700 }}>{formatPrice(summary.totalSales)}</Typography></TableCell>
                <TableCell align="right"><Typography sx={{ fontWeight: 700, color: summary.totalProfit >= 0 ? "success.main" : "error.main" }}>{formatPrice(summary.totalProfit)}</Typography></TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>}
      </Paper>

      {history.length > 0 && <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>PREVIOUS MONTHS / HISTORY</Typography>
        <Stack spacing={2}>
          {history.map((month) => (
            <Card key={`${month.month}-${month.year}`} sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2 }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>${MONTH_NAMES[month.month - 1]} ${month.year}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label="CLOSED" color="warning" size="small" icon={<Lock sx={{ fontSize: 16 }} />} />
                      {month.closedAt && <Typography variant="caption" color="text.secondary">Closed: {new Date(month.closedAt).toLocaleDateString()}</Typography>}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>${month.totalItems} items | {formatPrice(month.totalSales)} total sales</Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button variant="outlined" startIcon={<Visibility />} size="small" onClick={() => { setViewingMonth(month); setOpenViewModal(true); }}>View</Button>
                    <Button variant="outlined" startIcon={<Print />} size="small" onClick={() => handlePrintMonth(month)}>Print</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>}

      {history.length === 0 && <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="body1" color="text.secondary">No Previous Grocery History</Typography>
        <Typography variant="body2" color="text.secondary">Closed monthly records will appear here.</Typography>
      </Box>}

      <Dialog open={openAddModal} onClose={closeAddModal} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingId !== null ? "Edit Grocery Item" : "Add Grocery Item"}</Typography>
          <Typography variant="body2" color="text.secondary">Enter item details below</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={12}><TextField fullWidth label="Item Name" value={form.itemName} onChange={(e) => handleChange("itemName", e.target.value)} /></Grid>
            <Grid size={12}><TextField fullWidth label="Entry Date" type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Weight (KG)" type="number" value={form.weight} onChange={(e) => handleChange("weight", e.target.value)} slotProps={{ htmlInput: { min: 0 } }} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Quantity" type="number" value={form.quantity} onChange={(e) => handleChange("quantity", e.target.value)} slotProps={{ htmlInput: { min: 0 } }} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Rate" type="number" value={form.rate} onChange={(e) => handleChange("rate", e.target.value)} slotProps={{ htmlInput: { min: 0 } }} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Transportation" type="number" value={form.transportation} onChange={(e) => handleChange("transportation", e.target.value)} slotProps={{ htmlInput: { min: 0 } }} /></Grid>
            <Grid size={12}><TextField fullWidth label="Selling Price per KG" type="number" value={form.sellingPrice} onChange={(e) => handleChange("sellingPrice", e.target.value)} slotProps={{ htmlInput: { min: 0 } }} /></Grid>
            <Grid size={12}><Divider sx={{ my: 1 }} /><Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Automatic Calculation</Typography></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}><CardContent><Typography variant="caption" color="text.secondary">Cost / KG</Typography><Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>{formatPrice(liveCostPerKg)}</Typography></CardContent></Card></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><Card elevation={0} sx={{ border: "1px solid", borderColor: liveMarginPerKg >= 0 ? "success.main" : "error.main", bgcolor: liveMarginPerKg >= 0 ? "success.50" : "error.50" }}><CardContent><Typography variant="caption" color="text.secondary">Margin / KG</Typography><Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, color: liveMarginPerKg >= 0 ? "success.main" : "error.main" }}>{formatPrice(liveMarginPerKg)}</Typography></CardContent></Card></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><Card elevation={0} sx={{ border: "1px solid", borderColor: liveTotalProfit >= 0 ? "success.main" : "error.main", bgcolor: liveTotalProfit >= 0 ? "success.50" : "error.50" }}><CardContent><Typography variant="caption" color="text.secondary">Total Profit</Typography><Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, color: liveTotalProfit >= 0 ? "success.main" : "error.main" }}>{formatPrice(liveTotalProfit)}</Typography></CardContent></Card></Grid>
            <Grid size={12}><Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>Margin: <b>{liveMarginPercent.toFixed(2)}%</b></Typography></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeAddModal} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={saveItem} disabled={createMutation.isPending || updateMutation.isPending}>{editingId !== null ? "Update Item" : "Add Item"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openViewModal} onClose={closeViewModal} fullWidth maxWidth="lg">
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{viewingMonth ? `${MONTH_NAMES[viewingMonth.month - 1]} ${viewingMonth.year} - Grocery Record` : ""}</Typography>
          <Typography variant="body2" color="text.secondary">Historical record - Read only</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {viewingMonth && <>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Status: <Chip label="CLOSED" color="warning" size="small" /></Typography>
                {viewingMonth.closedAt && <Typography variant="body2" color="text.secondary">Closed: {new Date(viewingMonth.closedAt).toLocaleDateString()}</Typography>}
              </Box>
            </Stack>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><b>S.No</b></TableCell>
                    <TableCell><b>Item Name</b></TableCell>
                    <TableCell align="right"><b>Weight</b></TableCell>
                    <TableCell align="right"><b>Qty</b></TableCell>
                    <TableCell align="right"><b>Rate</b></TableCell>
                    <TableCell align="right"><b>Transport</b></TableCell>
                    <TableCell align="right"><b>Total Sales</b></TableCell>
                    <TableCell align="right"><b>Total Profit</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewingMonth.items.map((item, idx) => {
                    const totalSales = item.sellingPrice * item.weight * item.quantity;
                    const totalCost = (item.rate + item.transportation) * item.quantity;
                    const totalProfit = totalSales - totalCost;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell align="right">{item.weight} KG</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatPrice(item.rate)}</TableCell>
                        <TableCell align="right">{formatPrice(item.transportation)}</TableCell>
                        <TableCell align="right">{formatPrice(totalSales)}</TableCell>
                        <TableCell align="right">{formatPrice(totalProfit)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack spacing={1} sx={{ mt: 3 }}>
              <Typography variant="body2"><b>Total Items:</b> {viewingMonth.totalItems}</Typography>
              <Typography variant="body2"><b>Total Weight:</b> {viewingMonth.totalWeight.toLocaleString()} KG</Typography>
              <Typography variant="body2"><b>Total Sales:</b> {formatPrice(viewingMonth.totalSales)}</Typography>
              <Typography variant="body2"><b>Total Profit:</b> {formatPrice(viewingMonth.totalProfit)}</Typography>
            </Stack>
          </>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeViewModal}>Close</Button>
          {viewingMonth && <Button variant="contained" startIcon={<Print />} onClick={() => { if (viewingMonth) handlePrintMonth(viewingMonth); closeViewModal(); }}>Print</Button>}
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

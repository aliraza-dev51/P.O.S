"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Add,
  ArrowBackIosNew,
  ArrowForwardIos,
  CalendarMonth,
  CheckCircle,
  Close,
  DeleteOutlined,
  EditOutlined,
  Lock,
  PointOfSale,
  Refresh,
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
  MenuItem,
  Paper,
  Select,
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

/* =========================================================
   TYPES
========================================================= */

type PaymentMethod = "Cash" | "Online";

type OnlineAccount = "EasyPaisa" | "Bank Islami";

type Sale = {
  id: number;
  salesMonthId: number;
  date: string;
  openingAmount: number;
  expense: number;
  saleAmount: number;
  paymentMethod: PaymentMethod;
  onlineAccount: OnlineAccount | "";
};

type SalesMonth = {
  id: number;
  month: number;
  year: number;
  openingBalance: number;
  closingBalance: number | null;
  isClosed: boolean;
  closedAt: string | null;
};

type ApiResponse = {
  sales?: Sale[];
  month?: SalesMonth;
  months?: SalesMonth[];
  vendorExpense?: number;
  error?: string;
};

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = {
  date: "",
  openingAmount: "",
  saleAmount: "",
  paymentMethod: "Cash" as PaymentMethod,
  onlineAccount: "" as OnlineAccount | "",
};

/* =========================================================
   HELPERS
========================================================= */

const getCurrentMonth = () => {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

const formatMonth = (month: number, year: number) => {
  return new Date(year, month - 1, 1).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );
};

const formatDate = (date: string) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   PAGE
========================================================= */

export default function SellPage() {
  /* =======================================================
     MONTH
  ======================================================= */

  const initialMonth = getCurrentMonth();

  const [selectedMonth, setSelectedMonth] =
    useState(initialMonth.month);

  const [selectedYear, setSelectedYear] =
    useState(initialMonth.year);

  const [currentMonth, setCurrentMonth] =
    useState<SalesMonth | null>(null);

  const [months, setMonths] =
    useState<SalesMonth[]>([]);

  /* =======================================================
     SALES
  ======================================================= */

  const [sales, setSales] =
    useState<Sale[]>([]);

  const [vendorExpense, setVendorExpense] =
    useState(0);

  /* =======================================================
     UI STATES
  ======================================================= */

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [closingMonth, setClosingMonth] =
    useState(false);

  const [error, setError] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const [closeDialogOpen, setCloseDialogOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState(emptyForm);

  /* =======================================================
     FORMAT PRICE
  ======================================================= */

  const formatPrice = (value: number) => {
    return `Rs. ${Number(value || 0).toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    })}`;
  };

  /* =======================================================
     LOAD MONTHS
  ======================================================= */

  const loadMonths = async () => {
    try {
      const response = await fetch(
        "/api/sales/months",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load sales months."
        );
      }

      const data: ApiResponse =
        await response.json();

      setMonths(data.months ?? []);
    } catch (err) {
      console.error(
        "Unable to load months:",
        err
      );
    }
  };

  /* =======================================================
     LOAD SELECTED MONTH
  ======================================================= */

  const loadSales = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/sales?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load sales."
        );
      }

      setSales(data.sales ?? []);
      setVendorExpense(
        Number(data.vendorExpense ?? 0)
      );

      if (data.month) {
        setCurrentMonth(data.month);
      } else {
        setCurrentMonth(null);
      }
    } catch (err) {
      console.error(
        "Unable to load sales:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load sales."
      );

      setSales([]);
      setCurrentMonth(null);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadMonths();
  }, []);

  useEffect(() => {
    loadSales();
  }, [selectedMonth, selectedYear]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refreshAll = async () => {
    await Promise.all([
      loadSales(),
      loadMonths(),
    ]);
  };

  /* =======================================================
     MONTH SELECT
  ======================================================= */

  const handleMonthChange = (
    value: string
  ) => {
    const [year, month] =
      value.split("-").map(Number);

    setSelectedYear(year);
    setSelectedMonth(month);
  };

  /* =======================================================
     CURRENT MONTH VALUE
  ======================================================= */

  const monthSelectValue =
    `${selectedYear}-${String(
      selectedMonth
    ).padStart(2, "0")}`;

  /* =======================================================
     MONTH NAVIGATION
  ======================================================= */

  const goPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(
        selectedYear - 1
      );
    } else {
      setSelectedMonth(
        selectedMonth - 1
      );
    }
  };

  const goNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(
        selectedYear + 1
      );
    } else {
      setSelectedMonth(
        selectedMonth + 1
      );
    }
  };

  /* =======================================================
     IS CURRENT CALENDAR MONTH
  ======================================================= */

  const calendarMonth =
    getCurrentMonth();

  const isCurrentCalendarMonth =
    selectedMonth ===
      calendarMonth.month &&
    selectedYear ===
      calendarMonth.year;

  /* =======================================================
     MONTH CLOSED
  ======================================================= */

  const isMonthClosed =
    currentMonth?.isClosed ?? false;

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (
    field: keyof typeof emptyForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     TOTALS
  ======================================================= */

  const totalSale = useMemo(() => {
    return sales.reduce(
      (total, sale) =>
        total +
        Number(sale.saleAmount || 0),
      0
    );
  }, [sales]);

  const totalExpense = useMemo(() => {
    return vendorExpense;
  }, [vendorExpense]);

  const openingBalance = useMemo(() => {
    if (currentMonth) {
      return Number(
        currentMonth.openingBalance || 0
      );
    }

    if (sales.length > 0) {
      return Number(
        sales[0].openingAmount || 0
      );
    }

    return 0;
  }, [currentMonth, sales]);

  const calculatedClosingBalance =
    openingBalance +
    totalSale -
    totalExpense;

  const displayedClosingBalance =
    currentMonth?.closingBalance !== null &&
    currentMonth?.closingBalance !== undefined
      ? Number(
          currentMonth.closingBalance
        )
      : calculatedClosingBalance;

  /* =======================================================
     GET SALE BALANCE
  ======================================================= */

  const getSaleBalance = (
    sale: Sale,
    index: number
  ) => {
    const previousSales =
      sales.slice(0, index);

    const previousSalesTotal =
      previousSales.reduce(
        (total, item) =>
          total +
          Number(item.saleAmount || 0),
        0
      );

    const previousExpense =
      previousSales.reduce(
        (total, item) =>
          total +
          Number(item.expense || 0),
        0
      );

    return (
      openingBalance +
      previousSalesTotal +
      Number(sale.saleAmount || 0) -
      previousExpense -
      Number(sale.expense || 0)
    );
  };

  /* =======================================================
     OPEN ADD MODAL
  ======================================================= */

  const openAddModal = () => {
    if (!currentMonth) {
      alert(
        "This month has not been created yet."
      );
      return;
    }

    if (isMonthClosed) {
      alert(
        "This month is closed. You cannot add new sales."
      );
      return;
    }

    setEditingId(null);

    const lastSale =
      sales.length > 0
        ? sales[sales.length - 1]
        : null;

    let nextOpening =
      openingBalance;

    if (lastSale) {
      nextOpening =
        getSaleBalance(
          lastSale,
          sales.length - 1
        );
    }

    setForm({
      date: new Date()
        .toISOString()
        .split("T")[0],

      openingAmount:
        String(nextOpening),

      saleAmount: "",

      paymentMethod: "Cash",

      onlineAccount: "",
    });

    setOpen(true);
  };

  /* =======================================================
     OPEN EDIT MODAL
  ======================================================= */

  const openEditModal = (
    sale: Sale
  ) => {
    if (isMonthClosed) {
      alert(
        "This month is closed. You cannot edit its sales."
      );
      return;
    }

    setEditingId(sale.id);

    setForm({
      date: sale.date.includes("T")
        ? sale.date.split("T")[0]
        : sale.date,

      openingAmount:
        String(sale.openingAmount),

      saleAmount:
        String(sale.saleAmount),

      paymentMethod:
        sale.paymentMethod,

      onlineAccount:
        sale.onlineAccount,
    });

    setOpen(true);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);

    setForm({
      ...emptyForm,
      date: new Date()
        .toISOString()
        .split("T")[0],
    });
  };

  /* =======================================================
     SAVE SALE
  ======================================================= */

  const saveSale = async () => {
    if (isMonthClosed) {
      alert(
        "This month is already closed."
      );
      return;
    }

    const date = form.date;

    const openingAmount =
      Number(form.openingAmount);

    const saleAmount =
      Number(form.saleAmount);

    if (!date) {
      alert("Please select date.");
      return;
    }

    if (
      !Number.isFinite(
        openingAmount
      ) ||
      openingAmount < 0
    ) {
      alert(
        "Please enter a valid opening amount."
      );
      return;
    }

    if (
      !Number.isFinite(
        saleAmount
      ) ||
      saleAmount <= 0
    ) {
      alert(
        "Please enter a valid sale amount."
      );
      return;
    }

    if (
      form.paymentMethod ===
        "Online" &&
      !form.onlineAccount
    ) {
      alert(
        "Please select EasyPaisa or Bank Islami."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        date,
        month: selectedMonth,
        year: selectedYear,

        openingAmount,

        saleAmount,

        paymentMethod:
          form.paymentMethod,

        onlineAccount:
          form.paymentMethod ===
          "Online"
            ? form.onlineAccount
            : null,
      };

      const url =
        editingId === null
          ? "/api/sales"
          : `/api/sales/${editingId}`;

      const method =
        editingId === null
          ? "POST"
          : "PUT";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save sale."
        );
      }

      await refreshAll();

      closeModal();
    } catch (err) {
      console.error(
        "Unable to save sale:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to save sale."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE SALE
  ======================================================= */

  const deleteSale = async (
    id: number
  ) => {
    if (isMonthClosed) {
      alert(
        "This month is closed. You cannot delete sales."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this sale?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/sales/${id}`,
        {
          method: "DELETE",
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete sale."
        );
      }

      await refreshAll();
    } catch (err) {
      console.error(
        "Unable to delete sale:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to delete sale."
      );
    }
  };

  /* =======================================================
     CLOSE MONTH
  ======================================================= */

  const closeCurrentMonth = async () => {
    if (!currentMonth) {
      return;
    }

    if (currentMonth.isClosed) {
      return;
    }

    setClosingMonth(true);

    try {
      const response = await fetch(
        `/api/sales/months/${currentMonth.id}/close`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to close month."
        );
      }

      setCloseDialogOpen(false);

      await refreshAll();
    } catch (err) {
      console.error(
        "Unable to close month:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to close month."
      );
    } finally {
      setClosingMonth(false);
    }
  };

  /* =======================================================
     PREVIOUS MONTHS
  ======================================================= */

  const sortedMonths = useMemo(() => {
    return [...months].sort(
      (a, b) => {
        const aValue =
          a.year * 100 + a.month;

        const bValue =
          b.year * 100 + b.month;

        return bValue - aValue;
      }
    );
  }, [months]);

  /* =======================================================
     LIVE FORM PREVIEW
  ======================================================= */

  const liveOpening =
    Number(form.openingAmount) || 0;

  const liveSale =
    Number(form.saleAmount) || 0;

  const liveBalance =
    liveOpening +
    liveSale -
    vendorExpense;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 4,
        },
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        sx={{
          justifyContent:
            "space-between",

          alignItems: {
            xs: "flex-start",
            md: "center",
          },

          gap: 2,

          mb: 4,
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
            }}
          >
            <PointOfSale color="primary" />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              Sales
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage monthly sales,
            expenses and closing balances
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          sx={{
            width: {
              xs: "100%",
              md: "auto",
            },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refreshAll}
            disabled={loading}
          >
            Refresh
          </Button>

          {!isMonthClosed && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Lock />}
              onClick={() =>
                setCloseDialogOpen(
                  true
                )
              }
              disabled={
                !currentMonth ||
                loading
              }
            >
              Close Month
            </Button>
          )}

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openAddModal}
            disabled={
              !currentMonth ||
              isMonthClosed
            }
          >
            Add Sale
          </Button>
        </Stack>
      </Stack>

      {/* =================================================
          MONTH SELECTOR
      ================================================= */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          border: "1px solid",
          borderColor:
            "divider",
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          sx={{
            justifyContent:
              "space-between",
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems:
                "center",
            }}
          >
            <IconButton
              onClick={
                goPreviousMonth
              }
              size="small"
            >
              <ArrowBackIosNew fontSize="small" />
            </IconButton>

            <CalendarMonth
              color="primary"
            />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              {formatMonth(
                selectedMonth,
                selectedYear
              )}
            </Typography>

            <IconButton
              onClick={
                goNextMonth
              }
              size="small"
            >
              <ArrowForwardIos fontSize="small" />
            </IconButton>

            {isCurrentCalendarMonth && (
              <Chip
                size="small"
                color="primary"
                label="Current"
              />
            )}

            {isMonthClosed && (
              <Chip
                size="small"
                color="default"
                icon={<Lock />}
                label="Closed"
              />
            )}
          </Stack>

          <Select
            size="small"
            value={
              monthSelectValue
            }
            onChange={(event) =>
              handleMonthChange(
                event.target.value
              )
            }
            sx={{
              minWidth: 220,
            }}
          >
            {sortedMonths.length >
            0 ? (
              sortedMonths.map(
                (month) => (
                  <MenuItem
                    key={month.id}
                    value={`${month.year}-${String(
                      month.month
                    ).padStart(2, "0")}`}
                  >
                    {formatMonth(
                      month.month,
                      month.year
                    )}
                    {month.isClosed
                      ? " — Closed"
                      : " — Open"}
                  </MenuItem>
                )
              )
            ) : (
              <MenuItem
                value={
                  monthSelectValue
                }
              >
                {formatMonth(
                  selectedMonth,
                  selectedYear
                )}
              </MenuItem>
            )}
          </Select>
        </Stack>
      </Paper>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
          action={
            <IconButton
              size="small"
              onClick={() =>
                setError("")
              }
            >
              <Close />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* =================================================
          CLOSED ALERT
      ================================================= */}

      {isMonthClosed && (
        <Alert
          severity="success"
          icon={<Lock />}
          sx={{
            mb: 3,
          }}
        >
          {formatMonth(
            selectedMonth,
            selectedYear
          )}{" "}
          is closed. This month's
          records are read-only.
        </Alert>
      )}

      {/* =================================================
          SUMMARY
      ================================================= */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        {/* OPENING */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor:
                "divider",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Opening Balance
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {formatPrice(
                  openingBalance
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* SALES */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor:
                "divider",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total Sales
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {formatPrice(
                  totalSale
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* EXPENSE */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor:
                "divider",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Vendor Expense
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {formatPrice(
                  totalExpense
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CLOSING */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor:
                displayedClosingBalance >=
                0
                  ? "success.main"
                  : "error.main",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Closing Balance
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                  color:
                    displayedClosingBalance >=
                    0
                      ? "success.main"
                      : "error.main",
                }}
              >
                {formatPrice(
                  displayedClosingBalance
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =================================================
          MONTH INFO
      ================================================= */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          border: "1px solid",
          borderColor:
            "divider",
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          sx={{
            justifyContent:
              "space-between",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
              }}
            >
              {formatMonth(
                selectedMonth,
                selectedYear
              )}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {isMonthClosed
                ? "This month is closed and saved permanently."
                : "Current month is open for sales."}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
          >
            <Chip
              label={
                isMonthClosed
                  ? "CLOSED"
                  : "OPEN"
              }
              color={
                isMonthClosed
                  ? "default"
                  : "success"
              }
              icon={
                isMonthClosed ? (
                  <Lock />
                ) : (
                  <CheckCircle />
                )
              }
            />

            <Chip
              label={`${sales.length} Records`}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* =================================================
          SALES TABLE
      ================================================= */}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor:
            "divider",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 3,
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            sx={{
              justifyContent:
                "space-between",
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              gap: 1,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                Daily Sales
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Sales records for{" "}
                {formatMonth(
                  selectedMonth,
                  selectedYear
                )}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* LOADING */}

        {loading ? (
          <Box
            sx={{
              py: 10,
              textAlign: "center",
            }}
          >
            <Typography
              color="text.secondary"
            >
              Loading sales...
            </Typography>
          </Box>
        ) : sales.length === 0 ? (
          /* EMPTY */
          <Box
            sx={{
              py: 10,
              textAlign: "center",
            }}
          >
            <PointOfSale
              sx={{
                fontSize: 55,
                color:
                  "text.disabled",
              }}
            />

            <Typography
              variant="h6"
              sx={{
                mt: 1,
                fontWeight: 600,
              }}
            >
              No sales records
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              No sales have been
              added for this month.
            </Typography>

            {!isMonthClosed && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={
                  openAddModal
                }
              >
                Add Sale
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer
            sx={{
              maxHeight: 600,
              overflowX: "auto",
            }}
          >
            <Table
              stickyHeader
              sx={{
                minWidth: 1100,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>S.No</b>
                  </TableCell>

                  <TableCell>
                    <b>Date</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Opening</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Expense</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Sale</b>
                  </TableCell>

                  <TableCell>
                    <b>Payment</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Balance</b>
                  </TableCell>

                  <TableCell align="center">
                    <b>Action</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sales.map(
                  (sale, index) => {
                    const balance =
                      getSaleBalance(
                        sale,
                        index
                      );

                    return (
                      <TableRow
                        key={sale.id}
                        hover
                      >
                        <TableCell>
                          {index + 1}
                        </TableCell>

                        <TableCell>
                          {formatDate(
                            sale.date
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatPrice(
                            sale.openingAmount
                          )}
                        </TableCell>

                        <TableCell
                          align="right"
                        >
                          {formatPrice(
                            sale.expense
                          )}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {formatPrice(
                            sale.saleAmount
                          )}
                        </TableCell>

                        <TableCell>
                          {sale.paymentMethod ===
                          "Cash" ? (
                            <Chip
                              size="small"
                              label="Cash"
                            />
                          ) : (
                            <Chip
                              size="small"
                              color="primary"
                              label={
                                sale.onlineAccount ||
                                "Online"
                              }
                            />
                          )}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            color:
                              balance >=
                              0
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          {formatPrice(
                            balance
                          )}
                        </TableCell>

                        <TableCell align="center">
                          {!isMonthClosed && (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  openEditModal(
                                    sale
                                  )
                                }
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>

                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  deleteSale(
                                    sale.id
                                  )
                                }
                              >
                                <DeleteOutlined fontSize="small" />
                              </IconButton>
                            </>
                          )}

                          {isMonthClosed && (
                            <Chip
                              size="small"
                              icon={
                                <Lock />
                              }
                              label="Locked"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}

                {/* GRAND TOTAL */}

                <TableRow>
                  <TableCell
                    colSpan={2}
                    align="right"
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      MONTH TOTAL
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {formatPrice(
                        openingBalance
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {formatPrice(
                        totalExpense
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {formatPrice(
                        totalSale
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell />

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color:
                          displayedClosingBalance >=
                          0
                            ? "success.main"
                            : "error.main",
                      }}
                    >
                      {formatPrice(
                        displayedClosingBalance
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* =================================================
          MONTH HISTORY
      ================================================= */}

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          border: "1px solid",
          borderColor:
            "divider",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Month History
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Previous monthly sales and
            closing balances
          </Typography>
        </Box>

        <Divider />

        {sortedMonths.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography
              color="text.secondary"
            >
              No month history available.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Month</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Opening</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Closing</b>
                  </TableCell>

                  <TableCell>
                    <b>Status</b>
                  </TableCell>

                  <TableCell align="center">
                    <b>Action</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedMonths.map(
                  (month) => (
                    <TableRow
                      key={month.id}
                      hover
                    >
                      <TableCell
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {formatMonth(
                          month.month,
                          month.year
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {formatPrice(
                          month.openingBalance
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {formatPrice(
                          Number(
                            month.closingBalance ??
                              0
                          )
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          icon={
                            month.isClosed ? (
                              <Lock />
                            ) : (
                              <CheckCircle />
                            )
                          }
                          label={
                            month.isClosed
                              ? "Closed"
                              : "Open"
                          }
                          color={
                            month.isClosed
                              ? "default"
                              : "success"
                          }
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            <Visibility />
                          }
                          onClick={() => {
                            setSelectedMonth(
                              month.month
                            );

                            setSelectedYear(
                              month.year
                            );

                            window.scrollTo(
                              {
                                top: 0,
                                behavior:
                                  "smooth",
                              }
                            );
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* =================================================
          ADD / EDIT SALE DIALOG
      ================================================= */}

      <Dialog
        open={open}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack
            direction="row"
            sx={{
              justifyContent:
                "space-between",
              alignItems:
                "flex-start",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                {editingId !== null
                  ? "Edit Sale"
                  : "Add Sale"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {formatMonth(
                  selectedMonth,
                  selectedYear
                )}
              </Typography>
            </Box>

            <IconButton
              onClick={closeModal}
              size="small"
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Grid
            container
            spacing={2}
            sx={{
              pt: 1,
            }}
          >
            {/* DATE */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={
                  form.date
                }
                onChange={(event) =>
                  handleChange(
                    "date",
                    event.target.value
                  )
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>

            {/* OPENING */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Opening Amount"
                type="number"
                value={
                  form.openingAmount
                }
                onChange={(event) =>
                  handleChange(
                    "openingAmount",
                    event.target.value
                  )
                }
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                }}
                helperText="Previous balance"
              />
            </Grid>

            {/* EXPENSE */}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Vendor Expense"
                type="number"
                value={
                  vendorExpense
                }
                disabled
                helperText="Automatically calculated from Vendor Bills for this month"
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                }}
              />
            </Grid>

            {/* SALE */}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Sale Amount"
                type="number"
                value={
                  form.saleAmount
                }
                onChange={(event) =>
                  handleChange(
                    "saleAmount",
                    event.target.value
                  )
                }
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                }}
              />
            </Grid>

            {/* PAYMENT */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                select
                label="Payment Method"
                value={
                  form.paymentMethod
                }
                onChange={(event) =>
                  handleChange(
                    "paymentMethod",
                    event.target.value
                  )
                }
              >
                <MenuItem value="Cash">
                  Cash
                </MenuItem>

                <MenuItem value="Online">
                  Online
                </MenuItem>
              </TextField>
            </Grid>

            {/* ONLINE */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                select
                label="Online Account"
                value={
                  form.onlineAccount
                }
                disabled={
                  form.paymentMethod !==
                  "Online"
                }
                onChange={(event) =>
                  handleChange(
                    "onlineAccount",
                    event.target.value
                  )
                }
              >
                <MenuItem value="">
                  Select Account
                </MenuItem>

                <MenuItem value="EasyPaisa">
                  EasyPaisa
                </MenuItem>

                <MenuItem value="Bank Islami">
                  Bank Islami
                </MenuItem>
              </TextField>
            </Grid>

            {/* PREVIEW */}

            <Grid size={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor:
                    "divider",
                  borderRadius: 2,
                  bgcolor:
                    "action.hover",
                }}
              >
                <Stack
                  spacing={1}
                >
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <Typography
                      color="text.secondary"
                    >
                      Opening
                    </Typography>

                    <Typography>
                      {formatPrice(
                        liveOpening
                      )}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    sx={{
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <Typography
                      color="text.secondary"
                    >
                      Vendor Expense
                    </Typography>

                    <Typography>
                      -{" "}
                      {formatPrice(
                        vendorExpense
                      )}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    sx={{
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <Typography
                      color="text.secondary"
                    >
                      Sale
                    </Typography>

                    <Typography>
                      +{" "}
                      {formatPrice(
                        liveSale
                      )}
                    </Typography>
                  </Stack>

                  <Divider />

                  <Stack
                    direction="row"
                    sx={{
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Expected Balance
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color:
                          liveBalance >=
                          0
                            ? "success.main"
                            : "error.main",
                      }}
                    >
                      {formatPrice(
                        liveBalance
                      )}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={closeModal}
            color="inherit"
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={saveSale}
            disabled={saving}
            startIcon={
              editingId !== null ? (
                <EditOutlined />
              ) : (
                <Add />
              )
            }
          >
            {saving
              ? "Saving..."
              : editingId !== null
                ? "Update Sale"
                : "Add Sale"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================
          CLOSE MONTH DIALOG
      ================================================= */}

      <Dialog
        open={closeDialogOpen}
        onClose={() =>
          !closingMonth &&
          setCloseDialogOpen(
            false
          )
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems:
                "center",
            }}
          >
            <Lock color="warning" />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Close Month
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Typography
            sx={{
              fontWeight: 600,
              mb: 2,
            }}
          >
            Close{" "}
            {formatMonth(
              selectedMonth,
              selectedYear
            )}
            ?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
            }}
          >
            Once the month is closed,
            sales in this month will
            become read-only.
          </Typography>

          <Stack
            spacing={1.5}
          >
            <Stack
              direction="row"
              sx={{
                justifyContent:
                  "space-between",
              }}
            >
              <Typography>
                Opening Balance
              </Typography>

              <Typography
                sx={{
                  fontWeight: 600,
                }}
              >
                {formatPrice(
                  openingBalance
                )}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              sx={{
                justifyContent:
                  "space-between",
              }}
            >
              <Typography>
                Total Sales
              </Typography>

              <Typography
                sx={{
                  fontWeight: 600,
                }}
              >
                +{" "}
                {formatPrice(
                  totalSale
                )}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              sx={{
                justifyContent:
                  "space-between",
              }}
            >
              <Typography>
                Vendor Expenses
              </Typography>

              <Typography
                sx={{
                  fontWeight: 600,
                }}
              >
                -{" "}
                {formatPrice(
                  totalExpense
                )}
              </Typography>
            </Stack>

            <Divider />

            <Stack
              direction="row"
              sx={{
                justifyContent:
                  "space-between",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                Closing Balance
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color:
                    calculatedClosingBalance >=
                    0
                      ? "success.main"
                      : "error.main",
                }}
              >
                {formatPrice(
                  calculatedClosingBalance
                )}
              </Typography>
            </Stack>
          </Stack>

          <Alert
            severity="warning"
            sx={{
              mt: 3,
            }}
          >
            The next month's opening
            balance will be this month's
            closing balance.
          </Alert>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={() =>
              setCloseDialogOpen(
                false
              )
            }
            disabled={
              closingMonth
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="warning"
            startIcon={<Lock />}
            onClick={
              closeCurrentMonth
            }
            disabled={
              closingMonth
            }
          >
            {closingMonth
              ? "Closing..."
              : "Close Month"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
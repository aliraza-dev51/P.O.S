"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useCloseSalesMonth,
  useCreateSale,
  useDeleteSale,
  useSales,
  useUpdateSale,
} from "@/lib/hooks/useSales";

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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
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
} from "@mui/material";

/* =========================================================
   TYPES
========================================================= */

type OnlineAccount = "EasyPaisa" | "Bank Islami";

type Sale = {
  id: number;
  salesMonthId?: number;
  date: string;
  openingAmount: number;
  expense: number;
  saleAmount: number;
  cashAmount: number;
  onlineAmount: number;
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
  salesCount?: number;
};

type ApiResponse = {
  success?: boolean;
  error?: string;

  sales?: Sale[];

  activeMonth?: SalesMonth | null;

  /*
   * Some older versions of your API used `month`
   * instead of `activeMonth`, so this page accepts both.
   */
  month?: SalesMonth | null;

  vendorExpense?: number;

  totalSales?: number;

  currentBalance?: number;

  history?: SalesMonth[];

  months?: SalesMonth[];

  closedMonth?: SalesMonth;

  newMonth?: SalesMonth;
};

/* =========================================================
   FORM
========================================================= */

type SaleForm = {
  date: string;
  openingAmount: string;
  cashAmount: string;
  onlineAmount: string;
  onlineAccount: OnlineAccount | "";
};

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const createEmptyForm = (): SaleForm => ({
  date: getToday(),
  openingAmount: "",
  cashAmount: "",
  onlineAmount: "",
  onlineAccount: "",
});

/* =========================================================
   HELPERS
========================================================= */

const getCalendarMonth = () => {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

const formatMonth = (
  month: number,
  year: number
) => {
  return new Date(
    year,
    month - 1,
    1
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const formatDate = (value: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (value: number) => {
  return `Rs. ${Number(value || 0).toLocaleString(
    "en-PK",
    {
      maximumFractionDigits: 2,
    }
  )}`;
};

/* =========================================================
   PAGE
========================================================= */

export default function SellPage() {
  /* =======================================================
     MONTH
  ======================================================= */

  const initialMonth = getCalendarMonth();

  const [selectedMonth, setSelectedMonth] =
    useState<number>(initialMonth.month);

  const [selectedYear, setSelectedYear] =
    useState<number>(initialMonth.year);

  const salesQuery = useSales();
  const createSaleMutation = useCreateSale();
  const updateSaleMutation = useUpdateSale();
  const deleteSaleMutation = useDeleteSale();
  const closeMonthMutation = useCloseSalesMonth();

  const sales = useMemo(
    () => salesQuery.data?.sales ?? [],
    [salesQuery.data?.sales]
  );

  const history = useMemo(
    () => salesQuery.data?.history ?? [],
    [salesQuery.data?.history]
  );

  const activeMonth = useMemo(
    () => salesQuery.data?.activeMonth ?? salesQuery.data?.month ?? null,
    [salesQuery.data?.activeMonth, salesQuery.data?.month]
  );

  const vendorExpense = useMemo(
    () => Number(salesQuery.data?.vendorExpense ?? 0),
    [salesQuery.data?.vendorExpense]
  );

  /* =======================================================
     UI
  ======================================================= */

  const loading = salesQuery.isLoading;

  const [saving, setSaving] =
    useState<boolean>(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [closingMonth, setClosingMonth] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  const [openDialog, setOpenDialog] =
    useState<boolean>(false);

  const [closeDialog, setCloseDialog] =
    useState<boolean>(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<SaleForm>(
      createEmptyForm()
    );

  /* =======================================================
     IMPORTANT
     
     Existing /api/sales returns the active month.
     Therefore the page loads that endpoint directly.
  ======================================================= */

  const loadSales = useCallback(async () => {
    setError("");

    try {
      const result = await salesQuery.refetch();
      if (result.isError) {
        throw result.error;
      }
    } catch (err) {
      console.error("SellPage load error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load sales."
      );
    }
  }, [salesQuery]);

  useEffect(() => {
    if (activeMonth) {
      setSelectedMonth(activeMonth.month);
      setSelectedYear(activeMonth.year);
    }
  }, [activeMonth]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refreshPage = async () => {
    await loadSales();
  };

  /* =======================================================
     MONTH STATUS
  ======================================================= */

  const isClosed =
    activeMonth?.isClosed === true;

  const calendarMonth =
    getCalendarMonth();

  const isCurrentCalendarMonth =
    selectedMonth ===
      calendarMonth.month &&
    selectedYear ===
      calendarMonth.year;

  /* =======================================================
     TOTALS
  ======================================================= */

  const openingBalance = useMemo(() => {
    if (activeMonth) {
      return Number(
        activeMonth.openingBalance || 0
      );
    }

    if (sales.length > 0) {
      return Number(
        sales[0].openingAmount || 0
      );
    }

    return 0;
  }, [activeMonth, sales]);

  const totalSales = useMemo(() => {
    return sales.reduce(
      (
        total: number,
        sale: Sale
      ) => {
        return (
          total +
          Number(
            sale.saleAmount || 0
          )
        );
      },
      0
    );
  }, [sales]);

  const calculatedClosing =
    openingBalance +
    totalSales -
    vendorExpense;

  const closingBalance =
    activeMonth?.closingBalance !==
      null &&
    activeMonth?.closingBalance !==
      undefined
      ? Number(
          activeMonth.closingBalance
        )
      : calculatedClosing;

  /* =======================================================
     SALE BALANCE
  ======================================================= */

  const getSaleBalance = (
    index: number
  ) => {
    let balance = openingBalance;

    for (
      let i = 0;
      i <= index;
      i += 1
    ) {
      balance += Number(
        sales[i]?.saleAmount || 0
      );

      balance -= Number(
        sales[i]?.expense || 0
      );
    }

    return balance;
  };

  /* =======================================================
     MONTH NAVIGATION
  ======================================================= */

  const goPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(
        selectedYear - 1
      );
      return;
    }

    setSelectedMonth(
      selectedMonth - 1
    );
  };

  const goNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(
        selectedYear + 1
      );
      return;
    }

    setSelectedMonth(
      selectedMonth + 1
    );
  };

  /* =======================================================
     HISTORY VIEW
     
     IMPORTANT:
     Existing /api/sales GET returns the active month,
     not arbitrary historical month sales.
     
     So history rows are used for navigation/status only.
  ======================================================= */

  const viewHistoryMonth = (
    month: SalesMonth
  ) => {
    setSelectedMonth(
      month.month
    );

    setSelectedYear(
      month.year
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const updateForm = (
    field: keyof SaleForm,
    value: string
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  /* =======================================================
     OPEN ADD
  ======================================================= */

  const openAddSale = () => {
    if (isClosed) {
      alert(
        "This month is closed. You cannot add a sale."
      );
      return;
    }

    /*
     * DO NOT check `!activeMonth` here.
     *
     * Your POST /api/sales already creates the
     * missing month automatically.
     */

    let nextOpening =
      openingBalance;

    if (sales.length > 0) {
      nextOpening =
        getSaleBalance(
          sales.length - 1
        );
    }

    setEditingId(null);

    setForm({
      date: getToday(),
      openingAmount:
        String(nextOpening),
      cashAmount: "",
      onlineAmount: "",
      onlineAccount: "",
    });

    setOpenDialog(true);
  };

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const openEditSale = (
    sale: Sale
  ) => {
    if (isClosed) {
      alert(
        "This month is closed. You cannot edit sales."
      );
      return;
    }

    setEditingId(sale.id);

    setForm({
      date: sale.date
        ? sale.date.split("T")[0]
        : getToday(),

      openingAmount:
        String(
          sale.openingAmount
        ),

      cashAmount:
        String(sale.cashAmount ?? sale.saleAmount ?? 0),

      onlineAmount:
        String(sale.onlineAmount ?? 0),

      onlineAccount:
        sale.onlineAccount,
    });

    setOpenDialog(true);
  };

  /* =======================================================
     CLOSE SALE DIALOG
  ======================================================= */

  const closeSaleDialog = () => {
    if (saving) {
      return;
    }

    setOpenDialog(false);
    setEditingId(null);
    setForm(
      createEmptyForm()
    );
  };

  /* =======================================================
     SAVE SALE
  ======================================================= */

  const saveSale = async () => {
    if (isClosed) {
      alert(
        "This month is closed."
      );
      return;
    }

    const date = form.date;

    const openingAmount =
      Number(
        form.openingAmount
      );

    const cashAmount = Number(form.cashAmount) || 0;
    const onlineAmount = Number(form.onlineAmount) || 0;
    const saleAmount = cashAmount + onlineAmount;

    if (!date) {
      alert("Please select a date.");
      return;
    }

    if (!Number.isFinite(openingAmount) || openingAmount < 0) {
      alert("Please enter a valid opening amount.");
      return;
    }

    if (!Number.isFinite(cashAmount) || cashAmount < 0) {
      alert("Please enter a valid cash amount.");
      return;
    }

    if (!Number.isFinite(onlineAmount) || onlineAmount < 0) {
      alert("Please enter a valid online amount.");
      return;
    }

    if (saleAmount <= 0) {
      alert("Cash + Online amount must be greater than zero.");
      return;
    }

    if (onlineAmount > 0 && !form.onlineAccount) {
      alert("Please select EasyPaisa or Bank Islami for online payment.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        date,

        openingAmount,

        cashAmount,
        onlineAmount,
        saleAmount,
        onlineAccount:
          onlineAmount > 0 ? form.onlineAccount : null,
      };

      const url =
        editingId === null
          ? "/api/sales"
          : `/api/sales/${editingId}`;

      const method =
        editingId === null
          ? "POST"
          : "PUT";

      if (editingId === null) {
        await createSaleMutation.mutateAsync(payload);
      } else {
        await updateSaleMutation.mutateAsync({
          id: editingId,
          payload,
        });
      }

      setOpenDialog(false);
      setEditingId(null);
      setForm(
        createEmptyForm()
      );
    } catch (err) {
      console.error(
        "Save sale error:",
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
    if (isClosed) {
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

    setDeletingId(id);

    try {
      await deleteSaleMutation.mutateAsync(id);
    } catch (err) {
      console.error(
        "Delete sale error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Unable to delete sale."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     CLOSE MONTH
     
     Existing backend supports:
     POST /api/sales/months/:id/close
  ======================================================= */

  const closeCurrentMonth =
    async () => {
      if (!activeMonth) {
        alert(
          "There is no active sales month to close."
        );
        return;
      }

      if (activeMonth.isClosed) {
        return;
      }

      setClosingMonth(true);

      try {
        await closeMonthMutation.mutateAsync(activeMonth.id);
        setCloseDialog(false);
      } catch (err) {
        console.error(
          "Close month error:",
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
     LIVE FORM VALUES
  ======================================================= */

  const liveOpening =
    Number(
      form.openingAmount
    ) || 0;

  const liveCash = Number(form.cashAmount) || 0;
  const liveOnline = Number(form.onlineAmount) || 0;
  const liveSale = liveCash + liveOnline;

  const liveBalance =
    liveOpening +
    liveSale -
    vendorExpense;

  /* =======================================================
     HISTORY
  ======================================================= */

  const sortedHistory =
    useMemo(() => {
      return [
        ...history,
      ].sort(
        (
          a: SalesMonth,
          b: SalesMonth
        ) => {
          const aValue =
            a.year * 100 +
            a.month;

          const bValue =
            b.year * 100 +
            b.month;

          return (
            bValue - aValue
          );
        }
      );
    }, [history]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      sx={{
        minHeight: "100%",
        p: {
          xs: 2,
          md: 4,
        },
        bgcolor:
          "background.default",
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

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
          mb: 3,
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems:
                "center",
            }}
          >
            <PointOfSale
              color="primary"
            />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
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
            Manage daily sales,
            expenses and monthly
            balances
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
            onClick={
              refreshPage
            }
            disabled={loading}
            fullWidth={
              false
            }
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            color="warning"
            startIcon={<Lock />}
            onClick={() =>
              setCloseDialog(true)
            }
            disabled={
              loading ||
              !activeMonth ||
              isClosed
            }
          >
            Close Month
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={
              openAddSale
            }
            disabled={isClosed}
          >
            Add Sale
          </Button>
        </Stack>
      </Stack>

      {/* ===================================================
          ERROR
      =================================================== */}

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

      {/* ===================================================
          MONTH BAR
      =================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border:
            "1px solid",
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
              xs: "stretch",
              md: "center",
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
              size="small"
              onClick={
                goPreviousMonth
              }
            >
              <ArrowBackIosNew fontSize="small" />
            </IconButton>

            <CalendarMonth
              color="primary"
            />

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {formatMonth(
                  selectedMonth,
                  selectedYear
                )}
              </Typography>

              {isCurrentCalendarMonth && (
                <Typography
                  variant="caption"
                  color="primary"
                >
                  Current calendar month
                </Typography>
              )}
            </Box>

            <IconButton
              size="small"
              onClick={
                goNextMonth
              }
            >
              <ArrowForwardIos fontSize="small" />
            </IconButton>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems:
                "center",
              justifyContent:
                "flex-end",
            }}
          >
            <Chip
              size="small"
              icon={
                isClosed ? (
                  <Lock />
                ) : (
                  <CheckCircle />
                )
              }
              label={
                isClosed
                  ? "CLOSED"
                  : "OPEN"
              }
              color={
                isClosed
                  ? "default"
                  : "success"
              }
            />

            <Chip
              size="small"
              label={`${sales.length} Records`}
              variant="outlined"
              color="primary"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
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
              height: "100%",
              border:
                "1px solid",
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
                  fontWeight: 800,
                }}
              >
                {formatPrice(
                  openingBalance
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

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
              height: "100%",
              border:
                "1px solid",
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
                  fontWeight: 800,
                  color:
                    "primary.main",
                }}
              >
                {formatPrice(
                  totalSales
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

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
              height: "100%",
              border:
                "1px solid",
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
                  fontWeight: 800,
                  color:
                    "warning.main",
                }}
              >
                {formatPrice(
                  vendorExpense
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

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
              height: "100%",
              border:
                "1px solid",
              borderColor:
                closingBalance >=
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
                  fontWeight: 800,
                  color:
                    closingBalance >=
                    0
                      ? "success.main"
                      : "error.main",
                }}
              >
                {formatPrice(
                  closingBalance
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===================================================
          CLOSED MESSAGE
      =================================================== */}

      {isClosed && (
        <Alert
          severity="success"
          icon={<Lock />}
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
        >
          {formatMonth(
            selectedMonth,
            selectedYear
          )}{" "}
          is closed. Its sales are
          read-only.
        </Alert>
      )}

      {/* ===================================================
          DAILY SALES
      =================================================== */}

      <Paper
        elevation={0}
        sx={{
          border:
            "1px solid",
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
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                }}
              >
                Daily Sales
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

            {!isClosed && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={
                  openAddSale
                }
              >
                Add Sale
              </Button>
            )}
          </Stack>
        </Box>

        <Divider />

        {loading ? (
          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
            }}
          >
            <Stack
              spacing={2}
              sx={{
                alignItems:
                  "center",
              }}
            >
              <CircularProgress />

              <Typography
                color="text.secondary"
              >
                Loading sales...
              </Typography>
            </Stack>
          </Box>
        ) : sales.length ===
          0 ? (
          <Box
            sx={{
              minHeight: 320,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              p: 4,
            }}
          >
            <Stack
              spacing={1}
              sx={{
                alignItems:
                  "center",
                textAlign: "center",
              }}
            >
              <PointOfSale
                sx={{
                  fontSize: 56,
                  color:
                    "text.disabled",
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                No sales records
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                No sales have been
                added yet.
              </Typography>

              {!isClosed && (
                <Button
                  sx={{
                    mt: 2,
                  }}
                  variant="contained"
                  startIcon={<Add />}
                  onClick={
                    openAddSale
                  }
                >
                  Add First Sale
                </Button>
              )}
            </Stack>
          </Box>
        ) : (
          <TableContainer
            sx={{
              maxHeight: 620,
            }}
          >
            <Table
              stickyHeader
              sx={{
                minWidth: 1050,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>#</b>
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
                  (
                    sale,
                    index
                  ) => {
                    const balance =
                      getSaleBalance(
                        index
                      );

                    return (
                      <TableRow
                        key={
                          sale.id
                        }
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
                            Number(
                              sale.openingAmount
                            )
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatPrice(
                            Number(
                              sale.expense
                            )
                          )}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {formatPrice(
                            Number(
                              sale.saleAmount
                            )
                          )}
                        </TableCell>

                        <TableCell>
                          <Stack spacing={0.5}>
                            <Chip
                              size="small"
                              variant="outlined"
                              label={`Cash: ${formatPrice(Number(sale.cashAmount || 0))}`}
                              sx={{ width: "fit-content" }}
                            />
                            {Number(sale.onlineAmount || 0) > 0 && (
                              <Chip
                                size="small"
                                color="primary"
                                label={`${sale.onlineAccount || "Online"}: ${formatPrice(Number(sale.onlineAmount || 0))}`}
                                sx={{ width: "fit-content" }}
                              />
                            )}
                          </Stack>
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 800,
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
                          {isClosed ? (
                            <Chip
                              size="small"
                              icon={
                                <Lock />
                              }
                              label="Locked"
                            />
                          ) : (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{
                                justifyContent:
                                  "center",
                              }}
                            >
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  openEditSale(
                                    sale
                                  )
                                }
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>

                              <IconButton
                                size="small"
                                color="error"
                                disabled={
                                  deletingId ===
                                  sale.id
                                }
                                onClick={() =>
                                  void deleteSale(
                                    sale.id
                                  )
                                }
                              >
                                {deletingId ===
                                sale.id ? (
                                  <CircularProgress
                                    size={
                                      18
                                    }
                                  />
                                ) : (
                                  <DeleteOutlined fontSize="small" />
                                )}
                              </IconButton>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}

                {/* TOTAL */}

                <TableRow>
                  <TableCell
                    colSpan={2}
                    align="right"
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      MONTH TOTAL
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 800,
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
                        fontWeight: 800,
                      }}
                    >
                      {formatPrice(
                        vendorExpense
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      {formatPrice(
                        totalSales
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell />

                  <TableCell
                    align="right"
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color:
                          closingBalance >=
                          0
                            ? "success.main"
                            : "error.main",
                      }}
                    >
                      {formatPrice(
                        closingBalance
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

      {/* ===================================================
          MONTH HISTORY
      =================================================== */}

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          border:
            "1px solid",
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
              fontWeight: 800,
            }}
          >
            Month History
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Previous months and
            their closing balances
          </Typography>
        </Box>

        <Divider />

        {sortedHistory.length ===
        0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography
              color="text.secondary"
            >
              No month history
              available.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table
              sx={{
                minWidth: 700,
              }}
            >
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
                {sortedHistory.map(
                  (month) => (
                    <TableRow
                      hover
                      key={
                        month.id
                      }
                    >
                      <TableCell
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {formatMonth(
                          month.month,
                          month.year
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {formatPrice(
                          Number(
                            month.openingBalance
                          )
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
                          onClick={() =>
                            viewHistoryMonth(
                              month
                            )
                          }
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

      {/* ===================================================
          ADD / EDIT DIALOG
      =================================================== */}

      <Dialog
        open={openDialog}
        onClose={
          closeSaleDialog
        }
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
                  fontWeight: 800,
                }}
              >
                {editingId ===
                null
                  ? "Add Sale"
                  : "Edit Sale"}
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
              size="small"
              onClick={
                closeSaleDialog
              }
              disabled={saving}
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          dividers
        >
          <Grid
            container
            spacing={2}
            sx={{
              pt: 0.5,
            }}
          >
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
                  updateForm(
                    "date",
                    event.target
                      .value
                  )
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>

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
                  updateForm(
                    "openingAmount",
                    event.target
                      .value
                  )
                }
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: "0.01",
                  },
                }}
              />
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6 }}
            >
              <TextField
                fullWidth
                label="Cash Amount"
                type="number"
                value={form.cashAmount}
                onChange={(event) =>
                  updateForm("cashAmount", event.target.value)
                }
                slotProps={{
                  htmlInput: { min: 0, step: "0.01" },
                }}
              />
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6 }}
            >
              <TextField
                fullWidth
                label="Online Amount"
                type="number"
                value={form.onlineAmount}
                onChange={(event) =>
                  updateForm("onlineAmount", event.target.value)
                }
                helperText="Leave empty if there is no online sale."
                slotProps={{
                  htmlInput: { min: 0, step: "0.01" },
                }}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                select
                label="Online Account"
                value={form.onlineAccount}
                disabled={liveOnline <= 0}
                onChange={(event) =>
                  updateForm("onlineAccount", event.target.value)
                }
                helperText={
                  liveOnline > 0
                    ? "Select where the online amount was received."
                    : "Enabled automatically when Online Amount is greater than 0."
                }
              >
                <MenuItem value="">Select Account</MenuItem>
                <MenuItem value="EasyPaisa">EasyPaisa</MenuItem>
                <MenuItem value="Bank Islami">Bank Islami</MenuItem>
              </TextField>
            </Grid>

            {/* PREVIEW */}

            <Grid size={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border:
                    "1px solid",
                  borderColor:
                    "divider",
                  borderRadius: 2,
                  bgcolor:
                    "action.hover",
                }}
              >
                <Stack
                  spacing={1.25}
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

                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
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

                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
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
                      Total Sale
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      +{" "}
                      {formatPrice(
                        liveSale
                      )}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between" }}
                  >
                    <Typography color="text.secondary">Cash</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatPrice(liveCash)}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between" }}
                  >
                    <Typography color="text.secondary">Online</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatPrice(liveOnline)}
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
                        fontWeight: 700,
                      }}
                    >
                      Expected Balance
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
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
            onClick={
              closeSaleDialog
            }
            disabled={saving}
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void saveSale()
            }
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : editingId !==
                null ? (
                <EditOutlined />
              ) : (
                <Add />
              )
            }
          >
            {saving
              ? "Saving..."
              : editingId !==
                null
              ? "Update Sale"
              : "Add Sale"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===================================================
          CLOSE MONTH DIALOG
      =================================================== */}

      <Dialog
        open={closeDialog}
        onClose={() => {
          if (!closingMonth) {
            setCloseDialog(
              false
            );
          }
        }}
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
                fontWeight: 800,
              }}
            >
              Close Month
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent
          dividers
        >
          <Typography
            sx={{
              fontWeight: 700,
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
            Once closed, the sales
            records for this month
            will become read-only.
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
                  fontWeight: 700,
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
                  fontWeight: 700,
                }}
              >
                +{" "}
                {formatPrice(
                  totalSales
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
                  fontWeight: 700,
                }}
              >
                -{" "}
                {formatPrice(
                  vendorExpense
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
                  fontWeight: 800,
                }}
              >
                Closing Balance
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color:
                    calculatedClosing >=
                    0
                      ? "success.main"
                      : "error.main",
                }}
              >
                {formatPrice(
                  calculatedClosing
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
            The next month will use
            this closing balance as
            its opening balance.
          </Alert>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={() =>
              setCloseDialog(
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
            startIcon={
              closingMonth ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <Lock />
              )
            }
            onClick={() =>
              void closeCurrentMonth()
            }
            disabled={
              closingMonth ||
              !activeMonth
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
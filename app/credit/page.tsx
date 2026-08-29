"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Add,
  DeleteOutlined,
  EditOutlined,
  CreditScore,
  Person,
  Payments,
  AccountBalanceWallet,
  PrintOutlined,
  Visibility,
} from "@mui/icons-material";

import {
  useCreateCredit,
  useCredits,
  useDeleteCredit,
  useUpdateCredit,
} from "@/lib/hooks/useCredits";
import { creditKeys, dashboardKeys } from "@/lib/query-keys";

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
} from "@mui/material";

type CreditType = "DAILY" | "MONTHLY";

type CreditCustomer = {
  id: number;
  personName: string;
  creditType: CreditType;
  creditDate: string;
  month: number;
  year: number;
  isClosed: boolean;
  closedAt: string | null;
  previousBalance: number;
  currentAmount: number;
  paidAmount: number;
};

type CreditForm = {
  personName: string;
  creditType: CreditType;
  creditDate: string;
  currentAmount: string;
  paidAmount: string;
};

const emptyForm: CreditForm = {
  personName: "",
  creditType: "DAILY",
  creditDate: new Date().toISOString().split("T")[0],
  currentAmount: "",
  paidAmount: "",
};

export default function CreditPage() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<CreditType>("DAILY");

  const { data: customers = [], isLoading: loading } = useCredits(selectedType);
  const createCreditMutation = useCreateCredit(selectedType);
  const updateCreditMutation = useUpdateCredit(selectedType);
  const deleteCreditMutation = useDeleteCredit(selectedType);

  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState(false);

  const [printCustomer, setPrintCustomer] = useState<CreditCustomer | null>(null);

  const [viewCustomer, setViewCustomer] = useState<CreditCustomer | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<CreditForm>(emptyForm);

  const filteredCustomers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return customers;
    }

    return customers.filter((customer) =>
      customer.personName.toLowerCase().includes(keyword)
    );
  }, [customers, searchTerm]);

  const matchedCustomer = useMemo(() => {
    const keyword = form.personName.trim().toLowerCase();

    if (!keyword) {
      return null;
    }

    return (
      customers.find(
        (customer) =>
          customer.personName.toLowerCase() === keyword &&
          customer.creditType === form.creditType
      ) ?? null
    );
  }, [customers, form.creditType, form.personName]);

  const getMonthLabel = (month: number, year: number) =>
    new Date(year, month - 1, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  const closeCreditMonth = async (creditType: CreditType) => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    try {
      const response = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close-month", creditType, month, year }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to close month.");
      }

      alert(`${creditType === "MONTHLY" ? "Monthly" : "Daily"} credit for ${getMonthLabel(month, year)} has been closed.`);
      queryClient.invalidateQueries({ queryKey: creditKeys.list(creditType) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to close credit month.");
    }
  };

  const formatPrice = (value: number) =>
    `Rs. ${value.toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    })}`;

  /*
   * Total balance of one customer
   *
   * Previous Balance + Current Amount = Total
   *
   * Total - Paid Amount = Net Balance (can be negative for advance)
   */
  const getTotal = (customer: CreditCustomer) => {
    return (
      customer.previousBalance +
      customer.currentAmount
    );
  };

  const getBalance = (customer: CreditCustomer) => {
    // Net balance: positive = outstanding, negative = advance, zero = paid
    return getTotal(customer) - customer.paidAmount;
  };

  const getBalanceDisplay = (balance: number) => {
    if (balance > 0) return { label: "Outstanding", color: "error" as const, value: balance };
    if (balance < 0) return { label: "Advance", color: "success" as const, value: Math.abs(balance) };
    return { label: "Paid", color: "success" as const, value: 0 };
  };

  /*
   * Open Add Modal
   */
  const openAddModal = () => {
    setEditingId(null);
    setForm({
      personName: "",
      creditType: selectedType,
      creditDate: new Date().toISOString().split("T")[0],
      currentAmount: "",
      paidAmount: "",
    });
    setOpen(true);
  };

  /*
   * Open Edit Modal
   */
  const openEditModal = (
    customer: CreditCustomer
  ) => {
    setEditingId(customer.id);

    setForm({
      personName: customer.personName,
      creditType: customer.creditType || "DAILY",
      creditDate: customer.creditDate
        ? customer.creditDate.split("T")[0]
        : new Date().toISOString().split("T")[0],
      currentAmount: String(
        customer.currentAmount
      ),
      paidAmount: String(customer.paidAmount),
    });

    setOpen(true);
  };

  /*
   * Close Modal
   */
  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const closePrintDialog = () => {
    setPrintCustomer(null);
  };

  const closeViewDialog = () => {
    setViewCustomer(null);
  };

  /*
   * Input Change
   */
  const handleChange = (
    field: keyof CreditForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
   * Add / Update Credit
   */
  const saveCredit = async () => {
    const personName = form.personName.trim();
    const currentAmount = Number(form.currentAmount) || 0;
    const paidAmount = Number(form.paidAmount) || 0;

    if (!personName) { alert("Please enter person name."); return; }
    if (currentAmount < 0) { alert("Current amount cannot be negative."); return; }
    if (paidAmount < 0) { alert("Paid amount cannot be negative."); return; }

    try {
      setSaving(true);

      if (editingId !== null) {
        // Editing existing record
        await updateCreditMutation.mutateAsync({
          id: editingId,
          payload: {
            personName,
            creditType: form.creditType,
            creditDate: form.creditDate,
            currentAmount,
            paidAmount,
          },
        });
      } else {
        // New entry (whether new customer or re-entry)
        // The API will automatically calculate previousBalance
        await createCreditMutation.mutateAsync({
          personName,
          creditType: form.creditType,
          creditDate: form.creditDate,
          currentAmount,
          paidAmount,
        });
      }
      closeModal();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to save credit record.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * Delete Customer
   */
  const deleteCustomer = async (id: number) => {
    const customer = customers.find((item) => item.id === id);
    if (!customer) return;

    const confirmed = window.confirm(`Are you sure you want to delete ${customer.personName}'s khata?`);
    if (!confirmed) return;

    try {
      await deleteCreditMutation.mutateAsync(id);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to delete credit record.");
    }
  };

  /*
   * Summary - calculate only for selected credit type
   */
  const summary = useMemo(() => {
    let totalCredit = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    let totalAdvance = 0;

    customers.forEach((customer) => {
      const total = customer.previousBalance + customer.currentAmount;
      const balance = total - customer.paidAmount;

      totalCredit += total;
      totalPaid += customer.paidAmount;

      if (balance > 0) {
        totalOutstanding += balance;
      } else if (balance < 0) {
        totalAdvance += Math.abs(balance);
      }
    });

    return {
      totalCredit,
      totalPaid,
      totalOutstanding,
      totalAdvance,
    };
  }, [customers]);

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 4,
        },
      }}
    >
      {/* CREDIT TYPE SELECTOR */}

      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        {(["DAILY", "MONTHLY"] as CreditType[]).map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "contained" : "outlined"}
            onClick={() => setSelectedType(type)}
            size="small"
          >
            {type === "DAILY" ? "📅 Daily Credit" : "📆 Monthly Credit"}
          </Button>
        ))}
      </Box>

      {/* HEADER */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        sx={{
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            sm: "center",
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
            <CreditScore color="primary" />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              {selectedType === "DAILY" ? "Daily Credit" : "Monthly Credit"} / Khata
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage {selectedType.toLowerCase()} customer credit and outstanding balances
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => closeCreditMonth(selectedType)}
          >
            Close {selectedType === "DAILY" ? "Daily" : "Monthly"}
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openAddModal}
          >
            Add {selectedType === "DAILY" ? "Daily" : "Monthly"} Credit
          </Button>
        </Stack>
      </Stack>

      {/* SUMMARY CARDS */}

      <Box
        sx={{
          mb: 3,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search customer by name"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <Person sx={{ mr: 1, color: "text.secondary" }} fontSize="small" />
              ),
            },
          }}
          sx={{
            maxWidth: 420,
            bgcolor: "background.paper",
          }}
        />
      </Box>

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        {/* Customers */}

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
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                sx={{
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Customers
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mt: 1,
                      fontWeight: 700,
                    }}
                  >
                    {customers.length}
                  </Typography>
                </Box>

                <Person color="primary" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Credit */}

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
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                sx={{
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Credit
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mt: 1,
                      fontWeight: 700,
                    }}
                  >
                    {formatPrice(
                      summary.totalCredit
                    )}
                  </Typography>
                </Box>

                <CreditScore color="primary" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Paid */}

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
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                sx={{
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Paid
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mt: 1,
                      fontWeight: 700,
                      color: "success.main",
                    }}
                  >
                    {formatPrice(
                      summary.totalPaid
                    )}
                  </Typography>
                </Box>

                <Payments color="success" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Outstanding */}

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
              borderColor: "error.main",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                sx={{
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Outstanding
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mt: 1,
                      fontWeight: 700,
                      color: "error.main",
                    }}
                  >
                    {formatPrice(
                      summary.totalOutstanding
                    )}
                  </Typography>
                </Box>

                <AccountBalanceWallet color="error" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Advance */}

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
              borderColor: "success.main",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                sx={{
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Advance
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mt: 1,
                      fontWeight: 700,
                      color: "success.main",
                    }}
                  >
                    {formatPrice(
                      summary.totalAdvance
                    )}
                  </Typography>
                </Box>

                <Payments color="success" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* KHATA TABLE */}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
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
            direction="row"
            sx={{
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                Customer Khata
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Complete credit history
              </Typography>
            </Box>

            <Chip
              label={`${customers.length} Customers`}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <Typography color="text.secondary">Loading credit records...</Typography>
          </Box>
        ) : customers.length === 0 ? (
          <Box
            sx={{
              py: 10,
              textAlign: "center",
            }}
          >
            <CreditScore
              sx={{
                fontSize: 60,
                color: "text.disabled",
              }}
            />

            <Typography
              variant="h6"
              sx={{
                mt: 1,
                fontWeight: 600,
              }}
            >
              No Credit Records
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              Add your first customer credit
              record
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openAddModal}
            >
              Add Credit
            </Button>
          </Box>
        ) : (
          <TableContainer
            sx={{
              maxHeight: 600,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>S.No</b>
                  </TableCell>

                  <TableCell>
                    <b>Person Name</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Previous Balance</b>
                  </TableCell>

                  <TableCell align="center">
                    <b>Type</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Current Amount</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Total</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Paid Amount</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Balance</b>
                  </TableCell>

                  <TableCell align="center">
                    <b>Status</b>
                  </TableCell>

                  <TableCell align="center">
                    <b>Action</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredCustomers.map(
                  (customer, index) => {
                    const total =
                      getTotal(customer);

                    const balance =
                      getBalance(customer);

                    const balanceDisplay =
                      getBalanceDisplay(balance);

                    return (
                      <TableRow
                        key={customer.id}
                        hover
                      >
                        <TableCell>
                          {index + 1}
                        </TableCell>

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{
                              alignItems:
                                "center",
                            }}
                          >
                            <Person
                              fontSize="small"
                              color="primary"
                            />

                            <Typography
                              sx={{
                                fontWeight: 600,
                              }}
                            >
                              {
                                customer.personName
                              }
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="right">
                          {formatPrice(
                            customer.previousBalance
                          )}
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={customer.creditType === "MONTHLY" ? "Monthly" : "Daily"}
                            color={customer.creditType === "MONTHLY" ? "secondary" : "primary"}
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell align="right">
                          {formatPrice(
                            customer.currentAmount
                          )}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {formatPrice(total)}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              "success.main",
                            fontWeight: 600,
                          }}
                        >
                          {formatPrice(
                            customer.paidAmount
                          )}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color: balanceDisplay.color === "error" 
                              ? "error.main"
                              : "success.main",
                            fontWeight: 700,
                          }}
                        >
                          {balanceDisplay.value > 0
                            ? `+ ${formatPrice(balanceDisplay.value)}`
                            : balanceDisplay.value < 0
                            ? `- ${formatPrice(Math.abs(balanceDisplay.value))}`
                            : formatPrice(0)}
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={
                              balanceDisplay.label
                            }
                            color={
                              balanceDisplay.color
                            }
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              openEditModal(
                                customer
                              )
                            }
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="info"
                            onClick={() =>
                              setViewCustomer(customer)
                            }
                          >
                            <Visibility fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="info"
                            onClick={() =>
                              setPrintCustomer(customer)
                            }
                          >
                            <PrintOutlined fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              deleteCustomer(
                                customer.id
                              )
                            }
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}

                {/* GRAND TOTAL */}

                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="right"
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      GRAND TOTAL
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {formatPrice(
                        summary.totalCredit
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color:
                          "success.main",
                      }}
                    >
                      {formatPrice(
                        summary.totalPaid
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color:
                          summary.totalOutstanding > 0
                            ? "error.main"
                            : summary.totalAdvance > 0
                            ? "success.main"
                            : "default",
                      }}
                    >
                      {summary.totalOutstanding > 0
                        ? `+ ${formatPrice(summary.totalOutstanding)}`
                        : summary.totalAdvance > 0
                        ? `- ${formatPrice(summary.totalAdvance)}`
                        : formatPrice(0)}
                    </Typography>
                  </TableCell>

                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* VIEW DIALOG */}

      <Dialog
        open={Boolean(viewCustomer)}
        onClose={closeViewDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Credit Statement
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {viewCustomer && (
            <Box sx={{ p: 1 }}>
              <Stack spacing={1.5}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{viewCustomer.personName}</Typography>
                <Chip
                  size="small"
                  label={viewCustomer.creditType === "MONTHLY" ? "Monthly Credit" : "Daily Credit"}
                  color={viewCustomer.creditType === "MONTHLY" ? "secondary" : "primary"}
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  Period: {getMonthLabel(viewCustomer.month || new Date(viewCustomer.creditDate).getMonth() + 1, viewCustomer.year || new Date(viewCustomer.creditDate).getFullYear())}
                </Typography>

                <Divider />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography>Previous Balance</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{formatPrice(viewCustomer.previousBalance)}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography>Current Amount</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{formatPrice(viewCustomer.currentAmount)}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography>Paid Amount</Typography>
                  <Typography sx={{ fontWeight: 600, color: "success.main" }}>{formatPrice(viewCustomer.paidAmount)}</Typography>
                </Box>

                {(() => {
                  const total = viewCustomer.previousBalance + viewCustomer.currentAmount;
                  const balance = total - viewCustomer.paidAmount;
                  const display = getBalanceDisplay(balance);
                  return (
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography>{display.label}</Typography>
                      <Typography sx={{ fontWeight: 700, color: display.color === "error" ? "error.main" : "success.main" }}>
                        {display.value > 0
                          ? `+ ${formatPrice(display.value)}`
                          : display.value < 0
                          ? `- ${formatPrice(Math.abs(display.value))}`
                          : formatPrice(0)}
                      </Typography>
                    </Box>
                  );
                })()}
              </Stack>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeViewDialog} color="inherit">
            Close
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              setPrintCustomer(viewCustomer);
              closeViewDialog();
            }}
            startIcon={<PrintOutlined />}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* PRINT DIALOG */}

      <Dialog
        open={Boolean(printCustomer)}
        onClose={closePrintDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Print Khata
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {printCustomer && (
            <Box
              sx={{
                p: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  POS Khata
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Customer Credit Receipt
                </Typography>
              </Box>

              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{printCustomer.personName}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Chip
                    size="small"
                    label={printCustomer.creditType === "MONTHLY" ? "Monthly Credit" : "Daily Credit"}
                    color={printCustomer.creditType === "MONTHLY" ? "secondary" : "primary"}
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography>
                    {new Date(printCustomer.creditDate).toLocaleDateString("en-PK", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography>Previous Balance</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{formatPrice(printCustomer.previousBalance)}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography>Current Amount</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{formatPrice(printCustomer.currentAmount)}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography>Paid Amount</Typography>
                  <Typography sx={{ fontWeight: 600, color: "success.main" }}>{formatPrice(printCustomer.paidAmount)}</Typography>
                </Box>

                {(() => {
                  const total = printCustomer.previousBalance + printCustomer.currentAmount;
                  const balance = total - printCustomer.paidAmount;
                  const display = getBalanceDisplay(balance);
                  return (
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography>{display.label}</Typography>
                      <Typography sx={{ fontWeight: 700, color: display.color === "error" ? "error.main" : "success.main" }}>
                        {display.value > 0
                          ? `+ ${formatPrice(display.value)}`
                          : display.value < 0
                          ? `- ${formatPrice(Math.abs(display.value))}`
                          : formatPrice(0)}
                      </Typography>
                    </Box>
                  );
                })()}

                <Divider />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" color="text.secondary">Authorized By</Typography>
                  <Typography sx={{ fontWeight: 700 }}>POS System</Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closePrintDialog} color="inherit">
            Close
          </Button>

          <Button
            variant="contained"
            startIcon={<PrintOutlined />}
            onClick={() => {
              window.print();
            }}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD / EDIT MODAL */}

      <Dialog
        open={open}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            {editingId !== null
              ? "Edit Credit"
              : "Add Credit"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Enter customer khata details
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Grid
            container
            spacing={2}
            sx={{
              pt: 1,
            }}
          >
            {/* MODE */}
            <Grid size={12}>
              <Stack direction="row" spacing={1}>
                {(["DAILY", "MONTHLY"] as CreditType[]).map((type) => (
                  <Button
                    key={type}
                    variant={form.creditType === type ? "contained" : "outlined"}
                    size="small"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        creditType: type,
                      }))
                    }
                  >
                    {type === "DAILY" ? "Daily Credit" : "Monthly Credit"}
                  </Button>
                ))}
              </Stack>
            </Grid>

            {/* PERSON NAME */}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Person Name"
                value={form.personName}
                onChange={(e) =>
                  handleChange(
                    "personName",
                    e.target.value
                  )
                }
              />
            </Grid>

            {matchedCustomer && (
              <Grid size={12}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "warning.light",
                    color: "warning.contrastText",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Previous record found for {matchedCustomer.personName}
                  </Typography>
                  <Typography variant="caption">
                    Previous Balance: {formatPrice(matchedCustomer.previousBalance)} • Paid: {formatPrice(matchedCustomer.paidAmount)}
                  </Typography>
                </Box>
              </Grid>
            )}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Credit Date"
                type="date"
                value={form.creditDate}
                onChange={(e) =>
                  setForm((previous) => ({
                    ...previous,
                    creditDate: e.target.value,
                  }))
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>

            {/* CURRENT AMOUNT */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Current Amount"
                type="number"
                value={form.currentAmount}
                onChange={(e) =>
                  handleChange(
                    "currentAmount",
                    e.target.value
                  )
                }
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                }}
              />
            </Grid>

            {/* PAID AMOUNT */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Paid Amount"
                type="number"
                value={form.paidAmount}
                onChange={(e) =>
                  handleChange(
                    "paidAmount",
                    e.target.value
                  )
                }
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* INFO */}

          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: "action.hover",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              <b>Note:</b> Agar same person dobara
              udhaar lega to system uska existing
              khata automatically update karega.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={closeModal}
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={saveCredit}
            disabled={saving}
            startIcon={
              editingId !== null ? (
                <EditOutlined />
              ) : (
                <Add />
              )
            }
          >
            {saving ? "Saving..." : editingId !== null
              ? "Update Credit"
              : "Add Credit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
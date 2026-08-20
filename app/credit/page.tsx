"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Add,
  DeleteOutlined,
  EditOutlined,
  CreditScore,
  Person,
  Payments,
  AccountBalanceWallet,
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
} from "@mui/material";

type CreditCustomer = {
  id: number;
  personName: string;
  previousBalance: number;
  currentAmount: number;
  paidAmount: number;
};

type CreditForm = {
  personName: string;
  currentAmount: string;
  paidAmount: string;
};

const emptyForm: CreditForm = {
  personName: "",
  currentAmount: "",
  paidAmount: "",
};

export default function CreditPage() {
  const [customers, setCustomers] =
    useState<CreditCustomer[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<CreditForm>(emptyForm);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/credits", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load credit records.");
      setCustomers(data);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to load credit records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const formatPrice = (value: number) =>
    `Rs. ${value.toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    })}`;

  /*
   * Total balance of one customer
   *
   * Previous Balance + Current Amount = Total
   *
   * Total - Paid Amount = Remaining Balance
   */
  const getTotal = (customer: CreditCustomer) => {
    return (
      customer.previousBalance +
      customer.currentAmount
    );
  };

  const getBalance = (customer: CreditCustomer) => {
    return Math.max(
      getTotal(customer) - customer.paidAmount,
      0
    );
  };

  /*
   * Open Add Modal
   */
  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
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
      const url = editingId !== null ? `/api/credits/${editingId}` : "/api/credits";
      const response = await fetch(url, {
        method: editingId !== null ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personName, currentAmount, paidAmount }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save credit record.");
      await loadCustomers();
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
      const response = await fetch(`/api/credits/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete credit record.");
      setCustomers((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to delete credit record.");
    }
  };

  /*
   * Summary
   */
  const summary = useMemo(() => {
    let totalCredit = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    customers.forEach((customer) => {
      const total = customer.previousBalance + customer.currentAmount;
      totalCredit += total;
      totalPaid += customer.paidAmount;
      totalOutstanding += Math.max(total - customer.paidAmount, 0);
    });

    return {
      totalCredit,
      totalPaid,
      totalOutstanding,
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
              Credit / Khata
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage customer credit and outstanding
            balances
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openAddModal}
        >
          Add Credit
        </Button>
      </Stack>

      {/* SUMMARY CARDS */}

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
                {customers.map(
                  (customer, index) => {
                    const total =
                      getTotal(customer);

                    const balance =
                      getBalance(customer);

                    const fullyPaid =
                      balance === 0;

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
                            color: fullyPaid
                              ? "success.main"
                              : "error.main",
                            fontWeight: 700,
                          }}
                        >
                          {formatPrice(balance)}
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={
                              fullyPaid
                                ? "Paid"
                                : "Pending"
                            }
                            color={
                              fullyPaid
                                ? "success"
                                : "error"
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
                          "error.main",
                      }}
                    >
                      {formatPrice(
                        summary.totalOutstanding
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

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
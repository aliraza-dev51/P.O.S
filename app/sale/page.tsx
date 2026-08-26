"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Add,
  DeleteOutlined,
  EditOutlined,
  PointOfSale,
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
  date: string;
  openingAmount: number;
  expense: number;
  saleAmount: number;
  paymentMethod: PaymentMethod;
  onlineAccount: OnlineAccount | "";
};

type Vendor = {
  id: number;
  vendorName: string;
  billAmount: number;
  paymentStatus?: "Paid" | "Unpaid";
  date?: string;
};

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = {
  date: new Date().toISOString().split("T")[0],
  openingAmount: "",
  saleAmount: "",
  paymentMethod: "Cash" as PaymentMethod,
  onlineAccount: "" as OnlineAccount | "",
};

/* =========================================================
   PAGE
========================================================= */

export default function SellPage() {
  const [sales, setSales] = useState<Sale[]>([]);

  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState(emptyForm);

  /*
   * Vendor expense
   *
   * Vendors page se automatically calculate hoga.
   */
  const [vendorExpense, setVendorExpense] =
    useState(0);

  /* =======================================================
     FORMAT PRICE
  ======================================================= */

  const formatPrice = (value: number) => {
    return `Rs. ${value.toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    })}`;
  };

  /* =======================================================
     LOAD SALES FROM DATABASE
  ======================================================= */

  const loadSales = async () => {
    try {
      const response = await fetch("/api/sales", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load sales");
      }

      const data = await response.json();
      setSales(data.sales ?? []);
      setVendorExpense(Number(data.vendorExpense ?? 0));
    } catch (error) {
      console.error("Unable to load sales:", error);
      alert("Unable to load sales from database.");
    }
  };

  /* =======================================================
     LOAD SALES ON PAGE LOAD
  ======================================================= */

  useEffect(() => {
    loadSales();

    const handleVendorsUpdated = () => {
      loadSales();
    };

    window.addEventListener("vendorsUpdated", handleVendorsUpdated);

    return () => {
      window.removeEventListener("vendorsUpdated", handleVendorsUpdated);
    };
  }, []);

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
     GET LAST BALANCE
  ======================================================= */

  const getCurrentBalance = () => {
    if (sales.length === 0) {
      return 0;
    }

    const lastSale =
      sales[sales.length - 1];

    return (
      lastSale.openingAmount +
      lastSale.saleAmount -
      lastSale.expense
    );
  };

  /* =======================================================
     REFRESH VENDOR EXPENSE
  ======================================================= */

  const loadVendorExpense = async () => {
    try {
      const response = await fetch("/api/sales", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load vendor expense");
      }

      const data = await response.json();
      setVendorExpense(Number(data.vendorExpense ?? 0));
    } catch (error) {
      console.error("Unable to load vendor expense:", error);
    }
  };

  /* =======================================================
     OPEN ADD MODAL
  ======================================================= */

  const openAddModal = () => {
    setEditingId(null);

    const nextOpening =
      sales.length === 0
        ? ""
        : String(getCurrentBalance());

    setForm({
      ...emptyForm,
      date: new Date()
        .toISOString()
        .split("T")[0],
      openingAmount: nextOpening,
      saleAmount: "",
      paymentMethod: "Cash",
      onlineAccount: "",
    });

    /*
     * Latest vendor expense dobara load.
     */
    loadVendorExpense();

    setOpen(true);
  };

  /* =======================================================
     OPEN EDIT MODAL
  ======================================================= */

  const openEditModal = (sale: Sale) => {
    setEditingId(sale.id);

    setForm({
      date: sale.date,
      openingAmount: String(
        sale.openingAmount
      ),
      saleAmount: String(
        sale.saleAmount
      ),
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
    const date = form.date;
    const openingAmount = Number(form.openingAmount);
    const saleAmount = Number(form.saleAmount);

    if (!date) {
      alert("Please select date.");
      return;
    }

    if (!Number.isFinite(openingAmount) || openingAmount < 0) {
      alert("Please enter a valid opening amount.");
      return;
    }

    if (!Number.isFinite(saleAmount) || saleAmount <= 0) {
      alert("Please enter a valid sale amount.");
      return;
    }

    if (form.paymentMethod === "Online" && !form.onlineAccount) {
      alert("Please select EasyPaisa or Bank Islami.");
      return;
    }

    const payload = {
      date,
      openingAmount,
      saleAmount,
      paymentMethod: form.paymentMethod,
      onlineAccount:
        form.paymentMethod === "Online"
          ? form.onlineAccount
          : "",
    };

    try {
      const response = await fetch(
        editingId === null ? "/api/sales" : `/api/sales/${editingId}`,
        {
          method: editingId === null ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save sale");
      }

      await loadSales();
      closeModal();
    } catch (error) {
      console.error("Unable to save sale:", error);
      alert(error instanceof Error ? error.message : "Unable to save sale.");
    }
  };

  /* =======================================================
     DELETE SALE
  ======================================================= */

  const deleteSale = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sale?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete sale");
      }

      await loadSales();
    } catch (error) {
      console.error("Unable to delete sale:", error);
      alert(error instanceof Error ? error.message : "Unable to delete sale.");
    }
  };

  /* =======================================================
     BALANCE
  ======================================================= */

  const getBalance = (sale: Sale) => {
    return (
      sale.openingAmount +
      sale.saleAmount -
      sale.expense
    );
  };

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalSale = useMemo(() => {
    return sales.reduce(
      (total, sale) =>
        total + sale.saleAmount,
      0
    );
  }, [sales]);

  const totalExpense = useMemo(() => {
    return sales.reduce(
      (total, sale) =>
        total + sale.expense,
      0
    );
  }, [sales]);

  const totalOpening = useMemo(() => {
    return sales.reduce(
      (total, sale) =>
        total + sale.openingAmount,
      0
    );
  }, [sales]);

  const currentBalance = useMemo(() => {
    if (sales.length === 0) {
      return 0;
    }

    return getBalance(
      sales[sales.length - 1]
    );
  }, [sales]);

  /* =======================================================
     LIVE MODAL BALANCE
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
              Sale
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
            expenses and balances
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openAddModal}
        >
          Add Sale
        </Button>
      </Stack>

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
        {/* TOTAL SALES */}

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
                {formatPrice(totalSale)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CURRENT VENDOR EXPENSE */}

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
                  vendorExpense
                )}
              </Typography>

              
            </CardContent>
          </Card>
        </Grid>

        {/* TOTAL OPENING */}

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
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total Opening
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {formatPrice(
                  totalOpening
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CURRENT BALANCE */}

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
                currentBalance >= 0
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
                Current Balance
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                  color:
                    currentBalance >= 0
                      ? "success.main"
                      : "error.main",
                }}
              >
                {formatPrice(
                  currentBalance
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =================================================
          VENDOR EXPENSE INFO
      ================================================= */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          border: "1px solid",
          borderColor: "divider",
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
              xs: "flex-start",
              sm: "center",
            },
            gap: 1,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 600,
              }}
            >
              Vendor Expense
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Total bills from Vendors page
            </Typography>
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            {formatPrice(
              vendorExpense
            )}
          </Typography>
        </Stack>
      </Paper>

      {/* =================================================
          TABLE
      ================================================= */}

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
                Daily Sales
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Sales, vendor expenses and
                daily balance
              </Typography>
            </Box>

            <Chip
              label={`${sales.length} Records`}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Box>

        <Divider />

        {/* EMPTY */}

        {sales.length === 0 ? (
          <Box
            sx={{
              py: 10,
              textAlign: "center",
            }}
          >
            <PointOfSale
              sx={{
                fontSize: 55,
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
              No sales records
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              Add your first sale
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openAddModal}
            >
              Add Sale
            </Button>
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
                minWidth: 1000,
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
                      getBalance(sale);

                    return (
                      <TableRow
                        key={sale.id}
                        hover
                      >
                        {/* S.NO */}

                        <TableCell>
                          {index + 1}
                        </TableCell>

                        {/* DATE */}

                        <TableCell>
                          {sale.date}
                        </TableCell>

                        {/* OPENING */}

                        <TableCell align="right">
                          {formatPrice(
                            sale.openingAmount
                          )}
                        </TableCell>

                        {/* EXPENSE */}

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {formatPrice(
                            sale.expense
                          )}
                        </TableCell>

                        {/* SALE */}

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

                        {/* PAYMENT */}

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
                                sale.onlineAccount
                              }
                            />
                          )}
                        </TableCell>

                        {/* BALANCE */}

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            color:
                              balance >= 0
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          {formatPrice(
                            balance
                          )}
                        </TableCell>

                        {/* ACTION */}

                        <TableCell align="center">
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
                        totalOpening
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
                          currentBalance >=
                          0
                            ? "success.main"
                            : "error.main",
                      }}
                    >
                      {formatPrice(
                        currentBalance
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
          ADD / EDIT MODAL
      ================================================= */}

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
              ? "Edit Sale"
              : "Add Sale"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Enter sale details below
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
                value={form.date}
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
                helperText={
                  sales.length === 0
                    ? "Enter first opening amount"
                    : "Previous balance"
                }
              />
            </Grid>

            {/* =================================================
                AUTOMATIC EXPENSE
            ================================================= */}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Expense"
                type="number"
                value={vendorExpense}
                disabled
                helperText="Automatically calculated from Vendors bills"
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                }}
              />
            </Grid>

            {/* SALE AMOUNT */}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Sale Amount"
                type="number"
                value={form.saleAmount}
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

            {/* PAYMENT METHOD */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <Select
                fullWidth
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
              </Select>
            </Grid>

            {/* ONLINE ACCOUNT */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <Select
                fullWidth
                displayEmpty
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
                  Select Online Account
                </MenuItem>

                <MenuItem value="EasyPaisa">
                  EasyPaisa
                </MenuItem>

                <MenuItem value="Bank Islami">
                  Bank Islami
                </MenuItem>
              </Select>
            </Grid>

            {/* =================================================
                PREVIEW
            ================================================= */}

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

        {/* =================================================
            ACTIONS
        ================================================= */}

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
            onClick={saveSale}
            startIcon={
              editingId !== null ? (
                <EditOutlined />
              ) : (
                <Add />
              )
            }
          >
            {editingId !== null
              ? "Update Sale"
              : "Add Sale"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
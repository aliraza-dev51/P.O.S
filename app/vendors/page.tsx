"use client";

import { useMemo, useState } from "react";

import {
  Add,
  DeleteOutlined,
  EditOutlined,
  Storefront,
} from "@mui/icons-material";

import {
  useCreateVendor,
  useDeleteVendor,
  useUpdateVendor,
  useVendors,
} from "@/lib/hooks/useVendors";

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

type VendorStatus = "Paid" | "Unpaid";

type VendorItem = {
  id: number;
  dateTime: string;
  vendorName: string;
  billAmount: number;
  status: VendorStatus;
};

type VendorForm = {
  vendorName: string;
  billAmount: string;
  status: VendorStatus;
};

/* =========================================================
   INITIAL DATA
========================================================= */

const initialItems: VendorItem[] = [];

const emptyForm: VendorForm = {
  vendorName: "",
  billAmount: "",
  status: "Unpaid",
};

/* =========================================================
   PAGE
========================================================= */

export default function VendorsPage() {
  const { data: items = initialItems } = useVendors();
  const createVendorMutation = useCreateVendor();
  const updateVendorMutation = useUpdateVendor();
  const deleteVendorMutation = useDeleteVendor();

  const [open, setOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<VendorForm>(emptyForm);

  const [saving, setSaving] = useState(false);

  /* =======================================================
     FORMAT PRICE
  ======================================================= */

  const formatPrice = (value: number) => {
    return `Rs. ${value.toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    })}`;
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (
    field: keyof VendorForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     OPEN ADD MODAL
  ======================================================= */

  const openAddModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setOpen(true);
  };

  /* =======================================================
     OPEN EDIT MODAL
  ======================================================= */

  const openEditModal = (item: VendorItem) => {
    setEditingId(item.id);

    setForm({
      vendorName: item.vendorName,
      billAmount: String(item.billAmount),
      status: item.status,
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
    });
  };

  /* =======================================================
     SAVE / UPDATE
  ======================================================= */

  const saveItem = async () => {
    const vendorName = form.vendorName.trim();
    const billAmount = Number(form.billAmount);

    if (!vendorName || !Number.isFinite(billAmount) || billAmount <= 0) {
      alert("Please enter a valid vendor name and bill amount.");
      return;
    }

    try {
      setSaving(true);

      if (editingId !== null) {
        await updateVendorMutation.mutateAsync({
          id: editingId,
          payload: {
            vendorName,
            billAmount,
            status: form.status,
          },
        });
      } else {
        await createVendorMutation.mutateAsync({
          vendorName,
          billAmount,
          status: form.status,
        });
      }

      closeModal();
    } catch (error) {
      console.error("Unable to save vendor bill:", error);
      alert(error instanceof Error ? error.message : "Unable to save vendor bill.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteItem = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vendor bill?"
    );

    if (!confirmDelete) return;

    try {
      await deleteVendorMutation.mutateAsync(id);
    } catch (error) {
      console.error("Unable to delete vendor bill:", error);
      alert(error instanceof Error ? error.message : "Unable to delete vendor bill.");
    }
  };

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    let totalExpense = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;

    items.forEach((item) => {
      /* ---------------------------------
         TOTAL EXPENSE

         All vendor bills are expenses,
         whether Paid or Unpaid.
      --------------------------------- */

      totalExpense += item.billAmount;

      /* ---------------------------------
         PAID
      --------------------------------- */

      if (item.status === "Paid") {
        totalPaid += item.billAmount;
      }

      /* ---------------------------------
         UNPAID
      --------------------------------- */

      if (item.status === "Unpaid") {
        totalUnpaid += item.billAmount;
      }
    });

    return {
      totalExpense,
      totalPaid,
      totalUnpaid,
    };
  }, [items]);

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
            <Storefront color="primary" />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              Vendors
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage vendor bills and
            expenses
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openAddModal}
        >
          Add Vendor
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
        {/* TOTAL VENDORS */}

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
                Total Bills
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {items.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* TOTAL EXPENSE */}

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
                "error.main",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total Vendor Expense
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                  color:
                    "error.main",
                }}
              >
                {formatPrice(
                  summary.totalExpense
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* TOTAL PAID */}

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
                "success.main",
              borderRadius: 3,
            }}
          >
            <CardContent>
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
                  color:
                    "success.main",
                }}
              >
                {formatPrice(
                  summary.totalPaid
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* TOTAL UNPAID */}

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
                "warning.main",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total Unpaid
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                  color:
                    "warning.main",
                }}
              >
                {formatPrice(
                  summary.totalUnpaid
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
        {/* TABLE HEADER */}

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
              alignItems:
                "center",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                Vendor Bills
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Vendor bills and
                payment status
              </Typography>
            </Box>

            <Chip
              label={`${items.length} Bills`}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Box>

        <Divider />

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {items.length === 0 ? (
          <Box
            sx={{
              py: 10,
              textAlign: "center",
            }}
          >
            <Storefront
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
              No vendor bills
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              Add your first
              vendor bill
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={
                openAddModal
              }
            >
              Add Vendor
            </Button>
          </Box>
        ) : (
          /* =================================================
             TABLE
          ================================================= */

          <TableContainer
            sx={{
              maxHeight: 600,
              overflowX:
                "auto",
            }}
          >
            <Table
              stickyHeader
              sx={{
                minWidth: 900,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>S.No</b>
                  </TableCell>

                  <TableCell>
                    <b>Date / Time</b>
                  </TableCell>

                  <TableCell>
                    <b>Vendor Name</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Bill Amount</b>
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
                {items.map(
                  (item, index) => (
                    <TableRow
                      key={item.id}
                      hover
                    >
                      {/* S.NO */}

                      <TableCell>
                        {index + 1}
                      </TableCell>

                      {/* DATE */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {formatDateTime(
                            item.dateTime
                          )}
                        </Typography>
                      </TableCell>

                      {/* VENDOR */}

                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {
                            item.vendorName
                          }
                        </Typography>
                      </TableCell>

                      {/* BILL */}

                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {formatPrice(
                          item.billAmount
                        )}
                      </TableCell>

                      {/* STATUS */}

                      <TableCell align="center">
                        <Chip
                          label={
                            item.status
                          }
                          size="small"
                          color={
                            item.status ===
                            "Paid"
                              ? "success"
                              : "warning"
                          }
                          variant="outlined"
                        />
                      </TableCell>

                      {/* ACTION */}

                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            openEditModal(
                              item
                            )
                          }
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            deleteItem(
                              item.id
                            )
                          }
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                )}

                {/* =================================================
                    GRAND TOTAL
                ================================================= */}

                <TableRow>
                  <TableCell
                    colSpan={3}
                    align="right"
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      TOTAL EXPENSE
                    </Typography>
                  </TableCell>

                  <TableCell
                    align="right"
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color:
                          "error.main",
                      }}
                    >
                      {formatPrice(
                        summary.totalExpense
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell
                    colSpan={2}
                  />
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
              ? "Edit Vendor Bill"
              : "Add Vendor Bill"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Enter vendor bill details
          </Typography>
        </DialogTitle>

        <DialogContent
          dividers
        >
          <Grid
            container
            spacing={2}
            sx={{
              pt: 1,
            }}
          >
            {/* VENDOR NAME */}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Vendor Name"
                value={
                  form.vendorName
                }
                onChange={(event) =>
                  handleChange(
                    "vendorName",
                    event.target.value
                  )
                }
              />
            </Grid>

            {/* BILL AMOUNT */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Bill Amount"
                type="number"
                value={
                  form.billAmount
                }
                onChange={(event) =>
                  handleChange(
                    "billAmount",
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

            {/* STATUS */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                select
                label="Payment Status"
                value={
                  form.status
                }
                onChange={(event) =>
                  handleChange(
                    "status",
                    event.target.value as VendorStatus
                  )
                }
              >
                <MenuItem value="Paid">
                  Paid
                </MenuItem>

                <MenuItem value="Unpaid">
                  Unpaid
                </MenuItem>
              </TextField>
            </Grid>

            {/* INFO */}

            <Grid size={12}>
              <Card
                elevation={0}
                sx={{
                  border:
                    "1px solid",
                  borderColor:
                    "divider",
                  bgcolor:
                    "action.hover",
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Expense
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                      color:
                        "error.main",
                    }}
                  >
                    {formatPrice(
                      Number(
                        form.billAmount
                      ) || 0
                    )}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    This bill will be
                    included in total
                    expenses.
                  </Typography>
                </CardContent>
              </Card>
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
            onClick={saveItem}
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
                ? "Update Vendor"
                : "Add Vendor"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
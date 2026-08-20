"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Add,
  DeleteOutlined,
  EditOutlined,
  LocalGroceryStore,
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

type GroceryItem = {
  id: number;
  itemName: string;
  weight: number;
  quantity: number;
  rate: number;
  transportation: number;
  sellingPrice: number;
};

type GroceryForm = {
  itemName: string;
  weight: string;
  quantity: string;
  rate: string;
  transportation: string;
  sellingPrice: string;
};

const initialItems: GroceryItem[] = [];

const emptyForm: GroceryForm = {
  itemName: "",
  weight: "",
  quantity: "",
  rate: "",
  transportation: "",
  sellingPrice: "",
};

export default function GroceryPage() {
  const [items, setItems] = useState<GroceryItem[]>(initialItems);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<GroceryForm>(emptyForm);

  // --------------------------------
  // Format price
  // --------------------------------

  const formatPrice = (value: number) => {
    return `Rs. ${value.toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    })}`;
  };

  // --------------------------------
  // Form change
  // --------------------------------

  const handleChange = (
    field: keyof GroceryForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --------------------------------
  // Open Add Modal
  // --------------------------------

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  // --------------------------------
  // Open Edit Modal
  // --------------------------------

  const openEditModal = (item: GroceryItem) => {
    setEditingId(item.id);

    setForm({
      itemName: item.itemName,
      weight: String(item.weight),
      quantity: String(item.quantity),
      rate: String(item.rate),
      transportation: String(item.transportation),
      sellingPrice: String(item.sellingPrice),
    });

    setOpen(true);
  };

  // --------------------------------
  // Close Modal
  // --------------------------------

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch("/api/grocery", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load grocery items");
        const data = await response.json();
        setItems(data.map((item: any) => ({
          ...item,
          weight: Number(item.weight),
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          transportation: Number(item.transportation),
          sellingPrice: Number(item.sellingPrice),
        })));
      } catch (error) {
        console.error(error);
        alert("Failed to load grocery items.");
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  // --------------------------------
  // Save / Update Item
  // --------------------------------

  const saveItem = async () => {
    const itemName = form.itemName.trim();
    const weight = Number(form.weight);
    const quantity = Number(form.quantity);
    const rate = Number(form.rate);
    const transportation = Number(form.transportation);
    const sellingPrice = Number(form.sellingPrice);

    if (!itemName || weight <= 0 || quantity <= 0 || rate < 0 || transportation < 0 || sellingPrice <= 0) {
      alert("Please fill all fields correctly.");
      return;
    }

    try {
      const response = await fetch(
        editingId !== null ? `/api/grocery/${editingId}` : "/api/grocery",
        {
          method: editingId !== null ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemName, weight, quantity, rate, transportation, sellingPrice }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save item");

      const savedItem: GroceryItem = {
        id: data.id,
        itemName: data.itemName,
        weight: Number(data.weight),
        quantity: Number(data.quantity),
        rate: Number(data.rate),
        transportation: Number(data.transportation),
        sellingPrice: Number(data.sellingPrice),
      };

      if (editingId !== null) {
        setItems((currentItems) => currentItems.map((item) => item.id === editingId ? savedItem : item));
      } else {
        setItems((currentItems) => [savedItem, ...currentItems]);
      }

      closeModal();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to save item.");
    }
  };

  // --------------------------------
  // Delete
  // --------------------------------

  const deleteItem = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/grocery/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete item");
      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to delete item.");
    }
  };

  // --------------------------------
  // Calculations
  // --------------------------------

  /*
    Example:

    Weight = 100 KG
    Quantity = 2
    Rate = Rs. 10,000
    Transportation = Rs. 1,000

    Total cost for one quantity =
    10,000 + 1,000 = 11,000

    Cost per KG =
    11,000 / 100 = Rs. 110

    Selling price per KG =
    Rs. 130

    Margin per KG =
    130 - 110 = Rs. 20

    Total profit =
    20 × 100 × 2
    = Rs. 4,000
  */

  const getCostPerKg = (item: GroceryItem) => {
    if (item.weight <= 0) return 0;

    return (
      (item.rate + item.transportation) /
      item.weight
    );
  };

  const getMarginPerKg = (item: GroceryItem) => {
    return (
      item.sellingPrice -
      getCostPerKg(item)
    );
  };

  const getMarginPercent = (item: GroceryItem) => {
    const costPerKg = getCostPerKg(item);

    if (costPerKg <= 0) return 0;

    return (
      (getMarginPerKg(item) / costPerKg) *
      100
    );
  };

  const getTotalSales = (item: GroceryItem) => {
    return (
      item.sellingPrice *
      item.weight *
      item.quantity
    );
  };

  const getTotalCost = (item: GroceryItem) => {
    return (
      (item.rate + item.transportation) *
      item.quantity
    );
  };

  const getTotalProfit = (item: GroceryItem) => {
    return (
      getTotalSales(item) -
      getTotalCost(item)
    );
  };

  // --------------------------------
  // Live Modal Calculations
  // --------------------------------

  const liveWeight = Number(form.weight) || 0;
  const liveRate = Number(form.rate) || 0;
  const liveTransport =
    Number(form.transportation) || 0;
  const liveSellingPrice =
    Number(form.sellingPrice) || 0;
  const liveQuantity =
    Number(form.quantity) || 0;

  const liveCostPerKg =
    liveWeight > 0
      ? (liveRate + liveTransport) /
        liveWeight
      : 0;

  const liveMarginPerKg =
    liveSellingPrice - liveCostPerKg;

  const liveMarginPercent =
    liveCostPerKg > 0
      ? (liveMarginPerKg /
          liveCostPerKg) *
        100
      : 0;

  const liveTotalProfit =
    liveMarginPerKg *
    liveWeight *
    liveQuantity;

  // --------------------------------
  // Summary
  // --------------------------------

  const summary = useMemo(() => {
    let totalWeight = 0;
    let totalSales = 0;
    let totalCost = 0;
    let totalProfit = 0;

    items.forEach((item) => {
      totalWeight +=
        item.weight * item.quantity;

      totalSales += item.sellingPrice * item.weight * item.quantity;

      totalCost += (item.rate + item.transportation) * item.quantity;

      totalProfit +=
        item.sellingPrice * item.weight * item.quantity -
        (item.rate + item.transportation) * item.quantity;
    });

    return {
      totalWeight,
      totalSales,
      totalCost,
      totalProfit,
    };
  }, [items]);

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 4,
        },
      }}
    >
      {/* ================= HEADER ================= */}

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
            <LocalGroceryStore color="primary" />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              Grocery
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage grocery items, costs and
            profits
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openAddModal}
        >
          Add Item
        </Button>
      </Stack>

      {/* ================= SUMMARY ================= */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        {/* Total Items */}

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
                Total Items
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

        {/* Total Weight */}

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
                Total Weight
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {summary.totalWeight.toLocaleString()} KG
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Sales */}

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
                {formatPrice(
                  summary.totalSales
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Profit */}

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
                summary.totalProfit >= 0
                  ? "success.main"
                  : "error.main",
              borderRadius: 3,
              bgcolor:
                summary.totalProfit >= 0
                  ? "success.50"
                  : "error.50",
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color={
                  summary.totalProfit >= 0
                    ? "success.dark"
                    : "error.dark"
                }
              >
                Total Profit
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                  color:
                    summary.totalProfit >= 0
                      ? "success.main"
                      : "error.main",
                }}
              >
                {formatPrice(
                  summary.totalProfit
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ================= TABLE ================= */}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Table Header */}

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
                Grocery Items
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Inventory and profit
                calculation
              </Typography>
            </Box>

            <Chip
              label={`${items.length} Items`}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Box>

        <Divider />

        {/* Empty State */}

        {loading ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="text.secondary">Loading grocery items...</Typography>
          </Box>
        ) : items.length === 0 ? (
          <Box
            sx={{
              py: 10,
              textAlign: "center",
            }}
          >
            <LocalGroceryStore
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
              No grocery items
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              Add your first grocery item
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openAddModal}
            >
              Add Item
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
                minWidth: 1500,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>S.No</b>
                  </TableCell>

                  <TableCell>
                    <b>Item Name</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Weight KG</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Qty</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Rate</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Transport</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Cost/KG</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Selling/KG</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Margin/KG</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Margin %</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Total</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Total Profit</b>
                  </TableCell>

                  <TableCell align="center">
                    <b>Action</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map(
                  (item, index) => {
                    const costPerKg =
                      getCostPerKg(item);

                    const marginPerKg =
                      getMarginPerKg(item);

                    const marginPercent =
                      getMarginPercent(item);

                    const totalSales =
                      getTotalSales(item);

                    const totalProfit =
                      getTotalProfit(item);

                    return (
                      <TableRow
                        key={item.id}
                        hover
                      >
                        <TableCell>
                          {index + 1}
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,
                            }}
                          >
                            {item.itemName}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          {item.weight}
                        </TableCell>

                        <TableCell align="right">
                          {item.quantity}
                        </TableCell>

                        <TableCell align="right">
                          {formatPrice(
                            item.rate
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatPrice(
                            item.transportation
                          )}
                        </TableCell>

                        {/* Cost per KG */}

                        <TableCell align="right">
                          {formatPrice(
                            costPerKg
                          )}
                        </TableCell>

                        {/* Selling */}

                        <TableCell align="right">
                          {formatPrice(
                            item.sellingPrice
                          )}
                        </TableCell>

                        {/* Margin */}

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              marginPerKg >= 0
                                ? "success.main"
                                : "error.main",
                            fontWeight: 600,
                          }}
                        >
                          {formatPrice(
                            marginPerKg
                          )}
                        </TableCell>

                        {/* Margin % */}

                        <TableCell
                          align="right"
                        >
                          {marginPercent.toFixed(
                            2
                          )}
                          %
                        </TableCell>

                        {/* Total Sales */}

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {formatPrice(
                            totalSales
                          )}
                        </TableCell>

                        {/* Total Profit */}

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              totalProfit >= 0
                                ? "success.main"
                                : "error.main",
                            fontWeight: 700,
                          }}
                        >
                          {formatPrice(
                            totalProfit
                          )}
                        </TableCell>

                        {/* Actions */}

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
                    );
                  }
                )}

                {/* Grand Total */}

                <TableRow>
                  <TableCell
                    colSpan={10}
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
                        summary.totalSales
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color:
                          summary.totalProfit >=
                          0
                            ? "success.main"
                            : "error.main",
                      }}
                    >
                      {formatPrice(
                        summary.totalProfit
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

      {/* ================= ADD / EDIT MODAL ================= */}

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
              ? "Edit Grocery Item"
              : "Add Grocery Item"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Enter item details below
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
            {/* Item Name */}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Item Name"
                value={form.itemName}
                onChange={(e) =>
                  handleChange(
                    "itemName",
                    e.target.value
                  )
                }
              />
            </Grid>

            {/* Weight */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Weight (KG)"
                type="number"
                value={form.weight}
                onChange={(e) =>
                  handleChange(
                    "weight",
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

            {/* Quantity */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={form.quantity}
                onChange={(e) =>
                  handleChange(
                    "quantity",
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

            {/* Rate */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Rate"
                type="number"
                value={form.rate}
                onChange={(e) =>
                  handleChange(
                    "rate",
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

            {/* Transportation */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Transportation"
                type="number"
                value={form.transportation}
                onChange={(e) =>
                  handleChange(
                    "transportation",
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

            {/* Selling Price */}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Selling Price per KG"
                type="number"
                value={form.sellingPrice}
                onChange={(e) =>
                  handleChange(
                    "sellingPrice",
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

            {/* ================= LIVE CALCULATIONS ================= */}

            <Grid size={12}>
              <Divider sx={{ my: 1 }} />

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Automatic Calculation
              </Typography>
            </Grid>

            {/* Cost per KG */}

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "action.hover",
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Cost / KG
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mt: 0.5,
                    }}
                  >
                    {formatPrice(
                      liveCostPerKg
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Margin */}

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor:
                    liveMarginPerKg >= 0
                      ? "success.main"
                      : "error.main",
                  bgcolor:
                    liveMarginPerKg >= 0
                      ? "success.50"
                      : "error.50",
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Margin / KG
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mt: 0.5,
                      color:
                        liveMarginPerKg >= 0
                          ? "success.main"
                          : "error.main",
                    }}
                  >
                    {formatPrice(
                      liveMarginPerKg
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Profit */}

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor:
                    liveTotalProfit >= 0
                      ? "success.main"
                      : "error.main",
                  bgcolor:
                    liveTotalProfit >= 0
                      ? "success.50"
                      : "error.50",
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Total Profit
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mt: 0.5,
                      color:
                        liveTotalProfit >= 0
                          ? "success.main"
                          : "error.main",
                    }}
                  >
                    {formatPrice(
                      liveTotalProfit
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Margin Percentage */}

            <Grid size={12}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  textAlign: "right",
                }}
              >
                Margin:{" "}
                <b>
                  {liveMarginPercent.toFixed(
                    2
                  )}
                  %
                </b>
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>

        {/* Modal Actions */}

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
            startIcon={
              editingId !== null ? (
                <EditOutlined />
              ) : (
                <Add />
              )
            }
          >
            {editingId !== null
              ? "Update Item"
              : "Add Item"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
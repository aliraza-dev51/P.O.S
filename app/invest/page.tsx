"use client";

import { useMemo, useState } from "react";

import {
  Add,
  DeleteOutlined,
  EditOutlined,
  TrendingUp,
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

/* =========================================================
   TYPES
========================================================= */

type InvestItem = {
  id: number;
  dateTime: string;
  itemName: string;
  weight: number;
  quantity: number;
  quantityPerPack: number;
  rate: number;
  marketRate: number;
};

type InvestForm = {
  itemName: string;
  weight: string;
  quantity: string;
  quantityPerPack: string;
  rate: string;
  marketRate: string;
};

/* =========================================================
   INITIAL DATA
========================================================= */

const initialItems: InvestItem[] = [];

const emptyForm: InvestForm = {
  itemName: "",
  weight: "",
  quantity: "",
  quantityPerPack: "",
  rate: "",
  marketRate: "",
};

/* =========================================================
   PAGE
========================================================= */

export default function InvestPage() {
  const [items, setItems] =
    useState<InvestItem[]>(initialItems);

  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<InvestForm>(emptyForm);

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
    field: keyof InvestForm,
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
    setForm({ ...emptyForm });
    setOpen(true);
  };

  /* =======================================================
     OPEN EDIT MODAL
  ======================================================= */

  const openEditModal = (item: InvestItem) => {
    setEditingId(item.id);

    setForm({
      itemName: item.itemName,
      weight: String(item.weight),
      quantity: String(item.quantity),
      quantityPerPack: String(
        item.quantityPerPack
      ),
      rate: String(item.rate),
      marketRate: String(item.marketRate),
    });

    setOpen(true);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  /* =======================================================
     SAVE / UPDATE
  ======================================================= */

  const saveItem = () => {
    const itemName = form.itemName.trim();

    const weight = Number(form.weight);
    const quantity = Number(form.quantity);
    const quantityPerPack =
      Number(form.quantityPerPack);
    const rate = Number(form.rate);
    const marketRate =
      Number(form.marketRate);

    /* ---------------- VALIDATION ---------------- */

    if (
      !itemName ||
      !Number.isFinite(weight) ||
      !Number.isFinite(quantity) ||
      !Number.isFinite(quantityPerPack) ||
      !Number.isFinite(rate) ||
      !Number.isFinite(marketRate) ||
      weight <= 0 ||
      quantity <= 0 ||
      quantityPerPack <= 0 ||
      rate < 0 ||
      marketRate < 0
    ) {
      alert(
        "Please fill all fields correctly."
      );
      return;
    }

    /* ---------------- KEEP OLD DATE ON EDIT ---------------- */

    const existingItem =
      editingId !== null
        ? items.find(
            (item) => item.id === editingId
          )
        : undefined;

    const newItem: InvestItem = {
      id: editingId ?? Date.now(),

      dateTime:
        existingItem?.dateTime ??
        new Date().toISOString(),

      itemName,
      weight,
      quantity,
      quantityPerPack,
      rate,
      marketRate,
    };

    /* ---------------- UPDATE ---------------- */

    if (editingId !== null) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingId
            ? newItem
            : item
        )
      );
    }

    /* ---------------- ADD ---------------- */

    else {
      setItems((currentItems) => [
        ...currentItems,
        newItem,
      ]);
    }

    closeModal();
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteItem = (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this investment?"
    );

    if (!confirmDelete) {
      return;
    }

    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== id
      )
    );
  };

  /* =======================================================
     CALCULATIONS
  ======================================================= */

  /*
    Example:

    Quantity Per Ctn/Doz = 12
    Rate = Rs. 1200
    Market Rate = Rs. 1500

    Rate Per Ctn/Doz
    = 1200 / 12
    = Rs. 100

    Market Rate Per Ctn/Doz
    = 1500 / 12
    = Rs. 125

    Margin
    = 125 - 100
    = Rs. 25
  */

  const getRatePerUnit = (
    item: InvestItem
  ) => {
    if (item.quantityPerPack <= 0) {
      return 0;
    }

    return (
      item.rate /
      item.quantityPerPack
    );
  };

  const getMarketRatePerUnit = (
    item: InvestItem
  ) => {
    if (item.quantityPerPack <= 0) {
      return 0;
    }

    return (
      item.marketRate /
      item.quantityPerPack
    );
  };

  const getMarginPerUnit = (
    item: InvestItem
  ) => {
    return (
      getMarketRatePerUnit(item) -
      getRatePerUnit(item)
    );
  };

  const getTotalProfit = (
    item: InvestItem
  ) => {
    return (
      getMarginPerUnit(item) *
      item.quantity
    );
  };

  /* =======================================================
     LIVE MODAL CALCULATIONS
  ======================================================= */

  const liveQuantityPerPack =
    Number(form.quantityPerPack) || 0;

  const liveRate =
    Number(form.rate) || 0;

  const liveMarketRate =
    Number(form.marketRate) || 0;

  const liveQuantity =
    Number(form.quantity) || 0;

  const liveRatePerUnit =
    liveQuantityPerPack > 0
      ? liveRate /
        liveQuantityPerPack
      : 0;

  const liveMarketRatePerUnit =
    liveQuantityPerPack > 0
      ? liveMarketRate /
        liveQuantityPerPack
      : 0;

  const liveMarginPerUnit =
    liveMarketRatePerUnit -
    liveRatePerUnit;

  const liveTotalProfit =
    liveMarginPerUnit *
    liveQuantity;

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    let totalQuantity = 0;
    let totalInvestment = 0;
    let totalMarketValue = 0;
    let totalProfit = 0;

    items.forEach((item) => {
      totalQuantity += item.quantity;

      totalInvestment +=
        item.rate * item.quantity;

      totalMarketValue +=
        item.marketRate *
        item.quantity;

      totalProfit +=
        (item.marketRate / item.quantityPerPack -
          item.rate / item.quantityPerPack) *
        item.quantity;
    });

    return {
      totalQuantity,
      totalInvestment,
      totalMarketValue,
      totalProfit,
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
            <TrendingUp color="primary" />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              Invest
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage investments, market rates
            and profit margins
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openAddModal}
        >
          Add Investment
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
        {/* TOTAL ITEMS */}

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
                Total Investments
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

        {/* TOTAL QUANTITY */}

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
                Total Quantity
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {summary.totalQuantity.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* TOTAL INVESTMENT */}

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
                Total Investment
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {formatPrice(
                  summary.totalInvestment
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* TOTAL PROFIT */}

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
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
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
                Investment List
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Investment and market profit
                calculation
              </Typography>
            </Box>

            <Chip
              label={`${items.length} Records`}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Box>

        <Divider />

        {/* EMPTY */}

        {items.length === 0 ? (
          <Box
            sx={{
              py: 10,
              textAlign: "center",
            }}
          >
            <TrendingUp
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
              No investments
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              Add your first investment
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openAddModal}
            >
              Add Investment
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
                minWidth: 1600,
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
                    <b>Item Name</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Weight</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Quantity</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Qty / Ctn/Doz</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Market Rate</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Rate</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Rate / Ctn/Doz</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Market / Ctn/Doz</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Margin / Unit</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Profit</b>
                  </TableCell>

                  <TableCell align="center">
                    <b>Action</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map(
                  (item, index) => {
                    const ratePerUnit =
                      getRatePerUnit(item);

                    const marketRatePerUnit =
                      getMarketRatePerUnit(
                        item
                      );

                    const marginPerUnit =
                      getMarginPerUnit(item);

                    const totalProfit =
                      getTotalProfit(item);

                    return (
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

                        {/* ITEM */}

                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,
                            }}
                          >
                            {item.itemName}
                          </Typography>
                        </TableCell>

                        {/* WEIGHT */}

                        <TableCell align="right">
                          {item.weight}
                        </TableCell>

                        {/* QUANTITY */}

                        <TableCell align="right">
                          {item.quantity}
                        </TableCell>

                        {/* QTY PER PACK */}

                        <TableCell align="right">
                          {item.quantityPerPack}
                        </TableCell>

                        {/* MARKET RATE */}

                        <TableCell align="right">
                          {formatPrice(
                            item.marketRate
                          )}
                        </TableCell>

                        {/* RATE */}

                        <TableCell align="right">
                          {formatPrice(
                            item.rate
                          )}
                        </TableCell>

                        {/* AUTO RATE PER UNIT */}

                        <TableCell align="right">
                          {formatPrice(
                            ratePerUnit
                          )}
                        </TableCell>

                        {/* AUTO MARKET RATE */}

                        <TableCell align="right">
                          {formatPrice(
                            marketRatePerUnit
                          )}
                        </TableCell>

                        {/* AUTO MARGIN */}

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            color:
                              marginPerUnit >= 0
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          {formatPrice(
                            marginPerUnit
                          )}
                        </TableCell>

                        {/* AUTO PROFIT */}

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            color:
                              totalProfit >= 0
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          {formatPrice(
                            totalProfit
                          )}
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
                    );
                  }
                )}

                {/* GRAND TOTAL */}

                <TableRow>
                  <TableCell
                    colSpan={11}
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
              ? "Edit Investment"
              : "Add Investment"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Enter investment details below
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
            {/* ITEM NAME */}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Item Name"
                value={form.itemName}
                onChange={(event) =>
                  handleChange(
                    "itemName",
                    event.target.value
                  )
                }
              />
            </Grid>

            {/* WEIGHT */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Weight"
                type="number"
                value={form.weight}
                onChange={(event) =>
                  handleChange(
                    "weight",
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

            {/* QUANTITY */}

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
                onChange={(event) =>
                  handleChange(
                    "quantity",
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

            {/* QTY PER CTN / DOZ */}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Quantity per Ctn / Doz"
                type="number"
                value={
                  form.quantityPerPack
                }
                onChange={(event) =>
                  handleChange(
                    "quantityPerPack",
                    event.target.value
                  )
                }
                helperText="Example: 12 pieces per carton/dozen"
                slotProps={{
                  htmlInput: {
                    min: 1,
                  },
                }}
              />
            </Grid>

            {/* RATE */}

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
                onChange={(event) =>
                  handleChange(
                    "rate",
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

            {/* MARKET RATE */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Market Rate"
                type="number"
                value={form.marketRate}
                onChange={(event) =>
                  handleChange(
                    "marketRate",
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

            {/* =================================================
                AUTOMATIC CALCULATIONS
            ================================================= */}

            <Grid size={12}>
              <Divider
                sx={{
                  my: 1,
                }}
              />

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

            {/* RATE PER UNIT */}

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
                  bgcolor:
                    "action.hover",
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Rate / Ctn/Doz
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                    }}
                  >
                    {formatPrice(
                      liveRatePerUnit
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* MARKET RATE PER UNIT */}

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
                  bgcolor:
                    "action.hover",
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Market / Ctn/Doz
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                    }}
                  >
                    {formatPrice(
                      liveMarketRatePerUnit
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* MARGIN */}

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
                    liveMarginPerUnit >= 0
                      ? "success.main"
                      : "error.main",
                  bgcolor:
                    liveMarginPerUnit >= 0
                      ? "success.50"
                      : "error.50",
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Margin / Unit
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                      color:
                        liveMarginPerUnit >=
                        0
                          ? "success.main"
                          : "error.main",
                    }}
                  >
                    {formatPrice(
                      liveMarginPerUnit
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* TOTAL PROFIT */}

            <Grid size={12}>
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
                        variant="caption"
                        color="text.secondary"
                      >
                        Estimated Total Profit
                      </Typography>

                      <Typography
                        variant="h5"
                        sx={{
                          mt: 0.5,
                          fontWeight: 700,
                          color:
                            liveTotalProfit >=
                            0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        {formatPrice(
                          liveTotalProfit
                        )}
                      </Typography>
                    </Box>

                    <TrendingUp
                      sx={{
                        fontSize: 40,
                        color:
                          liveTotalProfit >=
                          0
                            ? "success.main"
                            : "error.main",
                      }}
                    />
                  </Stack>
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
            startIcon={
              editingId !== null ? (
                <EditOutlined />
              ) : (
                <Add />
              )
            }
          >
            {editingId !== null
              ? "Update Investment"
              : "Add Investment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
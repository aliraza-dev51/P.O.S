"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Add,
  DeleteOutlined,
  EditOutlined,
  Search,
  TrendingDown,
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
  InputAdornment,
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
   CONSTANTS
========================================================= */

const STORAGE_KEY = "pos-investments";

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
  const [items, setItems] = useState<InvestItem[]>([]);

  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<InvestForm>({
    ...emptyForm,
  });

  const [search, setSearch] = useState("");

  const [saving, setSaving] = useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    const loadInvestments = async () => {
      try {
        const response = await fetch("/api/invest", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch investments");
        }

        const investments = await response.json();

        if (Array.isArray(investments) && investments.length > 0) {
          setItems(investments);
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return;

        const localItems = JSON.parse(saved);

        if (!Array.isArray(localItems) || localItems.length === 0) return;

        const migratedItems = [];

        for (const item of localItems) {
          const migrationResponse = await fetch("/api/invest", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          });

          if (!migrationResponse.ok) {
            throw new Error("Failed to migrate local investments");
          }

          migratedItems.push(await migrationResponse.json());
        }

        setItems(migratedItems);
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to load investments:", error);
        alert("Investments load nahi ho saken.");
      }
    };

    loadInvestments();
  }, []);

  /* =======================================================
     FORMAT PRICE
  ======================================================= */

  const formatPrice = (value: number) => {
    return `Rs. ${value.toLocaleString("en-PK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  /* =======================================================
     FORMAT NUMBER
  ======================================================= */

  const formatNumber = (value: number) => {
    return value.toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    });
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
     OPEN ADD
  ======================================================= */

  const openAddModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setOpen(true);
  };

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const openEditModal = (item: InvestItem) => {
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

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    if (saving) return;

    setOpen(false);

    setEditingId(null);

    setForm({
      ...emptyForm,
    });
  };

  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const calculateRatePerUnit = useCallback(
    (rate: number, quantityPerPack: number) => {
      if (quantityPerPack <= 0) {
        return 0;
      }

      return rate / quantityPerPack;
    },
    []
  );

  const calculateMarketRatePerUnit = useCallback(
    (marketRate: number, quantityPerPack: number) => {
      if (quantityPerPack <= 0) {
        return 0;
      }

      return marketRate / quantityPerPack;
    },
    []
  );

  const calculateMarginPerUnit = useCallback(
    (item: InvestItem) => {
      return (
        calculateMarketRatePerUnit(
          item.marketRate,
          item.quantityPerPack
        ) -
        calculateRatePerUnit(
          item.rate,
          item.quantityPerPack
        )
      );
    },
    [calculateMarketRatePerUnit, calculateRatePerUnit]
  );

  const calculateProfit = useCallback(
    (item: InvestItem) => {
      return (
        calculateMarginPerUnit(item) *
        item.quantity
      );
    },
    [calculateMarginPerUnit]
  );

  /* =======================================================
     LIVE MODAL CALCULATIONS
  ======================================================= */

  const liveQuantity =
    Number(form.quantity) || 0;

  const liveQuantityPerPack =
    Number(form.quantityPerPack) || 0;

  const liveRate =
    Number(form.rate) || 0;

  const liveMarketRate =
    Number(form.marketRate) || 0;

  const liveRatePerUnit =
    calculateRatePerUnit(
      liveRate,
      liveQuantityPerPack
    );

  const liveMarketRatePerUnit =
    calculateMarketRatePerUnit(
      liveMarketRate,
      liveQuantityPerPack
    );

  const liveMarginPerUnit =
    liveMarketRatePerUnit -
    liveRatePerUnit;

  const liveProfit =
    liveMarginPerUnit * liveQuantity;

  const liveProfitPercentage =
    liveRatePerUnit > 0
      ? (liveMarginPerUnit / liveRatePerUnit) * 100
      : 0;

  /* =======================================================
     SAVE / UPDATE
  ======================================================= */

  const saveItem = async () => {
    const itemName = form.itemName.trim();

    const weight = Number(form.weight);
    const quantity = Number(form.quantity);
    const quantityPerPack = Number(
      form.quantityPerPack
    );
    const rate = Number(form.rate);
    const marketRate = Number(
      form.marketRate
    );

    if (
      !itemName ||
      !Number.isFinite(weight) ||
      !Number.isFinite(quantity) ||
      !Number.isFinite(quantityPerPack) ||
      !Number.isFinite(rate) ||
      !Number.isFinite(marketRate)
    ) {
      alert("Please fill all fields correctly.");
      return;
    }

    if (weight <= 0) {
      alert("Weight must be greater than 0.");
      return;
    }

    if (quantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    if (quantityPerPack <= 0) {
      alert(
        "Quantity per carton/dozen must be greater than 0."
      );
      return;
    }

    if (rate < 0 || marketRate < 0) {
      alert("Rates cannot be negative.");
      return;
    }

    setSaving(true);

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

    try {
      const response = await fetch(
        editingId !== null
          ? `/api/invest/${editingId}`
          : "/api/invest",
        {
          method: editingId !== null ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItem),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save investment");
      }

      const savedItem = await response.json();

      if (editingId !== null) {
        setItems((current) =>
          current.map((item) =>
            item.id === editingId ? savedItem : item
          )
        );
      } else {
        setItems((current) => [savedItem, ...current]);
      }

      setSaving(false);
      closeModal();
    } catch (error) {
      console.error("Failed to save investment:", error);
      setSaving(false);
      alert("Investment save nahi ho saki.");
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteItem = async (id: number) => {
    const item = items.find(
      (investment) =>
        investment.id === id
    );

    if (!item) return;

    const confirmed = window.confirm(
      `Delete "${item.itemName}" investment?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/invest/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete investment");
      }

      setItems((current) =>
        current.filter((investment) => investment.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete investment:", error);
      alert("Investment delete nahi ho saki.");
    }
  };

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredItems = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return items;
    }

    return items.filter((item) =>
      item.itemName
        .toLowerCase()
        .includes(keyword)
    );
  }, [items, search]);

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

      /*
        Rate is considered rate per carton/dozen.
        Therefore:

        Investment =
        Rate × Quantity
      */

      totalInvestment +=
        item.rate * item.quantity;

      totalMarketValue +=
        item.marketRate *
        item.quantity;

      totalProfit +=
        calculateProfit(item);
    });

    const profitPercentage =
      totalInvestment > 0
        ? (totalProfit / totalInvestment) *
          100
        : 0;

    return {
      totalQuantity,
      totalInvestment,
      totalMarketValue,
      totalProfit,
      profitPercentage,
    };
  }, [calculateProfit, items]);

  /* =======================================================
     CARD STYLE
  ======================================================= */

  const summaryCard = {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 3,
    height: "100%",
  };

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
            <TrendingUp color="primary" />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
              }}
            >
              Investments
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage stock investment,
            market value and expected
            profit.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openAddModal}
          sx={{
            borderRadius: 2,
            px: 2.5,
            fontWeight: 700,
          }}
        >
          Add Investment
        </Button>
      </Stack>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        {/* TOTAL RECORDS */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card
            elevation={0}
            sx={summaryCard}
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
                  fontWeight: 800,
                }}
              >
                {items.length}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Records
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* QUANTITY */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card
            elevation={0}
            sx={summaryCard}
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
                  fontWeight: 800,
                }}
              >
                {formatNumber(
                  summary.totalQuantity
                )}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Total units / packs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* INVESTMENT */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card
            elevation={0}
            sx={summaryCard}
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
                  fontWeight: 800,
                }}
              >
                {formatPrice(
                  summary.totalInvestment
                )}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Purchase value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* PROFIT */}

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
              ...summaryCard,
              borderColor:
                summary.totalProfit >= 0
                  ? "success.main"
                  : "error.main",
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Expected Profit
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 800,
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

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {summary.profitPercentage.toFixed(
                  2
                )}
                % margin
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =================================================
          MARKET VALUE BAR
      ================================================= */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Grid
            container
            spacing={3}
            sx={{
              alignItems: "center",
            }}
          >
            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Current Market Value
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  mt: 0.5,
                }}
              >
                {formatPrice(
                  summary.totalMarketValue
                )}
              </Typography>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Investment Value
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mt: 0.5,
                }}
              >
                {formatPrice(
                  summary.totalInvestment
                )}
              </Typography>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <Stack
              sx={{
                direction: "column",
                spacing: 1,
                alignItems: "center"
              }}
                > 
                {summary.totalProfit >= 0 ? (
                  <TrendingUp color="success" />
                ) : (
                  <TrendingDown color="error" />
                )}

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Expected Return
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color:
                        summary.totalProfit >=
                        0
                          ? "success.main"
                          : "error.main",
                    }}
                  >
                    {summary.profitPercentage.toFixed(
                      2
                    )}
                    %
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={2}
            sx={{
              justifyContent:
                "space-between",
              alignItems: {
                xs: "stretch",
                md: "center",
              },
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                }}
              >
                Investment List
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                All investment records
              </Typography>
            </Box>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
            >
              <TextField
                size="small"
                placeholder="Search item..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                sx={{
                  minWidth: {
                    sm: 260,
                  },
                }}
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

              <Chip
                label={`${filteredItems.length} Records`}
                color="primary"
                variant="outlined"
              />
            </Stack>
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
                fontSize: 60,
                color: "text.disabled",
              }}
            />

            <Typography
              variant="h6"
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              No Investments
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              Start by adding your first
              investment.
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openAddModal}
            >
              Add Investment
            </Button>
          </Box>
        ) : filteredItems.length === 0 ? (
          <Box
            sx={{
              py: 8,
              textAlign: "center",
            }}
          >
            <Search
              sx={{
                fontSize: 50,
                color: "text.disabled",
              }}
            />

            <Typography
              variant="h6"
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              No matching investment
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Try another item name.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            sx={{
              maxHeight: 650,
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
                    <b>#</b>
                  </TableCell>

                  <TableCell>
                    <b>Date</b>
                  </TableCell>

                  <TableCell>
                    <b>Item</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Weight</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Qty</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Qty / Pack</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Rate</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Market Rate</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Rate / Unit</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Market / Unit</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Margin</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Profit</b>
                  </TableCell>

                  <TableCell align="center">
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredItems.map(
                  (item, index) => {
                    const ratePerUnit =
                      calculateRatePerUnit(
                        item.rate,
                        item.quantityPerPack
                      );

                    const marketPerUnit =
                      calculateMarketRatePerUnit(
                        item.marketRate,
                        item.quantityPerPack
                      );

                    const margin =
                      marketPerUnit -
                      ratePerUnit;

                    const profit =
                      calculateProfit(item);

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

                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {item.itemName}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          {formatNumber(
                            item.weight
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatNumber(
                            item.quantity
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatNumber(
                            item.quantityPerPack
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatPrice(
                            item.rate
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatPrice(
                            item.marketRate
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatPrice(
                            ratePerUnit
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatPrice(
                            marketPerUnit
                          )}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            color:
                              margin >= 0
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          {formatPrice(
                            margin
                          )}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 800,
                            color:
                              profit >= 0
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          {formatPrice(
                            profit
                          )}
                        </TableCell>

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
                        fontWeight: 800,
                      }}
                    >
                      GRAND TOTAL
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 800,
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
          ADD / EDIT DIALOG
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
              fontWeight: 800,
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
            Enter stock investment details
            below.
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
            {/* ITEM */}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Item Name"
                placeholder="e.g. Cooking Oil"
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
                placeholder="e.g. 5"
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
                    step: "any",
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
                placeholder="e.g. 20"
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
                    min: 1,
                    step: "any",
                  },
                }}
              />
            </Grid>

            {/* QTY PACK */}

            <Grid size={12}>
              <TextField
                fullWidth
                label="Quantity per Carton / Dozen"
                placeholder="e.g. 12"
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
                helperText="Example: 12 pieces in one carton"
                slotProps={{
                  htmlInput: {
                    min: 1,
                    step: "any",
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
                label="Purchase Rate"
                placeholder="e.g. 1200"
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
                    step: "any",
                  },
                }}
              />
            </Grid>

            {/* MARKET */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                label="Market Rate"
                placeholder="e.g. 1500"
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
                    step: "any",
                  },
                }}
              />
            </Grid>

            {/* CALCULATION */}

            <Grid size={12}>
              <Divider
                sx={{
                  my: 1,
                }}
              />

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                }}
              >
                Automatic Calculation
              </Typography>
            </Grid>

            {/* PURCHASE PER UNIT */}

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
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Purchase / Unit
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 0.5,
                      fontWeight: 800,
                    }}
                  >
                    {formatPrice(
                      liveRatePerUnit
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* MARKET PER UNIT */}

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
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Market / Unit
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 0.5,
                      fontWeight: 800,
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
                  borderRadius: 2,
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
                      fontWeight: 800,
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

            {/* PROFIT */}

            <Grid size={12}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor:
                    liveProfit >= 0
                      ? "success.main"
                      : "error.main",
                  bgcolor:
                    liveProfit >= 0
                      ? "success.50"
                      : "error.50",
                  borderRadius: 2,
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
                        Expected Total Profit
                      </Typography>

                      <Typography
                        variant="h5"
                        sx={{
                          mt: 0.5,
                          fontWeight: 800,
                          color:
                            liveProfit >= 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        {formatPrice(
                          liveProfit
                        )}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {liveProfitPercentage.toFixed(
                          2
                        )}
                        % expected return
                      </Typography>
                    </Box>

                    {liveProfit >= 0 ? (
                      <TrendingUp
                        sx={{
                          fontSize: 45,
                          color:
                            "success.main",
                        }}
                      />
                    ) : (
                      <TrendingDown
                        sx={{
                          fontSize: 45,
                          color:
                            "error.main",
                        }}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        {/* ACTIONS */}

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
              ? "Update Investment"
              : "Add Investment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Paper,
  Stack,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";

import {
  ShoppingCart,
  CreditCard,
  ReceiptLong,
  TrendingUp,
  AccountBalanceWallet,
  Payments,
} from "@mui/icons-material";

import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";

type DashboardData = {
  stats: {
    todaySales: number;
    todayExpense: number;
    totalCredit: number;
    totalInvestment: number;
    todayInvestment: number;
    unpaidVendorBills: number;
    transactions: number;
    creditCustomers: number;
    pendingBills: number;
  };

  chartData: {
    date: string;
    day: string;
    sales: number;
    expense: number;
    investment: number;
  }[];

  pieData: {
    id: number;
    value: number;
    label: string;
  }[];

  recentSales: {
    id: number;
    date: string;
    amount: number;
    paymentMethod: string;
  }[];
};

const money = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Dashboard data load failed");
      }

      const result = await response.json();

      setData(result);
    } catch (error) {
      console.error(error);
      setError("Dashboard data load nahi ho saka.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const chartDataset = useMemo(() => {
    return data?.chartData ?? [];
  }, [data]);

  const hasPieData: boolean =
    data?.pieData.some((item) => item.value > 0) ?? false;

  const pieData = hasPieData
    ? data?.pieData ?? []
    : [{ id: 0, value: 1, label: "No data today" }];

  const pieValueFormatter = (item: { value: number }) => {
    if (!hasPieData) {
      return "No data today";
    }

    return money(item.value);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <CircularProgress />
          <Typography color="text.secondary">
            Dashboard loading...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={loadDashboard}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const stats = [
    {
      title: "Today's Sales",
      value: money(data.stats.todaySales),
      subtitle: `${data.stats.transactions} transactions`,
      icon: <ShoppingCart />,
    },
    {
      title: "Today's Expense",
      value: money(data.stats.todayExpense),
      subtitle: "Today's expenses",
      icon: <ReceiptLong />,
    },
    {
      title: "Credit",
      value: money(data.stats.totalCredit),
      subtitle: `${data.stats.creditCustomers} customers`,
      icon: <CreditCard />,
    },
    {
      title: "Investment",
      value: money(data.stats.totalInvestment),
      subtitle: "Total investment",
      icon: <TrendingUp />,
    },
  ];

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 4,
        },
      }}
    >
      {/* Header */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
            }}
          >
            Dashboard
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Real-time business overview
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={loadDashboard}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats */}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((item) => (
          <Grid
            key={item.title}
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
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{
                        mt: 1,
                        fontWeight: 700,
                      }}
                    >
                      {item.value}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {item.subtitle}
                    </Typography>
                  </Box>

                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 44,
                      height: 44,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      
 
<Grid container spacing={3} sx={{ mb: 3 }}>
  {/* Bar Chart */}
  <Grid size={{ xs: 12, lg: 8 }}>
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
        }}
      >
        Business Analysis
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 2,
        }}
      >
        Last 7 days sales, expenses and investments
      </Typography>

      <Box
        sx={{
          width: "100%",
          height: 350,
        }}
      >
        <BarChart
          dataset={chartDataset}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "day",
            },
          ]}
          series={[
            {
              dataKey: "sales",
              label: "Sales",
            },
            {
              dataKey: "expense",
              label: "Expense",
            },
            {
              dataKey: "investment",
              label: "Investment",
            },
          ]}
          height={330}
          margin={{
            left: 70,
            right: 20,
            top: 20,
            bottom: 40,
          }}
          grid={{
            horizontal: true,
          }}
        />
      </Box>
    </Paper>
  </Grid>

  {/* Pie Chart */}
          {/* Pie Chart */}
        <Grid
          size={{
            xs: 12,
            lg: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Today&apos;s Distribution
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Sales, expense and investment
            </Typography>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <PieChart
                skipAnimation={false}
                series={[
                  {
                    data: pieData,
                    innerRadius: 55,
                    paddingAngle: 3,
                    cornerRadius: 4,
                    arcLabel: (item) =>
                      hasPieData ? item.label ?? "" : "",
                    arcLabelMinAngle: 20,
                    valueFormatter: pieValueFormatter,
                  },
                ]}
                width={320}
                height={300}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {/* Financial Summary */}

      <Grid
        container
        spacing={3}
        sx={{
          mt: 0,
        }}
      >
        <Grid
          size={{
            xs: 12,
            md: 4,
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
                spacing={2}
                sx={{
                  alignItems: "center",
                }}
              >
                <Avatar>
                  <AccountBalanceWallet />
                </Avatar>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Today&apos;s Investment
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {money(data.stats.todayInvestment)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4,
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
                spacing={2}
                sx={{
                  alignItems: "center",
                }}
              >
                <Avatar>
                  <ReceiptLong />
                </Avatar>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Unpaid Vendor Bills
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {money(data.stats.unpaidVendorBills)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4,
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
                spacing={2}
                sx={{
                  alignItems: "center",
                }}
              > 
                <Avatar>
                  <Payments />
                </Avatar>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Pending Bills
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {data.stats.pendingBills}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Sales */}

      <Paper
        elevation={0}
        sx={{
          mt: 3,
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
              justifyContent: "space-between",
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
                Recent Sales
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Latest transactions
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider />

        {data.recentSales.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              No sales recorded yet.
            </Typography>
          </Box>
        ) : (
          data.recentSales.map((sale) => (
            <Box
              key={sale.id}
              sx={{
                px: 3,
                py: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  Sale #{sale.id}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {new Date(sale.date).toLocaleString("en-PK")}
                  {" • "}
                  {sale.paymentMethod}
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                {money(sale.amount)}
              </Typography>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
}
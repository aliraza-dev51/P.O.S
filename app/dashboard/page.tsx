"use client";

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
} from "@mui/material";

import {
  ShoppingCart,
  CreditCard,
  ReceiptLong,
  TrendingUp,
  Inventory2,
  People,
  ArrowForward,
} from "@mui/icons-material";
import { ResponsiveLineChart } from "../../components/ui/responsiveLineChart";

const salesData = [
  { day: "Mon", sales: 18500 },
  { day: "Tue", sales: 24200 },
  { day: "Wed", sales: 19800 },
  { day: "Thu", sales: 27600 },
  { day: "Fri", sales: 32100 },
  { day: "Sat", sales: 38900 },
  { day: "Sun", sales: 25500 },
];

const stats = [
  {
    title: "Today's Sales",
    value: "Rs. 125,500",
    subtitle: "12 transactions",
    icon: <ShoppingCart />,
  },
  {
    title: "Credit",
    value: "Rs. 45,200",
    subtitle: "18 customers",
    icon: <CreditCard />,
  },
  {
    title: "Vendor Bills",
    value: "Rs. 32,800",
    subtitle: "8 pending bills",
    icon: <ReceiptLong />,
  },
  {
    title: "Investment",
    value: "Rs. 250,000",
    subtitle: "Total investment",
    icon: <TrendingUp />,
  },
];

const quickActions = [
  {
    title: "New Sale",
    icon: <ShoppingCart />,
  },
  {
    title: "Add Grocery",
    icon: <Inventory2 />,
  },
  {
    title: "Add Credit",
    icon: <CreditCard />,
  },
  {
    title: "Add Employee",
    icon: <People />,
  },
];

export default function Dashboard() {
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
            Welcome back! Here is your business overview.
          </Typography>
        </Box>

        <Button variant="contained">
          Today
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3}>
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

      {/* Main Section */}
      <Grid
        container
        spacing={3}
        sx={{
          mt: 0,
        }}
      >
        {/* Sales Overview */}
        <Grid
          size={{
            xs: 12,
            lg: 8,
            md: 3,
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
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Sales Overview
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Sales performance for the current week
                </Typography>
              </Box>

              <Button size="small">
                View Report
              </Button>
            </Stack>

            <ResponsiveLineChart data={salesData} value="sales" />
          </Paper>
        </Grid>

        {/* Quick Actions */}
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
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Quick Actions
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
              }}
            >
              Frequently used actions
            </Typography>

            <Stack spacing={1}>
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="text"
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    py: 1.5,
                    px: 1.5,
                  }}
                  startIcon={action.icon}
                  endIcon={<ArrowForward />}
                >
                  {action.title}
                </Button>
              ))}
            </Stack>
          </Paper>
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

            <Button>
              View All
            </Button>
          </Stack>
        </Box>

        <Divider />

        {[
          ["#1001", "Ali Store", "Rs. 8,500"],
          ["#1002", "Ahmed Khan", "Rs. 12,200"],
          ["#1003", "Usman Mart", "Rs. 5,700"],
          ["#1004", "Bilal Grocery", "Rs. 15,400"],
        ].map(([id, customer, amount]) => (
          <Box
            key={id}
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
                {customer}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Sale {id}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontWeight: 700,
              }}
            >
              {amount}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
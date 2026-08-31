"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
} from "@mui/material";

import {
  Person,
  Email,
  Phone,
  AdminPanelSettings,
  Logout,
} from "@mui/icons-material";
import LoadingScreen from "@/components/LoadingScreen";

type UserData = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  phone: string | null;
  image: string | null;
  createdAt: string;
};

export default function UserPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("User data load failed");
        }

        const data = await response.json();

        setUser(data.user);
      } catch (error) {
        console.error("USER PAGE ERROR:", error);
        setError("User data load nahi ho saka.");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
    });
  };

  if (loading) {
    return <LoadingScreen label="User profile loading" />;
  }

  if (error || !user) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          {error || "User not found"}
        </Alert>
      </Box>
    );
  }

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

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
          }}
        >
          My Profile
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
          }}
        >
          Your VPOS account information
        </Typography>
      </Box>

      {/* Profile Header */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={3}
            sx={{
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
            }}
          >
            <Avatar
              src={user.image || undefined}
              sx={{
                width: 90,
                height: 90,
                fontSize: 36,
                bgcolor: "primary.main",
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                }}
              >
                {user.name}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                {user.email}
              </Typography>

              <Chip
                label={user.role}
                size="small"
                icon={<AdminPanelSettings />}
                sx={{
                  mt: 1.5,
                  fontWeight: 600,
                }}
              />
            </Box>

            <Button
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* User Information */}

      <Grid container spacing={3}>
        {/* Personal Information */}

        <Grid
          size={{
            xs: 12,
            md: 8,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                Account Information
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Your registered account details
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ p: 3 }}>
              <Stack spacing={3}>
                {/* Name */}

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Avatar
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: "action.hover",
                      color: "text.primary",
                    }}
                  >
                    <Person />
                  </Avatar>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Full Name
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {user.name}
                    </Typography>
                  </Box>
                </Stack>

                {/* Email */}

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Avatar
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: "action.hover",
                      color: "text.primary",
                    }}
                  >
                    <Email />
                  </Avatar>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Email Address
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {user.email}
                    </Typography>
                  </Box>
                </Stack>

                {/* Phone */}

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Avatar
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: "action.hover",
                      color: "text.primary",
                    }}
                  >
                    <Phone />
                  </Avatar>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Phone
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {user.phone || "Not provided"}
                    </Typography>
                  </Box>
                </Stack>

                {/* Role */}

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Avatar
                    sx={{
                      width: 42,
                      height: 42,
                      bgcolor: "action.hover",
                      color: "text.primary",
                    }}
                  >
                    <AdminPanelSettings />
                  </Avatar>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Account Role
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {user.role}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Account Summary */}

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
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                Account Summary
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    User ID
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    #{user.id}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Role
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {user.role}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Account Created
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {new Date(user.createdAt).toLocaleDateString(
                      "en-PK"
                    )}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result) {
        setError("Login failed.");
        return;
      }

      if (result.error) {
        setError("Email ya password incorrect hai.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError("Login nahi ho saka. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8fafc",
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 430,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            {/* Header */}

            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 2,
                  borderRadius: 3,
                  bgcolor: "primary.main",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LockOutlinedIcon />
              </Box>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                }}
              >
                Welcome Back
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Login to your VPOS account
              </Typography>
            </Box>

            {/* Error */}

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {/* Form */}

            <Box
              component="form"
              onSubmit={handleLogin}
            >
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="admin@vpos.com"
                  required
                  autoComplete="email"
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    height: 50,
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={24}
                      color="inherit"
                    />
                  ) : (
                    "Login"
                  )}
                </Button>
              </Stack>
            </Box>

            {/* Demo credentials */}


            <Typography variant="body2" color="text.secondary" sx ={{ textAlign: "center" }}>
              New to NextPOS?{" "}
              <Link href="/signup" style={{ fontWeight: 600 }}>
                Create an account
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
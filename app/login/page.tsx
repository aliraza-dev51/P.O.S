"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowForward,
  CheckCircle,
  Inventory2,
  LockOutlined,
  PointOfSale,
  ReceiptLong,
  ShoppingCartOutlined,
  Storefront,
  TrendingUp,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { keyframes } from "@mui/system";

/* =========================================================
   COLORS
========================================================= */

const GREEN = "#2f8f5b";
const DARK_GREEN = "#236b43";
const DARK = "#183326";

/* =========================================================
   ANIMATIONS
========================================================= */

const rotateSlow = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const rotateReverse = keyframes`
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-18px);
  }

  100% {
    transform: translateY(0px);
  }
`;

const floatReverse = keyframes`
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(14px);
  }

  100% {
    transform: translateY(0px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 0.35;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }

  100% {
    transform: scale(0.95);
    opacity: 0.35;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(25px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(25px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scan = keyframes`
  0% {
    transform: translateY(-120px);
    opacity: 0;
  }

  15% {
    opacity: 0.7;
  }

  85% {
    opacity: 0.7;
  }

  100% {
    transform: translateY(700px);
    opacity: 0;
  }
`;

const dash = keyframes`
  from {
    stroke-dashoffset: 0;
  }

  to {
    stroke-dashoffset: -400;
  }
`;

const blink = keyframes`
  0%,
  100% {
    opacity: 0.25;
  }

  50% {
    opacity: 1;
  }
`;

/* =========================================================
   POS FLOATING ITEM
========================================================= */

function FloatingIcon({
  children,
  top,
  left,
  right,
  bottom,
  delay = "0s",
  reverse = false,
}: {
  children: React.ReactNode;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay?: string;
  reverse?: boolean;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        top,
        left,
        right,
        bottom,

        width: 68,
        height: 68,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        borderRadius: 2.5,

        color: "rgba(255,255,255,0.82)",

        background: "rgba(255,255,255,0.08)",

        border: "1px solid rgba(255,255,255,0.15)",

        backdropFilter: "blur(12px)",

        boxShadow: "0 15px 35px rgba(23,77,53,0.16)",

        animation: `${
          reverse ? floatReverse : float
        } 5s ease-in-out infinite`,

        animationDelay: delay,

        zIndex: 3,
      }}
    >
      {children}
    </Box>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function LoginPage() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  /* =======================================================
     CHANGE
  ======================================================= */

  const handleChange = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (isSignup) {
      if (!form.name.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (form.password.length < 6) {
        setError(
          "Password must contain at least 6 characters."
        );
        return;
      }

      if (
        form.password !==
        form.confirmPassword
      ) {
        setError("Passwords do not match.");
        return;
      }
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    /*
      Firebase yahan connect hogi.

      Login:
      await loginUser(form.email, form.password);

      Signup:
      await signupUser(form.email, form.password);
    */

    setTimeout(() => {
      setLoading(false);

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      localStorage.removeItem("posAuthenticated");
      sessionStorage.removeItem("posAuthenticated");
      storage.setItem("posAuthenticated", "true");
      router.replace("/dashboard");

      console.log(
        isSignup ? "SIGNUP" : "LOGIN",
        form
      );
    }, 1200);
  };

  /* =======================================================
     SWITCH
  ======================================================= */

  const switchMode = () => {
    setIsSignup((previous) => !previous);

    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        p: {
          xs: 0,
          md: 2,
        },

        background:
          "linear-gradient(135deg, #e8f5ed 0%, #f7fbf8 48%, #dcefe3 100%)",

        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ===================================================
          OUTER BACKGROUND GLOW
      =================================================== */}

      <Box
        sx={{
          position: "absolute",

          width: 650,
          height: 650,

          left: "-280px",
          top: "-250px",

          borderRadius: "50%",

          background:
            "rgba(47,143,91,0.18)",

          filter: "blur(100px)",

          animation:
            `${pulse} 7s ease-in-out infinite`,
        }}
      />

      <Box
        sx={{
          position: "absolute",

          width: 500,
          height: 500,

          right: "-220px",
          bottom: "-220px",

          borderRadius: "50%",

          background:
            "rgba(120, 201, 154, 0.22)",

          filter: "blur(100px)",

          animation:
            `${pulse} 8s ease-in-out infinite`,
        }}
      />

      {/* ===================================================
          MAIN
      =================================================== */}

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1250,

          minHeight: {
            xs: "100vh",
            md: 720,
          },

          display: {
            xs: "block",
            md: "grid",
          },

          gridTemplateColumns:
            "1.12fr 0.88fr",

          overflow: "hidden",

          borderRadius: {
            xs: 0,
            md: 4,
          },

          background: "#ffffff",

          boxShadow:
            "0 35px 100px rgba(0,0,0,0.4)",

          position: "relative",
          zIndex: 5,
        }}
      >
        {/* =================================================
            LEFT ANIMATION / BRAND SECTION
        ================================================= */}

        <Box
          sx={{
            minHeight: {
              xs: 390,
              md: 720,
            },

            position: "relative",

            overflow: "hidden",

            display: "flex",
            flexDirection: "column",

            justifyContent: "space-between",

            color: "white",

            p: {
              xs: 3,
              sm: 5,
              md: 6,
            },

            background: `
              radial-gradient(
                circle at 75% 35%,
                rgba(177, 239, 199, 0.32),
                transparent 30%
              ),
              linear-gradient(
                145deg,
                #174d35 0%,
                #23764b 48%,
                #3eaa70 100%
              )
            `,
          }}
        >
          {/* =================================================
              ANIMATED GRID
          ================================================= */}

          <Box
            sx={{
              position: "absolute",
              inset: 0,

              opacity: 0.08,

              backgroundImage: `
                linear-gradient(
                  rgba(255,255,255,1) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(255,255,255,1) 1px,
                  transparent 1px
                )
              `,

              backgroundSize: "42px 42px",
            }}
          />

          {/* =================================================
              BIG POS CIRCLES
          ================================================= */}

          <Box
            sx={{
              position: "absolute",

              width: {
                xs: 400,
                md: 650,
              },

              height: {
                xs: 400,
                md: 650,
              },

              borderRadius: "50%",

              border:
                "1px solid rgba(255,255,255,0.12)",

              right: {
                xs: -250,
                md: -270,
              },

              top: {
                xs: -30,
                md: 35,
              },

              animation:
                `${rotateSlow} 35s linear infinite`,
            }}
          >
            <Box
              sx={{
                position: "absolute",

                width: "72%",
                height: "72%",

                borderRadius: "50%",

                border:
                  "1px solid rgba(255,255,255,0.10)",

                left: "14%",
                top: "14%",
              }}
            />

            <Box
              sx={{
                position: "absolute",

                width: "48%",
                height: "48%",

                borderRadius: "50%",

                border:
                  "1px solid rgba(255,255,255,0.09)",

                left: "26%",
                top: "26%",
              }}
            />
          </Box>

          {/* =================================================
              SECOND ROTATING RING
          ================================================= */}

          <Box
            sx={{
              position: "absolute",

              width: 280,
              height: 280,

              borderRadius: "50%",

              border:
                "2px dashed rgba(255,255,255,0.12)",

              right: 50,
              bottom: 40,

              animation:
                `${rotateReverse} 20s linear infinite`,
            }}
          />

          {/* =================================================
              SCAN LINE
          ================================================= */}

          <Box
            sx={{
              position: "absolute",

              top: 0,
              left: 0,
              right: 0,

              height: 2,

              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)",

              animation:
                `${scan} 7s linear infinite`,

              zIndex: 2,
            }}
          />

          {/* =================================================
              FLOATING POS ITEMS
          ================================================= */}

          <FloatingIcon
            top="15%"
            left="7%"
            delay="0s"
          >
            <ReceiptLong />
          </FloatingIcon>

          <FloatingIcon
            top="58%"
            left="8%"
            delay="1.2s"
            reverse
          >
            <ShoppingCartOutlined />
          </FloatingIcon>

          <FloatingIcon
            top="20%"
            right="8%"
            delay="0.8s"
          >
            <Inventory2 />
          </FloatingIcon>

          <FloatingIcon
            bottom="11%"
            right="10%"
            delay="2s"
            reverse
          >
            <TrendingUp />
          </FloatingIcon>

          {/* =================================================
              BRAND
          ================================================= */}

          <Box
            sx={{
              position: "relative",
              zIndex: 10,

              animation:
                `${slideUp} .7s ease`,
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 58,
                  height: 58,

                  borderRadius: 2.5,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  background:
                    "rgba(255,255,255,0.14)",

                  border:
                    "1px solid rgba(255,255,255,0.25)",

                  backdropFilter: "blur(10px)",

                  boxShadow:
                    "0 10px 30px rgba(23,77,53,.16)",
                }}
              >
                <PointOfSale
                  sx={{
                    fontSize: 32,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 21,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                  }}
                >
                  POS SYSTEM
                </Typography>

                <Typography
                  sx={{
                    fontSize: 10,
                    letterSpacing: 2,
                    opacity: 0.65,
                  }}
                >
                  SMART BUSINESS
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* =================================================
              CENTER CONTENT
          ================================================= */}

          <Box
            sx={{
              position: "relative",
              zIndex: 10,

              maxWidth: 500,

              animation:
                `${slideUp} .9s ease`,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: 38,
                  md: 56,
                },

                fontWeight: 300,

                lineHeight: 1.08,

                mb: 2,
              }}
            >
              Simplified
              <br />
              point of sale
              <br />
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                }}
              >
                for your business.
              </Box>
            </Typography>

            <Typography
              sx={{
                fontSize: 16,

                lineHeight: 1.8,

                maxWidth: 430,

                color:
                  "rgba(255,255,255,.75)",
              }}
            >
              Manage sales, inventory,
              customers, employees and
              expenses from one powerful
              POS platform.
            </Typography>

            {/* FEATURES */}

            <Stack
              spacing={1.3}
              sx={{
                mt: 3,
              }}
            >
              {[
                "Fast sales management",
                "Inventory tracking",
                "Employee & vendor management",
              ].map((item) => (
                <Stack
                  key={item}
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "center",
                  }}
                >
                  <CheckCircle
                    sx={{
                      fontSize: 18,
                      opacity: 0.9,
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        "rgba(255,255,255,.8)",
                    }}
                  >
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* =================================================
              POS TERMINAL DECORATION
          ================================================= */}

          <Box
            sx={{
              position: "absolute",

              right: 45,
              bottom: 45,

              width: 190,
              height: 120,

              display: {
                xs: "none",
                lg: "block",
              },

              border:
                "1px solid rgba(255,255,255,.16)",

              borderRadius: 3,

              background:
                "rgba(255,255,255,.07)",

              backdropFilter: "blur(10px)",

              transform: "perspective(500px) rotateY(-8deg)",

              zIndex: 2,

              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
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
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.65,
                  }}
                >
                  TODAY&apos;S SALES
                </Typography>

                <PointOfSale
                  sx={{
                    fontSize: 17,
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 800,
                  mt: 1,
                }}
              >
                Rs. 125,500
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  height: 3,

                  borderRadius: 2,

                  background:
                    "rgba(255,255,255,.15)",

                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: "72%",
                    height: "100%",

                    background:
                      "rgba(255,255,255,.7)",

                    animation:
                      `${pulse} 2s ease-in-out infinite`,
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* =================================================
              FOOTER
          ================================================= */}

          <Typography
            variant="caption"
            sx={{
              position: "relative",
              zIndex: 10,

              opacity: 0.45,

              letterSpacing: 0.5,
            }}
          >
            © 2026 POS System • Business
            Management
          </Typography>
        </Box>

        {/* =================================================
            RIGHT LOGIN FORM
        ================================================= */}

        <Box
          key={isSignup ? "signup" : "login"}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",

            p: {
              xs: 3,
              sm: 5,
              md: 6,
            },

            background: "#ffffff",

            animation:
              `${slideRight} .45s ease`,
          }}
        >
          {/* =================================================
              MOBILE BRAND
          ================================================= */}

          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",

              display: {
                xs: "flex",
                md: "none",
              },

              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                borderRadius: 1.5,

                color: "white",

                background: GREEN,
              }}
            >
              <PointOfSale />
            </Box>

            <Typography
              sx={{
                fontWeight: 800,
              }}
            >
              POS SYSTEM
            </Typography>
          </Stack>

          {/* =================================================
              FORM HEADER
          ================================================= */}

          <Box
            sx={{
              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: 30,
                  md: 34,
                },

                fontWeight: 800,

                color: DARK,
              }}
            >
              {isSignup
                ? "Create Account"
                : "Log In"}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.8,
              }}
            >
              {isSignup
                ? "Create your POS administrator account."
                : "Log in with your details to continue."}
            </Typography>
          </Box>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 1.5,
              }}
            >
              {error}
            </Alert>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <Box
            component="form"
            onSubmit={handleSubmit}
          >
            {/* NAME */}

            {isSignup && (
              <TextField
                fullWidth
                label="Full Name"
                value={form.name}
                onChange={(event) =>
                  handleChange(
                    "name",
                    event.target.value
                  )
                }
                autoComplete="name"
                sx={{
                  mb: 2,
                }}
              />
            )}

            {/* EMAIL */}

            <TextField
              fullWidth
              label="Email Address / Username"
              type="email"
              value={form.email}
              onChange={(event) =>
                handleChange(
                  "email",
                  event.target.value
                )
              }
              autoComplete="email"
              sx={{
                mb: 2,
              }}
            />

            {/* PASSWORD */}

            <TextField
              fullWidth
              label="Password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={form.password}
              onChange={(event) =>
                handleChange(
                  "password",
                  event.target.value
                )
              }
              autoComplete={
                isSignup
                  ? "new-password"
                  : "current-password"
              }
              sx={{
                mb: isSignup ? 2 : 1,
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        edge="end"
                        onClick={() =>
                          setShowPassword(
                            (previous) =>
                              !previous
                          )
                        }
                      >
                        {showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* CONFIRM PASSWORD */}

            {isSignup && (
              <TextField
                fullWidth
                label="Confirm Password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={
                  form.confirmPassword
                }
                onChange={(event) =>
                  handleChange(
                    "confirmPassword",
                    event.target.value
                  )
                }
                autoComplete="new-password"
                sx={{
                  mb: 1,
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          edge="end"
                          onClick={() =>
                            setShowConfirmPassword(
                              (previous) =>
                                !previous
                            )
                          }
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}

            {/* REMEMBER */}

            {!isSignup && (
              <Stack
                direction="row"
                sx={{
                  justifyContent:
                    "space-between",

                  alignItems: "center",

                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={
                        rememberMe
                      }
                      onChange={(event) =>
                        setRememberMe(
                          event.target
                            .checked
                        )
                      }
                      sx={{
                        color: "#aaa",

                        "&.Mui-checked": {
                          color: GREEN,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Remember me
                    </Typography>
                  }
                />

                <Button
                  type="button"
                  size="small"
                  sx={{
                    textTransform:
                      "none",

                    color: GREEN,

                    fontWeight: 600,
                  }}
                >
                  Forgot password?
                </Button>
              </Stack>
            )}

            {/* =================================================
                SUBMIT
            ================================================= */}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              size="large"
              endIcon={
                !loading && (
                  <ArrowForward />
                )
              }
              sx={{
                height: 54,

                borderRadius: 1.5,

                background: GREEN,

                textTransform: "none",

                fontSize: 15,

                fontWeight: 700,

                boxShadow:
                  "0 10px 25px rgba(47,143,91,.25)",

                "&:hover": {
                  background: DARK_GREEN,

                  boxShadow:
                    "0 14px 30px rgba(35,107,67,.30)",
                },
              }}
            >
              {loading ? (
                <CircularProgress
                  size={23}
                  color="inherit"
                />
              ) : isSignup ? (
                "Create Account"
              ) : (
                "Log In"
              )}
            </Button>
          </Box>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              my: 3,
            }}
          >
            <Divider
              sx={{
                flex: 1,
              }}
            />

            <Typography
              variant="caption"
              color="text.disabled"
            >
              OR
            </Typography>

            <Divider
              sx={{
                flex: 1,
              }}
            />
          </Stack>

          {/* =================================================
              SWITCH
          ================================================= */}

          <Stack
            direction="row"
            sx={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {isSignup
                ? "Already have an account?"
                : "Don't have an account?"}
            </Typography>

            <Button
              type="button"
              onClick={switchMode}
              sx={{
                textTransform: "none",

                color: GREEN,

                fontWeight: 700,

                ml: 0.5,
              }}
            >
              {isSignup
                ? "Log In"
                : "Create Account"}
            </Button>
          </Stack>

          {/* =================================================
              SECURITY
          ================================================= */}

          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: "center",
              alignItems: "center",

              mt: 5,
            }}
          >
            <LockOutlined
              sx={{
                fontSize: 15,
                color: "text.disabled",
              }}
            />

            <Typography
              variant="caption"
              color="text.disabled"
            >
              Secure POS Management System
            </Typography>
          </Stack>
        </Box>
      </Paper>

      {/* ===================================================
          SMALL STATUS
      =================================================== */}

      <Box
        sx={{
          position: "absolute",

          bottom: 12,
          right: 20,

          display: {
            xs: "none",
            md: "flex",
          },

          alignItems: "center",

          gap: 1,

          zIndex: 10,
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,

            borderRadius: "50%",

            background: "#4caf50",

            animation:
              `${blink} 2s ease-in-out infinite`,
          }}
        />

        <Typography
          variant="caption"
          sx={{
            color:
              "rgba(255,255,255,.45)",
          }}
        >
          POS System Online
        </Typography>
      </Box>
    </Box>
  );
}
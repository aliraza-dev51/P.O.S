"use client";

import { useEffect, useState } from "react";

import {
  AccessTime,
  Business,
  DeleteOutlined,
  Description,
  Palette,
  Save,
  Settings as SettingsIcon,
  Storefront,
  WarningAmber,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

/* =========================================================
   TYPES
========================================================= */

type Settings = {
  storeName: string;
  phone: string;
  address: string;

  currency: string;
  taxRate: string;

  invoicePrefix: string;
  invoiceFooter: string;

  workStartTime: string;
  workEndTime: string;
  lateAfterMinutes: string;

  compactMode: boolean;
};

/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const defaultSettings: Settings = {
  storeName: "My Store",
  phone: "",
  address: "",

  currency: "PKR",
  taxRate: "0",

  invoicePrefix: "INV-",
  invoiceFooter: "Thank you for shopping with us.",

  workStartTime: "09:00",
  workEndTime: "18:00",
  lateAfterMinutes: "15",

  compactMode: false,
};

/* =========================================================
   PAGE
========================================================= */

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<Settings>(defaultSettings);

  const [saved, setSaved] = useState(false);

  const [loaded, setLoaded] = useState(false);

  /* =======================================================
     LOAD SETTINGS
  ======================================================= */

  useEffect(() => {
    const storedSettings =
      localStorage.getItem("posSettings");

    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(
          storedSettings
        );

        setSettings({
          ...defaultSettings,
          ...parsedSettings,
        });
      } catch (error) {
        console.error(
          "Unable to load settings:",
          error
        );
      }
    }

    setLoaded(true);
  }, []);

  /* =======================================================
     HANDLE CHANGE
  ======================================================= */

  const handleChange = (
    field: keyof Settings,
    value: string | boolean
  ) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
  };

  /* =======================================================
     SAVE SETTINGS
  ======================================================= */

  const saveSettings = () => {
    localStorage.setItem(
      "posSettings",
      JSON.stringify(settings)
    );

    window.dispatchEvent(
      new Event("settingsUpdated")
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  /* =======================================================
     RESET SETTINGS
  ======================================================= */

  const resetSettings = () => {
    const confirmReset = window.confirm(
      "Reset all settings to default?"
    );

    if (!confirmReset) {
      return;
    }

    setSettings({
      ...defaultSettings,
    });

    localStorage.setItem(
      "posSettings",
      JSON.stringify(defaultSettings)
    );

    window.dispatchEvent(
      new Event("settingsUpdated")
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  /* =======================================================
     CLEAR DATA
  ======================================================= */

  const clearData = (
    key: string,
    label: string
  ) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete all ${label} data? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    localStorage.removeItem(key);

    window.dispatchEvent(
      new Event(`${key}Updated`)
    );

    alert(
      `${label} data has been deleted successfully.`
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (!loaded) {
    return null;
  }

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
        maxWidth: 1400,
        mx: "auto",
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
            <SettingsIcon color="primary" />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              Settings
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage your POS, store and
            system preferences
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={saveSettings}
        >
          Save Settings
        </Button>
      </Stack>

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {saved && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
        >
          Settings saved successfully.
        </Alert>
      )}

      <Grid
        container
        spacing={3}
      >
        {/* =================================================
            STORE SETTINGS
        ================================================= */}

        <Grid size={12}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Business color="primary" />

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Store Settings
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Basic information about your
                    store
                  </Typography>
                </Box>
              </Stack>

              <Grid
                container
                spacing={2}
              >
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Store Name"
                    value={settings.storeName}
                    onChange={(event) =>
                      handleChange(
                        "storeName",
                        event.target.value
                      )
                    }
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={settings.phone}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target.value
                      )
                    }
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Store Address"
                    value={settings.address}
                    onChange={(event) =>
                      handleChange(
                        "address",
                        event.target.value
                      )
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* =================================================
            CURRENCY & TAX
        ================================================= */}

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent
              sx={{
                p: 3,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Storefront color="primary" />

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Currency & Tax
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Configure pricing settings
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  select
                  label="Currency"
                  value={settings.currency}
                  onChange={(event) =>
                    handleChange(
                      "currency",
                      event.target.value
                    )
                  }
                >
                  <MenuItem value="PKR">
                    PKR - Pakistani Rupee
                  </MenuItem>

                  <MenuItem value="USD">
                    USD - US Dollar
                  </MenuItem>

                  <MenuItem value="AED">
                    AED - UAE Dirham
                  </MenuItem>

                  <MenuItem value="SAR">
                    SAR - Saudi Riyal
                  </MenuItem>

                  <MenuItem value="GBP">
                    GBP - Pound
                  </MenuItem>

                  <MenuItem value="EUR">
                    EUR - Euro
                  </MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  label="Tax Rate (%)"
                  type="number"
                  value={settings.taxRate}
                  onChange={(event) =>
                    handleChange(
                      "taxRate",
                      event.target.value
                    )
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: 100,
                    },
                  }}
                />

                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  Tax rate will be used when
                  calculating sales totals.
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* =================================================
            INVOICE SETTINGS
        ================================================= */}

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent
              sx={{
                p: 3,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Description color="primary" />

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Invoice Settings
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Customize your invoices
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Invoice Prefix"
                  value={settings.invoicePrefix}
                  onChange={(event) =>
                    handleChange(
                      "invoicePrefix",
                      event.target.value
                    )
                  }
                  helperText="Example: INV-0001"
                />

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Invoice Footer"
                  value={settings.invoiceFooter}
                  onChange={(event) =>
                    handleChange(
                      "invoiceFooter",
                      event.target.value
                    )
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* =================================================
            ATTENDANCE SETTINGS
        ================================================= */}

        <Grid size={12}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent
              sx={{
                p: 3,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <AccessTime color="primary" />

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Attendance Settings
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Employee working hours and
                    late settings
                  </Typography>
                </Box>
              </Stack>

              <Grid
                container
                spacing={2}
              >
                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Work Start Time"
                    type="time"
                    value={settings.workStartTime}
                    onChange={(event) =>
                      handleChange(
                        "workStartTime",
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

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Work End Time"
                    type="time"
                    value={settings.workEndTime}
                    onChange={(event) =>
                      handleChange(
                        "workEndTime",
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

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Late After (Minutes)"
                    type="number"
                    value={settings.lateAfterMinutes}
                    onChange={(event) =>
                      handleChange(
                        "lateAfterMinutes",
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
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* =================================================
            APPEARANCE
        ================================================= */}

        <Grid
          size={{
            xs: 12,
            md: 6,
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
            <CardContent
              sx={{
                p: 3,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Palette color="primary" />

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Appearance
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Customize POS interface
                  </Typography>
                </Box>
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.compactMode}
                    onChange={(event) =>
                      handleChange(
                        "compactMode",
                        event.target.checked
                      )
                    }
                  />
                }
                label={
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Compact Mode
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Use smaller spacing in
                      tables and cards
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* =================================================
            SYSTEM STATUS
        ================================================= */}

        <Grid
          size={{
            xs: 12,
            md: 6,
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
            <CardContent
              sx={{
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                System Status
              </Typography>

              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">
                    Employees
                  </Typography>

                  <Chip
                    size="small"
                    label="Local Storage"
                    color="success"
                    variant="outlined"
                  />
                </Stack>

                <Stack
                  direction="row"
                  sx={{
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">
                    Vendors
                  </Typography>

                  <Chip
                    size="small"
                    label="Local Storage"
                    color="success"
                    variant="outlined"
                  />
                </Stack>

                <Stack
                  direction="row"
                  sx={{
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">
                    Attendance
                  </Typography>

                  <Chip
                    size="small"
                    label="Local Storage"
                    color="success"
                    variant="outlined"
                  />
                </Stack>

                <Stack
                  direction="row"
                  sx={{
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">
                    Settings
                  </Typography>

                  <Chip
                    size="small"
                    label="Local Storage"
                    color="success"
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* =================================================
            DATA MANAGEMENT
        ================================================= */}

        <Grid size={12}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "error.light",
              borderRadius: 3,
            }}
          >
            <CardContent
              sx={{
                p: 3,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <WarningAmber color="error" />

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Data Management
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 3,
                }}
              >
                Be careful when deleting data.
                Deleted local data cannot be
                recovered.
              </Typography>

              <Divider
                sx={{
                  mb: 3,
                }}
              />

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
              >
                {/* CLEAR VENDORS */}

                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteOutlined />}
                  onClick={() =>
                    clearData(
                      "vendors",
                      "vendor"
                    )
                  }
                >
                  Clear Vendors
                </Button>

                {/* CLEAR EMPLOYEES */}

                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteOutlined />}
                  onClick={() =>
                    clearData(
                      "employees",
                      "employee"
                    )
                  }
                >
                  Clear Employees
                </Button>

                {/* CLEAR ATTENDANCE */}

                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteOutlined />}
                  onClick={() =>
                    clearData(
                      "employeeAttendance",
                      "attendance"
                    )
                  }
                >
                  Clear Attendance
                </Button>

                {/* RESET */}

                <Button
                  color="inherit"
                  variant="outlined"
                  onClick={resetSettings}
                >
                  Reset Settings
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =================================================
          BOTTOM SAVE
      ================================================= */}

      <Stack
        direction="row"
        sx={{
          justifyContent: "flex-end",
          mt: 4,
        }}
      >
        <Button
          size="large"
          variant="contained"
          startIcon={<Save />}
          onClick={saveSettings}
        >
          Save Settings
        </Button>
      </Stack>
    </Box>
  );
}
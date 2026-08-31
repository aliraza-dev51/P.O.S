import { createTheme } from "@mui/material/styles";
import { blue, green, orange, red, grey } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      light: blue[300],
      main: blue[600],
      dark: blue[800],
      contrastText: "#fff",
    },

    secondary: {
      light: grey[50],
      main: grey[100],
      dark: grey[200],
      contrastText: blue[600],
    },

    success: {
      light: green[300],
      main: green[600],
      dark: green[800],
      contrastText: "#fff",
    },

    warning: {
      light: orange[300],
      main: orange[600],
      dark: orange[800],
      contrastText: "#fff",
    },

    error: {
      light: red[300],
      main: red[600],
      dark: red[800],
      contrastText: "#fff",
    },

    background: {
      default: "#fafafa",
      paper: "#FaFaFa",
    },

    text: {
      primary: grey[900],
      secondary: grey[600],
    },

    divider: grey[200],
  },

  typography: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",

    h1: {
      fontWeight: 600,
    },

    h2: {
      fontWeight: 600,
    },

    h3: {
      fontWeight: 400 ,
    },

    h4: {
      fontWeight: 400,
    },

    h5: {
      fontWeight: 200,  
    },

    h6: {
      fontWeight: 200,
    },

    body1: {
      fontWeight: 200,
    },

    body2: {
      fontWeight: 200,
    },

    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },

  shape: {
    borderRadius: 4,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          minHeight: 40,
          paddingInline: 16,
          transition: "all 160ms ease",
          "&:hover": {
            boxShadow: "none",
          },
          "&.MuiButton-containedPrimary": {
            boxShadow: "none",
          },
        },
      },
      variants: [
        {
          props: { variant: "contained", color: "secondary" },
          style: {
            color: blue[600],
            backgroundColor: grey[100],
            "&:hover": {
              backgroundColor: grey[200],
            },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid",
          borderColor: grey[200],
          backgroundColor: "#F5F5F5",
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#F5F5F5",
          boxShadow: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          paddingBottom: 12,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "12px 16px 16px",
          gap: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: grey[800],
          backgroundColor: grey[50],
        },
      },
    },
  },
});

export default theme;
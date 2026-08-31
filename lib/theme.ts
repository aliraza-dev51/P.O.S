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
      default: grey[100],
      paper: "#ffffff",
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
    borderRadius: 10,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
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
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
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
    fontFamily: "Inter, sans-serif",

    h1: {
      fontWeight: 700,
    },

    h2: {
      fontWeight: 700,
    },

    h3: {
      fontWeight: 700,
    },

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 600,
    },

    h6: {
      fontWeight: 600,
    },

    body1: {
      fontWeight: 400,
    },

    body2: {
      fontWeight: 400,
    },

    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },

  shape: {
    borderRadius: 10,
  },
});

export default theme;
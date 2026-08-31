"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider, CssBaseline } from "@mui/material";

import { AppQueryClientProvider } from "@/lib/query-client";
import theme from "@/lib/theme";
import GlobalLoadingOverlay from "./GlobalLoadingOverlay";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AppQueryClientProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
          <GlobalLoadingOverlay />
        </ThemeProvider>
      </AppQueryClientProvider>
    </SessionProvider>
  );
}


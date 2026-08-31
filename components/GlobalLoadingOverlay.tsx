"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import CircularProgressWithLabel from "./CircularProgressWithLabel";
import { sidebarColors } from "@/lib/sidebar-colors";

export default function GlobalLoadingOverlay() {
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const isLoading = fetching > 0 || mutating > 0;
  const [colorIndex, setColorIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    setColorIndex(Math.floor(Math.random() * sidebarColors.length));
    setProgress(0);

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(95, 100 * (1 - Math.exp(-elapsed / 3000)));
      setProgress(nextProgress);
    }, 100);

    return () => window.clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: (theme) => theme.zIndex.modal + 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 2.5,
          borderRadius: 2,
          bgcolor: "background.paper",
          boxShadow: 4,
        }}
      >
        <CircularProgressWithLabel
          value={progress}
          color={sidebarColors[colorIndex]}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 700, letterSpacing: 0.2 }}
        >
          Loading
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              display: "inline-block",
              width: "1.5em",
              textAlign: "left",
              "&::after": {
                content: '"..."',
                display: "inline-block",
                overflow: "hidden",
                verticalAlign: "bottom",
                animation: "loadingDots 1.2s steps(4, end) infinite",
                width: "0ch",
              },
              "@keyframes loadingDots": {
                "0%": { width: "0ch" },
                "25%": { width: "1ch" },
                "50%": { width: "2ch" },
                "75%": { width: "3ch" },
                "100%": { width: "0ch" },
              },
            }}
          />
        </Typography>
      </Box>
    </Box>
  );
}

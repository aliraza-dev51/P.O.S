"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import CircularProgressWithLabel from "./CircularProgressWithLabel";
import { sidebarColors } from "@/lib/sidebar-colors";

export default function LoadingScreen({
  label = "Loading",
}: {
  label?: string;
}) {
  const [progress, setProgress] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    setColorIndex(Math.floor(Math.random() * sidebarColors.length));
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min(95, 100 * (1 - Math.exp(-elapsed / 3000))));
    }, 100);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
        <CircularProgressWithLabel value={progress} color={sidebarColors[colorIndex]} />
        <Typography sx={{ fontWeight: 700 }} color="text.secondary">
          {label}...
        </Typography>
      </Box>
    </Box>
  );
}

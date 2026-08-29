"use client";

import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";

interface BrandLogoProps {
  /**
   * Height of the logo in pixels
   * @default 48
   */
  height?: number;
  /**
   * Width of the logo (auto-calculated from height if not provided)
   */
  width?: number;
  /**
   * Whether to show the full branding (mark + text) or just the mark
   * @default false (shows full branding in dark mode, mark-only in light mode)
   */
  variant?: "mark-only" | "full" | "auto";
  /**
   * Custom alt text
   * @default "VPOS Logo"
   */
  alt?: string;
}

/**
 * Theme-aware brand logo component.
 * Automatically switches between light and dark logos based on MUI theme mode.
 *
 * Usage:
 * - Light mode: Shows logo-light (mark only)
 * - Dark mode: Shows logo-dark (mark + text)
 */
export default function BrandLogo({
  height = 48,
  width,
  variant = "auto",
  alt = "VPOS Logo",
}: BrandLogoProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Determine which logo to use
  let logoPath: string;
  let calculatedWidth: number;

  if (variant === "mark-only") {
    logoPath = "/branding/logo-light.svg";
    calculatedWidth = width || height;
  } else if (variant === "full") {
    logoPath = "/branding/logo-dark.svg";
    calculatedWidth = width || Math.round(height * 3.27); // Approximate aspect ratio for full branding
  } else {
    // Auto mode (default)
    if (isDarkMode) {
      logoPath = "/branding/logo-dark.svg";
      calculatedWidth = width || Math.round(height * 3.27); // Full branding in dark mode
    } else {
      logoPath = "/branding/logo-light.svg";
      calculatedWidth = width || height; // Mark-only in light mode
    }
  }

  return (
    <Box
      component="img"
      src={logoPath}
      alt={alt}
      sx={{
        height: `${height}px`,
        width: `${calculatedWidth}px`,
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}

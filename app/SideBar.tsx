"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Tooltip from "@mui/material/Tooltip";

import BrandLogo from "@/components/BrandLogo";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

import {
  CreditScore,
  InsertChart,
  LocalGroceryStore,
  LocalShipping,
  Badge,
  AttachMoney,
  CurrencyExchange,
} from "@mui/icons-material";

const drawerWidth = 72;

/* =========================================================
   TOP USER ITEM
========================================================= */

const primaryItems = [
  {
    label: "User",
    href: "/user",
    icon: <PersonRoundedIcon />,
    color: "#2563eb",
  },
];

/* =========================================================
   MAIN NAVIGATION
========================================================= */

const secondaryItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <InsertChart />,
    color: "#2563eb",
  },
  {
    label: "Sale",
    href: "/sale",
    icon: <AttachMoney />,
    color: "#16a34a",
  },
  {
    label: "Grocery",
    href: "/grocery",
    icon: <LocalGroceryStore />,
    color: "#f59e0b",
  },
  {
    label: "Credit",
    href: "/credit",
    icon: <CreditScore />,
    color: "#7c3aed",
  },
  {
    label: "Invest",
    href: "/invest",
    icon: <CurrencyExchange />,
    color: "#db2777",
  },
  {
    label: "Vendors",
    href: "/vendors",
    icon: <LocalShipping />,
    color: "#ea580c",
  },
  {
    label: "Employees",
    href: "/employees",
    icon: <Badge />,
    color: "#0891b2",
  },
];

/* =========================================================
   SETTINGS
========================================================= */

const settingsItem = {
  label: "Setting",
  href: "/setting",
  icon: <SettingsRoundedIcon />,
  color: "#64748b",
};

/* =========================================================
   TYPES
========================================================= */

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  color?: string;
};

/* =========================================================
   NAVIGATION ITEM
========================================================= */

function NavigationItem({
  item,
  onNavigate,
}: {
  item: SidebarItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" &&
      pathname.startsWith(`${item.href}/`));

  return (
    <Tooltip
      title={item.label}
      placement="right"
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: item.color || "#1e293b",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 500,
          },
        },
      }}
    >
      <ListItemButton
        component={Link}
        href={item.href}
        selected={isActive}
        onClick={onNavigate}
        sx={{
          mx: 1,
          my: 0.75,
          minHeight: 48,
          borderRadius: 2,
          justifyContent: "center",

          transition: "all 0.2s ease",

          "&:hover": {
            bgcolor: item.color
              ? `${item.color}12`
              : "action.hover",
          },

          "&.Mui-selected": {
            bgcolor: item.color
              ? `${item.color}18`
              : "action.selected",
          },

          "&.Mui-selected:hover": {
            bgcolor: item.color
              ? `${item.color}25`
              : "action.selected",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            color: item.color || "inherit",
            justifyContent: "center",
          }}
        >
          {item.icon}
        </ListItemIcon>
      </ListItemButton>
    </Tooltip>
  );
}

/* =========================================================
   SIDEBAR CONTENT
========================================================= */

function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
        py: 1,
      }}
    >
      {/* Logo */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 1.5,
          px: 1,
        }}
      >
        <BrandLogo height={48} variant="mark-only" />
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* User */}

      <List disablePadding>
        {primaryItems.map((item) => (
          <NavigationItem
            key={item.href}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Main Navigation */}

      <List disablePadding>
        {secondaryItems.map((item) => (
          <NavigationItem
            key={item.href}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
      </List>

      {/* Settings */}

      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ mb: 1 }} />

        <List disablePadding>
          <NavigationItem
            item={settingsItem}
            onNavigate={onNavigate}
          />
        </List>
      </Box>
    </Box>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

export default function SideBar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const paperSx = {
    boxSizing: "border-box",
    width: drawerWidth,
    borderRight: 1,
    borderColor: "divider",
  };

  return (
    <>
      {/* =================================================
          MOBILE MENU BUTTON
      ================================================= */}

      <IconButton
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        sx={{
          display: {
            xs: "inline-flex",
            sm: "none",
          },

          position: "fixed",
          top: 8,
          left: 8,

          zIndex: (theme) => theme.zIndex.drawer + 1,

          bgcolor: "background.paper",

          boxShadow: 1,

          "&:hover": {
            bgcolor: "background.paper",
          },
        }}
      >
        <MenuRoundedIcon />
      </IconButton>

      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",
            sm: "block",
          },

          "& .MuiDrawer-paper": paperSx,
        }}
        open
      >
        <SidebarContent />
      </Drawer>

      {/* =================================================
          MOBILE SIDEBAR
      ================================================= */}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            sm: "none",
          },

          "& .MuiDrawer-paper": paperSx,
        }}
      >
        <SidebarContent
          onNavigate={() => setMobileOpen(false)}
        />
      </Drawer>
    </>
  );
}
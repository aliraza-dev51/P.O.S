"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { sidebarColors } from "@/lib/sidebar-colors";

import {
  CreditScore,
  InsertChart,
  LocalGroceryStore,
  LocalShipping,
  Badge,
  CurrencyExchange,
} from "@mui/icons-material";

const collapsedWidth = 72;
const expandedWidth = 240;

/* =========================================================
   TOP USER ITEM
========================================================= */

const primaryItems = [

  {
    label: "user",
    href: "/user",
    icon: <AccountCircleIcon fontSize="large" />,
    color: sidebarColors[0],
  }
];

/* =========================================================
   MAIN NAVIGATION
========================================================= */
const secondaryItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <InsertChart />,
    color: sidebarColors[0],
  },
  {
    label: "Sale",
    href: "/sale",
    icon: <MonetizationOnIcon />,
    color: sidebarColors[1],
  },
  {
    label: "Grocery",
    href: "/grocery",
    icon: <LocalGroceryStore />,
    color: sidebarColors[2],
  },
  {
    label: "Credit",
    href: "/credit",
    icon: <CreditScore />,
    color: sidebarColors[3],
  },
  {
    label: "Invest",
    href: "/invest",
    icon: <CurrencyExchange />,
    color: sidebarColors[4],
  },
  {
    label: "Vendors",
    href: "/vendors",
    icon: <LocalShipping />,
    color: sidebarColors[5],
  },
  {
    label: "Employees",
    href: "/employees",
    icon: <Badge />,
    color: sidebarColors[6],
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
  expanded,
}: {
  item: SidebarItem;
  onNavigate?: () => void;
  expanded: boolean;
}) {
  const pathname = usePathname();

  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" &&
      pathname.startsWith(`${item.href}/`));

  return (
    <Tooltip
      title={expanded ? "" : item.label}
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
          justifyContent: expanded ? "flex-start" : "center",
          px: expanded ? 1.5 : 1,

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
            minWidth: expanded ? 38 : 0,
            color: item.color || "inherit",
            justifyContent: "center",
          }}
        >
          {item.icon}
        </ListItemIcon>
        {expanded && (
          <ListItemText
            primary={
              <Typography noWrap sx={{ fontSize: 14, fontWeight: 600 }}>
                {item.label}
              </Typography>
              
            }
          />
        )}
      </ListItemButton>
    </Tooltip>
  );
}

/* =========================================================
   SIDEBAR CONTENT
========================================================= */

function SidebarContent({
  onNavigate,
  expanded,
  userName,
}: {
  onNavigate?: () => void;
  expanded: boolean;
  userName: string;
}) {
  const userItem = { ...primaryItems[0], label: userName || "User" };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
        py: 1,
      }}
    >
      {/* Top User Item */}

      <List disablePadding>
        <NavigationItem
          item={userItem}
          onNavigate={onNavigate}
          expanded={expanded}
        />
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Main Navigation */}

      <List disablePadding>
        {secondaryItems.map((item) => (
          <NavigationItem
            key={item.href}
            item={item}
            onNavigate={onNavigate}
            expanded={expanded}
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
            expanded={expanded}
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
  const [desktopExpanded, setDesktopExpanded] = React.useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name?.trim() || "User";

  const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/sale": "Sales summary",
    "/grocery": "Grocery",
    "/credit": "Credit",
    "/invest": "Investment",
    "/vendors": "Vendors",
    "/employees": "Employees",
    "/user": "My Profile",
    "/setting": "Settings",
  };

  const pageTitle =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(
      ([href]) => href !== "/dashboard" && pathname.startsWith(`${href}/`)
    )?.[1] ||
    "VPOS";
  const pageItem = [
    ...primaryItems,
    ...secondaryItems,
    settingsItem,
  ].find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
  );

  React.useEffect(() => {
    if (window.innerWidth < 600) {
      setDesktopExpanded(false);
    }
  }
, []);

  const paperSx = (expanded: boolean) => ({
    boxSizing: "border-box",
    width: expanded ? expandedWidth : collapsedWidth,
    top: 64,
    height: "calc(100% - 64px)",
    borderRight: 1,
    borderColor: "divider",
    transition: "width 0.2s ease",
    overflowX: "hidden",
  });

  return (
    <>
      <AppBar
        position="fixed"
        elevation={4}
        sx={{
          bgcolor: "primary.main",
          color: "common.white",
          zIndex: (theme) => theme.zIndex.drawer + 2,
          boxShadow: "0 3px 10px rgba(15, 23, 42, 0.24)",
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important", px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="Toggle navigation"
            onClick={() => {
              if (window.innerWidth < 600) {
                setMobileOpen(true);
              } else {
                setDesktopExpanded((current) => !current);
              }
            }}
            sx={{ mr: 2 }}
          >
            {desktopExpanded ? <MenuOpenRoundedIcon /> : <MenuRoundedIcon />}
          </IconButton>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "common.white",
              mr: 1,
              "& svg": {
                fontSize: pageItem?.href === "/user" ? 34 : 28,
              },
            }}
          >
            {pageItem?.icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {pageTitle}
          </Typography>
        </Toolbar>
      </AppBar>

      <Toolbar sx={{ minHeight: "64px !important" }} />

      {desktopExpanded && (
        <Box
          aria-hidden="true"
          sx={{
            position: "fixed",
            inset: "64px 0 0",
            zIndex: (theme) => theme.zIndex.drawer - 1,
            bgcolor: "rgba(15, 23, 42, 0.12)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            pointerEvents: "none",
          }}
        />
      )}

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: desktopExpanded ? expandedWidth : collapsedWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": paperSx(desktopExpanded),
        }}
        open
      >
        <SidebarContent
          expanded={desktopExpanded}
          onNavigate={() => setDesktopExpanded(false)}
          userName={userName}
        />
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

          "& .MuiBackdrop-root": {
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            bgcolor: "rgba(15, 23, 42, 0.12)",
          },

          "& .MuiDrawer-paper": paperSx(true),
        }}
      >
        <SidebarContent
          expanded
          onNavigate={() => setMobileOpen(false)}
          userName={userName}
        />
      </Drawer>
    </>
  );
}
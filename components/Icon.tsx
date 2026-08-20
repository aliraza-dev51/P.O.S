"use client";

import type { ElementType } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import NorthRoundedIcon from "@mui/icons-material/NorthRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SouthRoundedIcon from "@mui/icons-material/SouthRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import TagRoundedIcon from "@mui/icons-material/TagRounded";

const icons: Record<string, ElementType<SvgIconProps>> = {
  key: KeyRoundedIcon,
  user: PersonRoundedIcon,
  hashtag: TagRoundedIcon,
  calendar: CalendarMonthRoundedIcon,
  check: CheckRoundedIcon,
  down: SouthRoundedIcon,
  up: NorthRoundedIcon,
  arrowRight: EastRoundedIcon,
  asterisk: StarRoundedIcon,
  search: SearchRoundedIcon,
  add: AddRoundedIcon,
  refresh: RefreshRoundedIcon,
  xmark: CloseRoundedIcon,
  moneybill: PaymentsRoundedIcon,
  list: FormatListBulletedRoundedIcon,
  creditcard: CreditCardRoundedIcon,
  circleinfo: InfoRoundedIcon,
  circlequestion: HelpRoundedIcon,
  circlechevronright: ChevronRightRoundedIcon,
  chevrondown: KeyboardArrowDownRoundedIcon,
  chevronup: KeyboardArrowUpRoundedIcon,
};

function legacySx(prop: string) {
  const fontSize = prop.includes("h-1.5")
    ? 6
    : prop.includes("h-4")
      ? 16
      : prop.includes("h-3.5")
        ? 14
        : 20;

  return {
    fontSize,
    flexShrink: 0,
    color: prop.includes("text-zinc-500") ? "grey.500" : "inherit",
    ...(prop.includes("animate-spin") && {
      animation: "mui-icon-spin 1s linear infinite",
      "@keyframes mui-icon-spin": {
        from: { transform: "rotate(0deg)" },
        to: { transform: "rotate(360deg)" },
      },
    }),
  };
}

/**
 * Backwards-compatible icon adapter. `prop` and `viewbox` are retained for
 * existing callers; the former is translated from the legacy sizing tokens to
 * MUI `sx` values, while MUI owns each icon's viewBox.
 */
export default function Icon({
  name,
  prop = "h-3.5",
  viewbox = "0 0 512 512",
}: {
  name: string;
  prop?: string;
  viewbox?: string;
}) {
  void viewbox;
  const IconComponent = icons[name] ?? HelpOutlineRoundedIcon;

  return <IconComponent aria-hidden="true" focusable="false" sx={legacySx(prop)} />;
}

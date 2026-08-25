"use client"

import type { ComponentType } from "react"
import type { SvgIconProps } from "@mui/material/SvgIcon"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import ArrowCircleRightRoundedIcon from "@mui/icons-material/ArrowCircleRightRounded"
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded"
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded"
import EmergencyRoundedIcon from "@mui/icons-material/EmergencyRounded"
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded"
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded"
import HelpRoundedIcon from "@mui/icons-material/HelpRounded"
import InfoRoundedIcon from "@mui/icons-material/InfoRounded"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded"
import NorthRoundedIcon from "@mui/icons-material/NorthRounded"
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded"
import PersonRoundedIcon from "@mui/icons-material/PersonRounded"
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import SouthRoundedIcon from "@mui/icons-material/SouthRounded"
import TagRoundedIcon from "@mui/icons-material/TagRounded"
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded"

const icons: Record<string, ComponentType<SvgIconProps>> = {
  key: VpnKeyRoundedIcon,
  user: PersonRoundedIcon,
  hashtag: TagRoundedIcon,
  calendar: CalendarTodayRoundedIcon,
  check: CheckRoundedIcon,
  down: SouthRoundedIcon,
  up: NorthRoundedIcon,
  arrowRight: ArrowForwardRoundedIcon,
  asterisk: EmergencyRoundedIcon,
  search: SearchRoundedIcon,
  add: AddRoundedIcon,
  refresh: RefreshRoundedIcon,
  xmark: CloseRoundedIcon,
  moneybill: PaymentsRoundedIcon,
  list: FormatListBulletedRoundedIcon,
  creditcard: CreditCardRoundedIcon,
  circleinfo: InfoRoundedIcon,
  circlequestion: HelpRoundedIcon,
  circlechevronright: ArrowCircleRightRoundedIcon,
  chevrondown: KeyboardArrowDownRoundedIcon,
  chevronup: KeyboardArrowUpRoundedIcon,
}

function iconSize(iconProp?: string) {
  const match = iconProp?.match(/(?:^|\s)h-(\d+(?:\.\d+)?)(?:\s|$)/)

  return match ? Number(match[1]) * 4 : 16
}

type SidebarFieldIconProps = {
  name: string
  iconProp?: string
  viewBox?: string
}

/**
 * Compatibility adapter for the legacy icon props. The visual icon is now
 * supplied by MUI instead of relying on Tailwind classes or custom SVG markup.
 */
export default function SidebarFieldIcon({ name, iconProp }: SidebarFieldIconProps) {
  const IconComponent = icons[name] ?? HelpOutlineRoundedIcon

  return <IconComponent aria-hidden="true" sx={{ display: "block", fontSize: iconSize(iconProp) }} />
}

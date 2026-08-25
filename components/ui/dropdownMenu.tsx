"use client"
import * as React from "react"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import MenuList from "@mui/material/MenuList"
import Divider from "@mui/material/Divider"
import ListSubheader from "@mui/material/ListSubheader"
import Checkbox from "@mui/material/Checkbox"

type MenuContextValue = { anchorEl: HTMLElement | null; setAnchorEl: (element: HTMLElement | null) => void }
const MenuContext = React.createContext<MenuContextValue | null>(null)
const useMenu = () => { const context = React.useContext(MenuContext); if (!context) throw new Error("DropdownMenu components must be nested inside DropdownMenu"); return context }
export function DropdownMenu({ children }: { children: React.ReactNode }) { const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null); return <MenuContext.Provider value={{ anchorEl, setAnchorEl }}>{children}</MenuContext.Provider> }
export function DropdownMenuTrigger({ children }: { children: React.ReactElement; asChild?: boolean }) { const { setAnchorEl } = useMenu(); return React.cloneElement(children, { onClick: (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget) }) }
export function DropdownMenuContent({ children, ...props }: { children: React.ReactNode; align?: "start" | "end"; side?: string; sideOffset?: number; className?: string }) { const { anchorEl, setAnchorEl } = useMenu(); return <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} {...props}><MenuList>{children}</MenuList></Menu> }
export const DropdownMenuItem = (props: React.ComponentProps<typeof MenuItem>) => <MenuItem {...props} />
export const DropdownMenuCheckboxItem = ({ checked, onCheckedChange, children, ...props }: React.ComponentProps<typeof MenuItem> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }) => <MenuItem onClick={() => onCheckedChange?.(!checked)} {...props}><Checkbox checked={checked} size="small" />{children}</MenuItem>
export const DropdownMenuRadioItem = DropdownMenuItem
export const DropdownMenuLabel = (props: React.ComponentProps<typeof ListSubheader>) => <ListSubheader {...props} />
export const DropdownMenuSeparator = Divider
export const DropdownMenuShortcut = (props: React.ComponentProps<"span">) => <span {...props} />
export const DropdownMenuGroup = React.Fragment
export const DropdownMenuPortal = React.Fragment
export const DropdownMenuSub = DropdownMenu
export const DropdownMenuSubContent = DropdownMenuContent
export const DropdownMenuSubTrigger = DropdownMenuItem
export const DropdownMenuRadioGroup = React.Fragment

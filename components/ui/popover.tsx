"use client"
import * as React from "react"
import MuiPopover, { PopoverProps } from "@mui/material/Popover"

type PopoverContextValue = { anchorEl: HTMLElement | null; setAnchorEl: (element: HTMLElement | null) => void }
const PopoverContext = React.createContext<PopoverContextValue | null>(null)
const usePopover = () => { const context = React.useContext(PopoverContext); if (!context) throw new Error("Popover components must be nested inside Popover"); return context }
export function Popover({ children }: { children: React.ReactNode }) { const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null); return <PopoverContext.Provider value={{ anchorEl, setAnchorEl }}>{children}</PopoverContext.Provider> }
export function PopoverTrigger({ children }: { children: React.ReactElement }) { const { setAnchorEl } = usePopover(); return React.cloneElement(children, { onClick: (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget) }) }
export function PopoverClose({ children }: { children: React.ReactElement }) { const { setAnchorEl } = usePopover(); return React.cloneElement(children, { onClick: () => setAnchorEl(null) }) }
export function PopoverContent({ children, ...props }: Omit<PopoverProps, "open" | "anchorEl" | "onClose" | "children"> & { children: React.ReactNode }) { const { anchorEl, setAnchorEl } = usePopover(); return <MuiPopover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} {...props}>{children}</MuiPopover> }

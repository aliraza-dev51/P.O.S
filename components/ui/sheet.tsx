"use client"
import * as React from "react"
import Drawer, { DrawerProps } from "@mui/material/Drawer"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

type SheetContextValue = { open: boolean; setOpen: (open: boolean) => void; position: DrawerProps["anchor"] }
const SheetContext = React.createContext<SheetContextValue | null>(null)
const useSheet = () => { const context = React.useContext(SheetContext); if (!context) throw new Error("Sheet components must be nested inside Sheet"); return context }
export function Sheet({ children, open: controlledOpen, onOpenChange, position = "right" }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; position?: DrawerProps["anchor"] }) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = (next: boolean) => { if (controlledOpen === undefined) setUncontrolledOpen(next); onOpenChange?.(next) }
  return <SheetContext.Provider value={{ open, setOpen, position }}>{children}</SheetContext.Provider>
}
export function SheetTrigger({ children }: { children: React.ReactElement }) { const { setOpen } = useSheet(); return React.cloneElement(children, { onClick: () => setOpen(true) }) }
export function SheetClose({ children }: { children: React.ReactElement }) { const { setOpen } = useSheet(); return React.cloneElement(children, { onClick: () => setOpen(false) }) }
export function SheetContent({ children, position, ...props }: { children: React.ReactNode; position?: DrawerProps["anchor"] } & Omit<DrawerProps, "open" | "onClose" | "anchor">) { const sheet = useSheet(); return <Drawer anchor={position ?? sheet.position} open={sheet.open} onClose={() => sheet.setOpen(false)} {...props}><Box sx={{ p: 3, minWidth: 280 }}>{children}</Box></Drawer> }
export const SheetHeader = (props: React.ComponentProps<typeof Box>) => <Box sx={{ mb: 2 }} {...props} />
export const SheetFooter = (props: React.ComponentProps<typeof Box>) => <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }} {...props} />
export const SheetTitle = (props: React.ComponentProps<typeof Typography>) => <Typography variant="h6" {...props} />
export const SheetDescription = (props: React.ComponentProps<typeof Typography>) => <Typography variant="body2" color="text.secondary" {...props} />

"use client"
import * as React from "react"
import MuiSelect, { SelectProps } from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"

export const Select = ({ children, ...props }: SelectProps) => <FormControl size="small" fullWidth><MuiSelect {...props}>{children}</MuiSelect></FormControl>
export const SelectGroup = React.Fragment
export const SelectValue = ({ placeholder }: { placeholder?: React.ReactNode }) => <>{placeholder}</>
export const SelectTrigger = ({ children }: { children?: React.ReactNode; className?: string }) => <>{children}</>
export const SelectContent = ({ children }: { children: React.ReactNode; className?: string; side?: string }) => <>{children}</>
export const SelectLabel = ({ children }: { children: React.ReactNode; className?: string }) => <>{children}</>
export const SelectItem = ({ children, value, ...props }: React.ComponentProps<typeof MenuItem> & { value: string }) => <MenuItem value={value} {...props}>{children}</MenuItem>
export const SelectSeparator = () => null

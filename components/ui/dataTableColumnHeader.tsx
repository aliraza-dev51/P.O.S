"use client"
import { Column } from "@tanstack/react-table"
import Button from "@mui/material/Button"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import SortIcon from "@mui/icons-material/Sort"
import * as React from "react"
export function DataTableColumnHeader<TData, TValue>({ column, title }: { column: Column<TData, TValue>; title: string }) { const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null); if (!column.getCanSort()) return <>{title}</>; return <><Button size="small" endIcon={<SortIcon />} onClick={event => setAnchorEl(event.currentTarget)}>{title}</Button><Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}><MenuItem onClick={() => column.toggleSorting(false)}>Ascending</MenuItem><MenuItem onClick={() => column.toggleSorting(true)}>Descending</MenuItem><MenuItem onClick={() => column.toggleVisibility(false)}>Hide</MenuItem></Menu></> }

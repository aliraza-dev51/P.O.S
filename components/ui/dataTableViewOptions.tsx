"use client"
import { Table } from "@tanstack/react-table"
import Button from "@mui/material/Button"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Checkbox from "@mui/material/Checkbox"
import ViewColumnIcon from "@mui/icons-material/ViewColumn"
import * as React from "react"
export function DataTableViewOptions<TData>({ table }: { table: Table<TData> }) { const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null); const columns = table.getAllColumns().filter(column => column.getCanHide()); return <><Button variant="outlined" size="small" startIcon={<ViewColumnIcon />} onClick={event => setAnchorEl(event.currentTarget)}>View</Button><Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>{columns.map(column => <MenuItem key={column.id} onClick={() => column.toggleVisibility(!column.getIsVisible())}><Checkbox checked={column.getIsVisible()} />{column.id}</MenuItem>)}</Menu></> }

"use client"
import * as React from "react"
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TextField from "@mui/material/TextField"
import { DataTablePagination } from "./dataTablePagination"
import { DataTableViewOptions } from "./dataTableViewOptions"

export function DataTable<TData, TValue>({ columns, data }: { columns: ColumnDef<TData, TValue>[]; data: TData[] }) {
  const [globalFilter, setGlobalFilter] = React.useState("")
  const table = useReactTable({ data, columns, state: { globalFilter }, onGlobalFilterChange: setGlobalFilter, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel() })
  return <Box><Box sx={{ display: "flex", gap: 2, mb: 2 }}><TextField size="small" label="Search" value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} /><Box sx={{ ml: "auto" }}><DataTableViewOptions table={table} /></Box></Box><Paper variant="outlined"><Table><TableHead>{table.getHeaderGroups().map(group => <TableRow key={group.id}>{group.headers.map(header => <TableCell component="th" key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableCell>)}</TableRow>)}</TableHead><TableBody>{table.getRowModel().rows.map(row => <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)}</TableBody></Table></Paper><DataTablePagination table={table} /></Box>
}

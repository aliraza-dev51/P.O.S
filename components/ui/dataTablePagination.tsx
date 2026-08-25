"use client"
import { Table } from "@tanstack/react-table"
import TablePagination from "@mui/material/TablePagination"
export function DataTablePagination<TData>({ table }: { table: Table<TData> }) { return <TablePagination component="div" count={table.getFilteredRowModel().rows.length} page={table.getState().pagination.pageIndex} onPageChange={(_, page) => table.setPageIndex(page)} rowsPerPage={table.getState().pagination.pageSize} onRowsPerPageChange={(event) => table.setPageSize(Number(event.target.value))} rowsPerPageOptions={[10, 20, 30, 40, 50]} /> }

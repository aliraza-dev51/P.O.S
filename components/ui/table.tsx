import * as React from "react"
import MuiTable from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableFooter from "@mui/material/TableFooter"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"

export const Table = ({ children, ...props }: React.ComponentProps<typeof MuiTable>) => <TableContainer><MuiTable {...props}>{children}</MuiTable></TableContainer>
export { TableBody, TableCell, TableFooter, TableHead, TableRow }
export const TableCaption = (props: React.ComponentProps<"caption">) => <caption {...props} />
export const TableHeader = TableHead
export default Table

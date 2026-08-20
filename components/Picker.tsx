"use client";

import { useMemo, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Radio from "@mui/material/Radio";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

type PickerProps = {
  columnName: string;
  data: any;
  loading: boolean;
  handlePickerClick: any;
  handleEditOrder: any;
  required?: boolean;
};

export default function Picker({
  columnName,
  data,
  loading,
  handlePickerClick,
  handleEditOrder,
  required = false,
}: PickerProps) {
  const [pickedData, setPickedData] = useState<any>({});
  const [query, setQuery] = useState("");
  const hasSelection = Object.keys(pickedData).length > 0;

  const visibleRows = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return rows;

    return rows.filter((row: any) =>
      [row?.id, row?.name, row?.phone]
        .filter((value) => value !== undefined && value !== null)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [data, query]);

  const closePicker = () => handlePickerClick("");

  return (
    <Dialog
      open
      onClose={closePicker}
      fullWidth
      maxWidth="md"
      aria-labelledby="picker-title"
      slotProps={{ paper: { sx: { minHeight: { md: 600 } } } }}
    >
      <DialogTitle id="picker-title" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography component="span" variant="h6" sx={{ flexGrow: 1 }}>
          Select <Box component="span" sx={{ fontWeight: 700 }}>{columnName}</Box> records
        </Typography>
        <IconButton aria-label="Close picker" onClick={closePicker}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
        />

        {loading ? (
          <Box sx={{ minHeight: 192, display: "grid", placeItems: "center" }}>
            <CircularProgress aria-label="Loading records" />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 360, border: 1, borderColor: "divider", borderRadius: 1 }}>
            <Table size="small" stickyHeader aria-label={`${columnName} records`}>
              <TableBody>
                {visibleRows.map((row: any, index: number) => (
                  <TableRow
                    hover
                    key={row?.id ?? index}
                    selected={hasSelection && pickedData.id === row?.id}
                    sx={{ cursor: "pointer" }}
                    onClick={() => setPickedData(row)}
                  >
                    <TableCell padding="checkbox">
                      <Radio
                        checked={hasSelection && pickedData.id === row?.id}
                        onChange={() => setPickedData(row)}
                        value={row?.id ?? index}
                        name={columnName}
                        slotProps={{
                          input: {
                            "aria-label": `Select ${row?.name ?? row?.id ?? "record"}`,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: 72 }}>{row?.id ?? "—"}</TableCell>
                    <TableCell>{row?.name ?? "—"}</TableCell>
                    <TableCell sx={{ width: 160 }}>{row?.phone || "N/A"}</TableCell>
                  </TableRow>
                ))}
                {visibleRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 5, color: "text.secondary" }}>
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {!required && (
          <Button color="inherit" onClick={() => setPickedData({})}>
            Clear selection
          </Button>
        )}
        <Button
          variant="contained"
          onClick={() => {
            handleEditOrder(columnName, pickedData);
            closePicker();
          }}
          disabled={required && !hasSelection}
        >
          Set selection
        </Button>
      </DialogActions>
    </Dialog>
  );
}

"use client"
import * as React from "react"
import dayjs, { Dayjs } from "dayjs"
import Stack from "@mui/material/Stack"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"

export type DateRange = { from?: Date; to?: Date }
export function DatePickerWithRange({ className, setParentDate }: { className?: string; setParentDate: React.Dispatch<React.SetStateAction<DateRange | undefined>> }) {
  const [from, setFrom] = React.useState<Dayjs | null>(dayjs().subtract(7, "day"))
  const [to, setTo] = React.useState<Dayjs | null>(dayjs())
  React.useEffect(() => { if (!from) return; setParentDate({ from: from.startOf("day").toDate(), to: (to ?? from).endOf("day").toDate() }) }, [from, to, setParentDate])
  return <LocalizationProvider dateAdapter={AdapterDayjs}><Stack className={className} direction={{ xs: "column", sm: "row" }} spacing={2}><DatePicker label="From" value={from} onChange={setFrom} /><DatePicker label="To" value={to} minDate={from ?? undefined} onChange={setTo} /></Stack></LocalizationProvider>
}

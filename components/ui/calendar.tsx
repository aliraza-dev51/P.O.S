"use client";

import * as React from "react"
import dayjs, { Dayjs } from "dayjs"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker"

export type CalendarProps = Omit<DatePickerProps, "value" | "onChange"> & { value?: Dayjs | null; onChange?: (value: Dayjs | null) => void }

export function Calendar({ value, onChange, label = "Select date", ...props }: CalendarProps) {
  const [internalValue, setInternalValue] = React.useState<Dayjs | null>(value ?? dayjs())
  const selectedValue = value === undefined ? internalValue : value
  return <LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label={label} value={selectedValue} onChange={(nextValue) => { if (value === undefined) setInternalValue(nextValue); onChange?.(nextValue) }} {...props} /></LocalizationProvider>
}

export default Calendar

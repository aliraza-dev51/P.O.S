"use client"
import * as React from "react"
import TextField, { TextFieldProps } from "@mui/material/TextField"

export type InputProps = Omit<TextFieldProps, "variant"> & { type?: React.HTMLInputTypeAttribute }
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ type, ...props }, ref) => <TextField inputRef={ref} type={type} variant="outlined" size="small" fullWidth {...props} />)
Input.displayName = "Input"
export default Input

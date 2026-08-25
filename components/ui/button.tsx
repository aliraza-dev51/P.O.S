"use client"

import * as React from "react"
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button"

export type ButtonProps = Omit<MuiButtonProps, "variant" | "size"> & {
  variant?: MuiButtonProps["variant"] | "ghost" | "link"
  size?: MuiButtonProps["size"] | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "contained", size = "medium", ...props }, ref) => (
    <MuiButton ref={ref} variant={variant === "ghost" || variant === "link" ? "text" : variant} size={size === "icon" ? "small" : size} {...props} />
  )
)
Button.displayName = "Button"

export default Button

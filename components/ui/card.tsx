import * as React from "react"
import MuiCard, { CardProps } from "@mui/material/Card"
import MuiCardContent from "@mui/material/CardContent"
import MuiCardHeader from "@mui/material/CardHeader"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"

export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => <MuiCard ref={ref} {...props} />)
Card.displayName = "Card"
export const CardContent = MuiCardContent
export const CardHeader = MuiCardHeader
export const CardTitle = (props: React.ComponentProps<typeof Typography>) => <Typography variant="h6" {...props} />
export const CardDescription = (props: React.ComponentProps<typeof Typography>) => <Typography variant="body2" color="text.secondary" {...props} />
export const CardFooter = (props: React.ComponentProps<typeof Box>) => <Box sx={{ px: 2, pb: 2, display: "flex", alignItems: "center" }} {...props} />
export default Card

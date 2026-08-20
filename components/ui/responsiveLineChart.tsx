"use client"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"

export function ResponsiveLineChart({ data, value }: { data: Record<string, unknown>[]; value: string }) {
  const values = data.map((item) => Number(item[value]) || 0)
  const max = Math.max(...values, 1)
  const points = values.map((point, index) => {
    const x = values.length <= 1 ? 50 : (index / (values.length - 1)) * 100
    const y = 92 - (point / max) * 84
    return `${x},${y}`
  }).join(" ")

  return <Paper variant="outlined" sx={{ p: 2 }}>
    <Typography variant="subtitle2" sx={{ mb: 1 }}>{value}</Typography>
    {data.length ? <Box component="svg" viewBox="0 0 100 100" preserveAspectRatio="none" sx={{ width: "100%", height: 320, display: "block", color: "primary.main" }}>
      <line x1="0" y1="92" x2="100" y2="92" stroke="currentColor" opacity=".2" vectorEffect="non-scaling-stroke" />
      <polyline fill="none" points={points} stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </Box> : <Typography color="text.secondary">No chart data available.</Typography>}
  </Paper>
}

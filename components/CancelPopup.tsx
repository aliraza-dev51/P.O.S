"use client";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";

export default function CancelPopup({
  text,
  noCancel,
  yesCancel,
}: {
  text: string;
  noCancel: any;
  yesCancel: any;
}) {
  return (
    <Dialog
      open
      onClose={noCancel}
      aria-labelledby="cancel-popup-description"
      fullWidth
      maxWidth="xs"
    >
      <DialogContent sx={{ minHeight: 120, display: "flex", alignItems: "center" }}>
        <Typography id="cancel-popup-description" variant="h6" component="p">
          {text}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: "divider" }}>
        <Button onClick={noCancel} color="inherit">
          No
        </Button>
        <Button onClick={yesCancel} color="error" variant="contained">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

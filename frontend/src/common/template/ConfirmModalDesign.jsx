import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";
import { useEffect, useRef } from "react";

function ConfirmationDialog({ open, title, message, onConfirm, onCancel }) {
  const yesButtonRef = useRef(null);

  // Establece foco automáticamente al botón "Sí" cuando se abre el modal
  useEffect(() => {
    if (open && yesButtonRef.current) {
      yesButtonRef.current.focus();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      disableEnforceFocus
      disableRestoreFocus
      container={document.body}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            padding: 2,
          },
        },
      }}
    >
      <DialogTitle
        id="confirmation-dialog-title"
        sx={{ textAlign: "center", fontWeight: "bold" }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography
          id="confirmation-dialog-description"
          variant="body1"
          textAlign="center"
          sx={{ mt: 1, mb: 2 }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
        <Button
          ref={yesButtonRef}
          onClick={onConfirm}
          variant="contained"
          color="primary"
          sx={{
            borderRadius: "20px",
            px: "20px",
            py: "8px",
            fontWeight: "bold",
          }}
        >
          Sí
        </Button>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="error"
          sx={{
            borderRadius: "20px",
            px: "20px",
            py: "8px",
            fontWeight: "bold",
          }}
        >
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;

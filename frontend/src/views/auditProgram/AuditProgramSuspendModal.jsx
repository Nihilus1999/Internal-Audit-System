import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  Snackbar,
  Alert,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useParams } from "react-router-dom";
import { suspendAuditProgramBySlug } from "@/services/auditProgram/AuditProgram";

export default function AuditProgramSuspendModal({ open, onClose, onSuspendSuccess }) {
  const { slug } = useParams();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  const handleSuspend = async () => {
    try {
      const message = await suspendAuditProgramBySlug(slug);
      setSnackbarSeverity("success");
      setSnackbarMessage(message);
      setSnackbarOpen(true);
      
      if (onSuspendSuccess) {
        onSuspendSuccess();
      }
      
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Error al suspender el programa.");
      setSnackbarOpen(true);
    } finally {
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        keepMounted
        fullWidth
        maxWidth="sm"
        slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            padding: 2,
          },
        },
      }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          p={3}
          bgcolor="#f1f3f5"
        >
          <Stack spacing={3} alignItems="center">
            <WarningAmberRoundedIcon sx={{ fontSize: 60, color: "#d32f2f" }} />
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Confirmar suspensión
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ color: '#333' }}>
              ¿Estás seguro de suspender este programa de auditoría?
              Mientras esté suspendido, no se podrá llevar a cabo las fases de planificación, ejecución ni reporte.
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              mt={2}
              width="100%"
            >
              <Button
                onClick={handleSuspend}
                variant="contained"
                color="error"
                sx={{
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Suspender
              </Button>
              <Button
                onClick={onClose}
                variant="outlined"
                color="inherit"
                sx={{
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Cancelar
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity} sx={{ fontWeight: "bold" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

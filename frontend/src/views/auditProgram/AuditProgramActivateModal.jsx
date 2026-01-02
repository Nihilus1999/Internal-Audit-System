import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  Snackbar,
  Alert,
} from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useNavigate, useParams } from "react-router-dom";
import { activateAuditProgramBySlug } from "@/services/auditProgram/AuditProgram";

export default function AuditProgramActivateModal({
  open,
  onClose,
  onActivateSuccess,
}) {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  const handleActivate = async () => {
    try {
      const message = await activateAuditProgramBySlug(slug);
      setSnackbarSeverity("success");
      setSnackbarMessage(message);
      setSnackbarOpen(true);

      if (onActivateSuccess) {
        onActivateSuccess();
      }
      
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Error al activar el programa.");
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
            <CheckCircleOutlineRoundedIcon
              sx={{ fontSize: 60, color: "#2e7d32" }}
            />
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Confirmar activación
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ color: '#333' }}>
              ¿Estás seguro de activar este programa de auditoría?
              Esto permitirá que continúe su ejecución según el cronograma.
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              mt={2}
              width="100%"
            >
              <Button
                onClick={handleActivate}
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Activar
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

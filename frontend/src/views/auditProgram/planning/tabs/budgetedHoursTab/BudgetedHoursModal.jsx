import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  getBudgetedHoursByUser,
  updateBudgetedHours,
} from "@/services/auditProgram/Planning";

const initialFields = {
  planificacion: 0,
  pruebas: 0,
  evidencia: 0,
  hallazgos: 0,
  preparacion: 0,
  revision: 0,
};

export default function BudgetedHoursModal({ open, onClose, user }) {
  const yesButtonRef = useRef(null);
  const [fields, setFields] = useState(initialFields);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const { slug } = useParams();

  useEffect(() => {
    const sum = Object.values(fields).reduce(
      (acc, val) => acc + Number(val),
      0
    );
    setTotal(sum);
  }, [fields]);

  useEffect(() => {
    if (open && yesButtonRef.current) {
      yesButtonRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (open && user?.id) {
      fetchBudgetedHours(user);
    }
  }, [open]);

  const fetchBudgetedHours = async (userData) => {
    setLoading(true);
    try {
      const participant = await getBudgetedHoursByUser(slug, userData.id);
      setFields({
        planificacion:
          participant.audit_participant.planning_requirements_hours || 0,
        pruebas: participant.audit_participant.test_execution_hours || 0,
        evidencia: participant.audit_participant.document_evidence_hours || 0,
        hallazgos: participant.audit_participant.document_findings_hours || 0,
        preparacion:
          participant.audit_participant.report_preparation_hours || 0,
        revision: participant.audit_participant.report_revision_hours || 0,
      });
    } catch (error) {
      console.error("Error al cargar horas presupuestadas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Permite campo vacío mientras el usuario edita
    if (value === "") {
      setFields((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    const numericValue = Number(value);

    
    if (/^\d+$/.test(value) && numericValue >= 0) {
      setFields((prev) => ({ ...prev, [name]: numericValue }));
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const onSummit = async () => {
    try {
      setLoading(true);

      const payload = {
        planning_requirements_hours: Number(fields.planificacion),
        test_execution_hours: Number(fields.pruebas),
        document_evidence_hours: Number(fields.evidencia),
        document_findings_hours: Number(fields.hallazgos),
        report_preparation_hours: Number(fields.preparacion),
        report_revision_hours: Number(fields.revision),
      };

      const message = await updateBudgetedHours(payload, slug, user.id);
      setSnackbarSeverity("success");
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        error.message || "Error al guardar las horas presupuestadas."
      );
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
        fullWidth
        maxWidth="sm"
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
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
          Horas Presupuestadas
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Box textAlign="center" my={5}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography gutterBottom>
                <strong>Nombre Completo:</strong> {user?.Nombre}
              </Typography>
              <Typography gutterBottom sx={{ mb: 2 }}>
                <strong>Rol del Usuario:</strong> {user?.Rol}
              </Typography>

              <Typography
                color="primary"
                fontWeight="bold"
                gutterBottom
                mt={3}
                mb={2}
              >
                Fase I - Planificación
              </Typography>
              <Box display="flex" mb={2}>
                <TextField
                  name="planificacion"
                  label="Planificación y requerimientos"
                  type="number"
                  value={fields.planificacion}
                  onChange={handleChange}
                  sx={{ width: "200px" }}
                />
              </Box>

              <Typography
                color="error"
                fontWeight="bold"
                gutterBottom
                mt={3}
                mb={2}
              >
                Fase II - Ejecución
              </Typography>
              <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                <TextField
                  name="pruebas"
                  label="Ejecución de pruebas"
                  type="number"
                  value={fields.pruebas}
                  onChange={handleChange}
                  sx={{ width: "160px" }}
                />
                <TextField
                  name="evidencia"
                  label="Documentar evidencia"
                  type="number"
                  value={fields.evidencia}
                  onChange={handleChange}
                  sx={{ width: "160px" }}
                />
                <TextField
                  name="hallazgos"
                  label="Documentar hallazgos"
                  type="number"
                  value={fields.hallazgos}
                  onChange={handleChange}
                  sx={{ width: "160px" }}
                />
              </Box>

              <Typography
                color="green"
                fontWeight="bold"
                gutterBottom
                mt={3}
                mb={2}
              >
                Fase III - Reporte
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <TextField
                  name="preparacion"
                  label="Preparación del informe"
                  type="number"
                  value={fields.preparacion}
                  onChange={handleChange}
                  sx={{ width: "200px" }}
                />
                <TextField
                  name="revision"
                  label="Revisión del informe"
                  type="number"
                  value={fields.revision}
                  onChange={handleChange}
                  sx={{ width: "200px" }}
                />
              </Box>

              <Box textAlign="center" mt={3}>
                <Typography fontWeight="bold">
                  Total de horas presupuestadas:{" "}
                  <span style={{ color: "red" }}>{total}</span>
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            onClick={onSummit}
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: "20px",
              px: "20px",
              py: "8px",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            Guardar cambios
          </Button>
        </DialogActions>
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

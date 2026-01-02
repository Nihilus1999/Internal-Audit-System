import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import AuditProgram from "@/models/AuditProgram";
import { getAuditProgramBySlug } from "@/services/auditProgram/AuditProgram";
import { updateEvaluationReport } from "@/services/auditProgram/Report";

const EvaluateReportTab = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({});

  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [success, setSuccess] = useState("");
  const [program, setProgram] = useState(null);
  const [error, setError] = useState(null);
  const { slug } = useParams();

  useEffect(() => {
    fetchAuditProgram();
  }, [slug, setValue]);

  const fetchAuditProgram = async () => {
    try {
      const data = await getAuditProgramBySlug(slug);
      const auditProgram = new AuditProgram(data);
      setProgram(auditProgram);
      setValue("report_title", auditProgram.report_title || "");
      setValue("report_introduction", auditProgram.report_introduction || "");
      setValue("report_conclusion", auditProgram.report_conclusion || "");
      setValue(
        "report_auditor_opinion",
        auditProgram.report_auditor_opinion || ""
      );
      setValue("report_audit_summary", auditProgram.report_audit_summary || "");
      setValue("evaluation_criteria", auditProgram.evaluation_criteria || "");
      setValue("objectives", auditProgram.objectives || "");
      setValue("scope", auditProgram.scope || "");
    } catch (error) {
      setError(error.message || "Error al obtener los datos del programa.");
      setProgram(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setError("");
    setSuccess("");
    setOpenConfirmModalDesign(true);
  };

  const handleCancel = () => {
    setOpenConfirmModalDesign(false);
  };

  const handleConfirm = async () => {
    const formData = getValues();
    setOpenConfirmModalDesign(false);
    setError("");
    setSuccess("");

    try {
      const success = await updateEvaluationReport(formData, slug);
      setSuccess(success);
      setSnackbarOpen(true);
    } catch (error) {
      setError(error.message || "Error al actualziar el informe de auditoría.");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ p: 3 }}
    >
      <Paper elevation={5}>
        <Stack spacing={3} alignItems="center" sx={{ padding: 4, width: 600 }}>
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Detalles del informe de auditoría
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Modifica los campos para guardar el informe de auditoria.
          </Typography>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: "100%" }}
          >
            <TextField
              fullWidth
              label="Título"
              {...register("report_title", {
                required: "El nombre es obligatorio",
              })}
              error={!!errors.report_title}
              helperText={errors.report_title?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Introducción"
              multiline
              rows={3}
              {...register("report_introduction", {
                required: "La introducción es obligatoria",
              })}
              error={!!errors.report_introduction}
              helperText={errors.report_introduction?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Resumen de la auditoría"
              multiline
              rows={3}
              {...register("report_audit_summary", {
                required: "El resumen es obligatorio",
              })}
              error={!!errors.report_audit_summary}
              helperText={errors.report_audit_summary?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Opinión del auditor"
              multiline
              rows={3}
              {...register("report_auditor_opinion", {
                required: "La opinión del auditor es obligatoria",
              })}
              error={!!errors.report_auditor_opinion}
              helperText={errors.report_auditor_opinion?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Conclusiones"
              multiline
              rows={3}
              {...register("report_conclusion", {
                required: "Las conclusiones son obligatorias",
              })}
              error={!!errors.report_conclusion}
              helperText={errors.report_conclusion?.message}
              sx={{ mb: 2 }}
            />
          </form>
          <Typography variant="h6" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
            Datos cargados del programa
          </Typography>
          <TextField
            fullWidth
            label="Objetivos"
            multiline
            rows={3}
            value={watch("objectives") || ""}
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Alcance"
            multiline
            rows={3}
            value={watch("scope") || ""}
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Criterios de evaluación"
            multiline
            rows={3}
            value={watch("evaluation_criteria") || ""}
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />

          {program?.processes ? (
          <Box
            sx={{
              width: "100%",
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Procesos asignados al programa
            </Typography>

            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: 1,
                backgroundColor: "white",
                maxHeight: 150,
                overflowY: "auto",
                px: 1,
              }}
            >
              {program.processes.length === 0 ? (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ px: 1, py: 1 }}
                >
                  No hay procesos asignados.
                </Typography>
              ) : (
                <List disablePadding dense>
                  {program.processes.map((finding) => (
                    <ListItem key={finding.id} divider disableGutters>
                      <CheckCircleIcon
                        sx={{ color: "text.secondary", fontSize: 20, mr: 1 }}
                      />
                      <ListItemText
                        primary={
                          <Typography variant="body1">
                            {finding.name}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>
          ) : null}

          {program?.audit_findings ? (
            <Box
              sx={{
                width: "100%",
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Hallazgos encontrados
              </Typography>

              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  backgroundColor: "white",
                  maxHeight: 150,
                  overflowY: "auto",
                  px: 1,
                }}
              >
                {program.audit_findings.length === 0 ? (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ px: 1, py: 1 }}
                  >
                    No hay hallazgos encontrados.
                  </Typography>
                ) : (
                  <List disablePadding dense>
                    {program.audit_findings.map((finding) => (
                      <ListItem key={finding.id} divider disableGutters>
                        <CheckCircleIcon
                          sx={{ color: "text.secondary", fontSize: 20, mr: 1 }}
                        />
                        <ListItemText
                          primary={
                            <Typography variant="body1">
                              {finding.title}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
         ) : null}

         
           

          {/* Botón al final */}
          <ButtonDesign
            variant="contained"
            fullWidth
            onClick={handleSubmit(handleFormSubmit)}
          >
            Guardar cambios
          </ButtonDesign>
          {error && (
            <Alert severity="error" sx={{ fontWeight: "bold" }}>
              {error}
            </Alert>
          )}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación de actualizar informe de resultados"
        message="¿Estás seguro de que deseas actualizar los datos del informe?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ fontWeight: "bold" }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EvaluateReportTab;

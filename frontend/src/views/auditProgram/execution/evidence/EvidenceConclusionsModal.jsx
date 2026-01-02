import {
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { useForm, Controller, set } from "react-hook-form";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuditTestBySlug } from "@/services/auditProgram/Execution";
import { updateEvidenceConlusions } from "@/services/auditProgram/Execution";
import { statusPhasesOptions } from "@/utils/HelpersLib";

export default function ConclusionsEvidenceModal({
  open,
  onClose,
  onStatusSuccess,
}) {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const { slugAuditTest } = useParams();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [auditTest, setAuditTest] = useState("");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  useEffect(() => {
    if (open) {
      fetchAuditTest();
    }
  }, [open]);

  const fetchAuditTest = async () => {
    try {
      setLoading(true);
      const auditTest = await getAuditTestBySlug(slugAuditTest);
      setValue("conclusion", auditTest.conclusion);
      setValue("recommendations", auditTest.recommendations);
      setValue("status", auditTest.status);
      setAuditTest(auditTest);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Error al cargar el estatus.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    try {
      const message = await updateEvidenceConlusions(formData, slugAuditTest);
      setSnackbarSeverity("success");
      setSnackbarMessage(message);
      setSnackbarOpen(true);
      if (onStatusSuccess) {
        onStatusSuccess();
      }
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        error.message || "Error al actualizar el estatus de ejecución."
      );
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
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
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              padding: 2,
            },
          },
        }}
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography
              variant="h5"
              mb={2}
              sx={{ textAlign: "center", fontWeight: "bold" }}
            >
              Gestionar Conclusiones de {auditTest.title}
            </Typography>

            {/* Campo Conclusiones */}
            <Typography fontWeight="bold" mb={1}>
              Conclusiones:
            </Typography>
            <Controller
              name="conclusion"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  minRows={4}
                  fullWidth
                  variant="outlined"
                  error={!!errors.conclusion}
                  helperText={errors.conclusion?.message}
                  sx={{
                    mb: 2,
                    backgroundColor: "#fff",
                  }}
                />
              )}
            />

            {/* Campo Recomendaciones */}
            <Typography fontWeight="bold" mb={1}>
              Recomendaciones:
            </Typography>
            <Controller
              name="recommendations"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  minRows={4}
                  fullWidth
                  variant="outlined"
                  error={!!errors.recommendations}
                  helperText={errors.recommendations?.message}
                  sx={{
                    mb: 2,
                    backgroundColor: "#fff",
                  }}
                />
              )}
            />

            <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.status}>
              <InputLabel id="status-label">Estatus</InputLabel>
              <Controller
                name="status"
                control={control}
                rules={{ required: "Debes seleccionar un estatus" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="status-label"
                    label="Estatus"
                    defaultValue=""
                  >
                    {statusPhasesOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.status && (
                <Typography color="error" variant="body2" mt={0.5}>
                  {errors.status.message}
                </Typography>
              )}
            </FormControl>

            <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
              <Button
                variant="contained"
                type="submit"
                sx={{
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Guardar
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                sx={{
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
                onClick={onClose}
              >
                Cancelar
              </Button>
            </Stack>
          </form>
        )}
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

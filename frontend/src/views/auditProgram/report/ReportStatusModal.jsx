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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuditProgramBySlug } from "@/services/auditProgram/AuditProgram";
import { updateReportStatus } from "@/services/auditProgram/Report";
import { statusPhasesOptions } from "@/utils/HelpersLib";

export default function ReportStatusModal({ open, onClose, onStatusSuccess}) {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const { slug } = useParams();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  useEffect(() => {
    if (open) {
      fetchAuditProgram();
    }
  }, [open]);

  const fetchAuditProgram = async () => {
    try {
      setLoading(true);
      const auditProgram = await getAuditProgramBySlug(slug);
      setValue("status", auditProgram.reporting_status);
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
      const message = await updateReportStatus(formData, slug);
      setSnackbarSeverity("success");
      setSnackbarMessage(message);
      setSnackbarOpen(true);
      if (onStatusSuccess) {
        onStatusSuccess();
      }
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        error.message || "Error al actualizar el estatus de reporte."
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
        maxWidth="xs"
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
              variant="h6"
              mb={2}
              sx={{ textAlign: "center", fontWeight: "bold" }}
            >
              Estatus del Reporte
            </Typography>

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
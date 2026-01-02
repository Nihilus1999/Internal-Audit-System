import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Alert,
  Stack,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAuditProgramBySlug,
  updateAuditProgram,
} from "@/services/auditProgram/AuditProgram";
import AuditProgram from "@/models/AuditProgram";

const AuditProgramUpdate = () => {
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({});

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const audit_startDate = watch("audited_period_start_date");
  const audit_endDate = watch("audited_period_end_date");
  const startDate = watch("start_date");
  const endDate = watch("end_date");
  const navigate = useNavigate();
  const { slug } = useParams();
  dayjs.locale("es");

  useEffect(() => {
    fetchAuditProgram();
  }, [slug, setValue]);

  const fetchAuditProgram = async () => {
    try {
      const data = await getAuditProgramBySlug(slug);
      const auditProgram = new AuditProgram(data);
      setValue("name", auditProgram.name);
      setValue("objectives", auditProgram.objectives);
      setValue("scope", auditProgram.scope);
      setValue("evaluation_criteria", auditProgram.evaluation_criteria);
      setValue(
        "audited_period_start_date",
        auditProgram.audited_period_start_date
      );
      setValue("audited_period_end_date", auditProgram.audited_period_end_date);
      setValue("start_date", auditProgram.start_date);
      setValue("end_date", auditProgram.end_date);
    } catch (error) {
      setError(error.message || "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setOpenConfirmModalDesign(true);
    setError("");
    setSuccess("");
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
      const success = await updateAuditProgram(formData, slug);
      setSuccess(success);
      setSnackbarOpen(true);
      setTimeout(
        () =>
          navigate(
            `/audit-programs/manage-audit-programs/details-program/${slug}`
          ),
        2000
      );
    } catch (error) {
      setError(
        error.message || "Error al actualizar el programa de auditoria."
      );
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Paper elevation={10} sx={{ padding: 4, width: 500 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Actualización del Programa de Auditoría
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Llena los datos para actualizar el programa de auditoría.
          </Typography>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: "100%" }}
          >
            <TextField
              fullWidth
              label="Nombre del programa de auditoría"
              {...register("name", { required: "Este campo es obligatorio" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Objetivos"
              multiline
              rows={3}
              {...register("objectives", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.objectives}
              helperText={errors.objectives?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Alcance"
              multiline
              rows={3}
              {...register("scope", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.scope}
              helperText={errors.scope?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Criterios de evaluación"
              multiline
              rows={3}
              {...register("evaluation_criteria", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.evaluation_criteria}
              helperText={errors.evaluation_criteria?.message}
              sx={{ mb: 2 }}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ mb: 2 }}
                >
                  Fecha del período auditado
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  {/* Fecha a auditar inicio */}
                  <Controller
                    name="audited_period_start_date"
                    control={control}
                    rules={{
                      required: "La fecha de inicio es obligatoria",
                      validate: (value) => {
                        if (
                          audit_endDate &&
                          dayjs(value).isAfter(dayjs(audit_endDate))
                        ) {
                          return "La fecha de inicio del periodo auditoria no puede ser posterior a la fecha final del periodo auditoria";
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <DatePicker
                        label="Fecha de inicio"
                        format="DD/MM/YYYY"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) =>
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD") : null
                          )
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.audited_period_start_date,
                            helperText:
                              errors.audited_period_start_date?.message,
                          },
                        }}
                      />
                    )}
                  />

                  {/* Fecha a auditar fin */}
                  <Controller
                    name="audited_period_end_date"
                    control={control}
                    rules={{
                      required: "La fecha de fin es obligatoria",
                      validate: (value) => {
                        if (
                          audit_startDate &&
                          dayjs(value).isBefore(dayjs(audit_startDate))
                        ) {
                          return "La fecha de fin del periodo de auditoria no puede ser anterior a la fecha de inicio del periodo de auditoria";
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <DatePicker
                        label="Fecha de fin"
                        format="DD/MM/YYYY"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) =>
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD") : null
                          )
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.audited_period_end_date,
                            helperText: errors.audited_period_end_date?.message,
                          },
                        }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ mb: 2 }}
                >
                  Fechas de duración del programa de auditoría
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  {/* Fecha de inicio */}
                  <Controller
                    name="start_date"
                    control={control}
                    rules={{
                      required: "La fecha de inicio es obligatoria",
                      validate: (value) => {
                        if (endDate && dayjs(value).isAfter(dayjs(endDate))) {
                          return "La fecha de inicio del programa de auditoria no puede ser posterior a la fecha final del programa de auditoria";
                        }
                        if (
                          audit_endDate &&
                          dayjs(value).isBefore(dayjs(audit_endDate))
                        ) {
                          return "La fecha de inicio del programa de auditoria no puede ser anterior a la fecha de fin del periodo de auditoria";
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <DatePicker
                        label="Fecha de inicio"
                        format="DD/MM/YYYY"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) =>
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD") : null
                          )
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.start_date,
                            helperText: errors.start_date?.message,
                          },
                        }}
                      />
                    )}
                  />

                  {/* Fecha de fin */}
                  <Controller
                    name="end_date"
                    control={control}
                    rules={{
                      required: "La fecha de fin es obligatoria",
                      validate: (value) => {
                        if (
                          startDate &&
                          dayjs(value).isBefore(dayjs(startDate))
                        ) {
                          return "La fecha de fin del programa de auditoria no puede ser anterior a la fecha de inicio del programa de auditoria";
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <DatePicker
                        label="Fecha de fin"
                        format="DD/MM/YYYY"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) =>
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD") : null
                          )
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.end_date,
                            helperText: errors.end_date?.message,
                          },
                        }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </LocalizationProvider>
            <ButtonDesign>Actualizar programa de auditoría</ButtonDesign>
          </form>

          {error && (
            <Alert severity="error" sx={{ fontWeight: "bold" }}>
              {error}
            </Alert>
          )}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación de actualizar el programa de auditoria"
        message="¿Estás seguro de que deseas actualizar el programa de auditoria con esos datos?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
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

export default AuditProgramUpdate;

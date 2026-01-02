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
  Checkbox,
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import { useEffect, useState } from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useNavigate } from "react-router-dom";
import User from "@/models/User";
import Process from "@/models/Process";
import { getAuditUsers } from "@/services/User";
import { getActiveProcess } from "@/services/Company";
import { createAuditProgram } from "@/services/auditProgram/AuditProgram";
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const AuditProgramCreate = () => {
  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: null,
      objectives: null,
      scope: null,
      evaluation_criteria: null,
      ids_users: [],
      ids_process: [],
      start_date: null,
      end_date: null,
    },
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [process, setProcess] = useState([]);
  const audit_startDate = watch("audited_period_start_date");
  const audit_endDate = watch("audited_period_end_date");
  const startDate = watch("start_date");
  const endDate = watch("end_date");
  const navigate = useNavigate();
  dayjs.locale("es");

  useEffect(() => {
    fetchUsers();
    fetchProcess();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAuditUsers();
      const user = data.map((item) => new User(item));
      setUsers(user);
    } catch (error) {
      setError(error.message || "Error al obtener los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProcess = async () => {
    try {
      const data = await getActiveProcess();
      const process = data.map((item) => new Process(item));
      setProcess(process);
    } catch (error) {
      setError(error.message || "Error al obtener los procesos.");
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
      const successMessage = await createAuditProgram(formData);
      setSuccess(successMessage);
      setSnackbarOpen(true);
      setTimeout(
        () => navigate("/audit-programs/manage-audit-programs/crud"),
        2000
      );
    } catch (error) {
      setError(error.message || "Error al crear el programa de auditoria.");
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
            Creación del Programa de Auditoría
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Llena los datos para registrar el programa de auditoría.
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
            <Controller
              name="ids_user"
              control={control}
              rules={{ required: "Selecciona al menos un usuario" }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  options={users}
                  limitTags={2}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option._fullName}
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={users.filter((u) => value?.includes(u.id))}
                  onChange={(_, selectedOptions) => {
                    const ids = selectedOptions.map((u) => u.id);
                    onChange(ids);
                  }}
                  renderOption={(props, option, { selected }) => {
                    const { key, ...rest } = props;
                    return (
                      <li key={key} {...rest}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {`${option._fullName}`}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Usuarios"
                      placeholder="Selecciona usuarios"
                      error={!!errors.ids_user}
                      helperText={errors.ids_user?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              )}
            />
            <Controller
              name="ids_process"
              control={control}
              rules={{ required: "Selecciona al menos un proceso" }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  options={process}
                  limitTags={2}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={process.filter((u) => value?.includes(u.id))}
                  onChange={(_, selectedOptions) => {
                    const ids = selectedOptions.map((u) => u.id);
                    onChange(ids);
                  }}
                  renderOption={(props, option, { selected }) => {
                    const { key, ...rest } = props;
                    return (
                      <li key={key} {...rest}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {`${option.name}`}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Procesos"
                      placeholder="Selecciona Procesos"
                      error={!!errors.ids_process}
                      helperText={errors.ids_process?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              )}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ mb: 2 }}
                >
                  Fechas del período auditado
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
            <ButtonDesign>Crear programa de auditoría</ButtonDesign>
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
        title="Confirmación de crear el programa de auditoria"
        message="¿Estás seguro de que deseas crear el programa de auditoria con esos datos?"
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

export default AuditProgramCreate;

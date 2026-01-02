import { useForm, Controller } from "react-hook-form";
import { useParams } from "react-router-dom";
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
import Control from "@/models/Control";
import User from "@/models/User";
import {
  getUserAuditProgramBySlug,
  getAuditProgramBySlug,
  getControlsAuditProgramBySlug,
} from "@/services/auditProgram/AuditProgram";
import { createAuditTest } from "@/services/auditProgram/Planning";
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const AuditTestCreate = () => {
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm({});

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [controls, setControls] = useState([]);
  const [auditProgram, setAuditProgram] = useState(null);
  const navigate = useNavigate();
  const { slug } = useParams();
  dayjs.locale("es");

  useEffect(() => {
    fetchAuditProgram();
    fetchUsers();
    fetchControls();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUserAuditProgramBySlug(slug);
      const user = data.map((item) => new User(item));
      setUsers(user);
    } catch (error) {
      setError("Error al obtener los responsables");
    } finally {
      setLoading(false);
    }
  };

  const fetchControls = async () => {
    try {
      const data = await getControlsAuditProgramBySlug(slug);
      const control = data.map((item) => new Control(item));
      setControls(control);
    } catch (error) {
      setError(error.message || "Error al obtener los controles.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditProgram = async () => {
    try {
      const data = await getAuditProgramBySlug(slug);
      setAuditProgram(data);
    } catch (error) {
      setError("Error al obtener los responsables");
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
      const successMessage = await createAuditTest(formData, slug);
      setSuccess(successMessage);
      setSnackbarOpen(true);
      setTimeout(
        () =>
          navigate(`/audit-programs/manage-audit-programs/planning/${slug}`),
        2000
      );
    } catch (error) {
      setError(error.message || "Error al crear el evento.");
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
            Creación de la prueba de auditoría
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Llena los datos para registrar la prueba de auditoría.
          </Typography>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: "100%" }}
          >
            <TextField
              fullWidth
              label="Titulo de la prueba"
              {...register("title", { required: "Este campo es obligatorio" })}
              error={!!errors.title}
              helperText={errors.title?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Objetivo de la prueba"
              multiline
              rows={3}
              {...register("objective", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
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
              label="Procedimiento"
              multiline
              rows={3}
              {...register("procedure", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.procedure}
              helperText={errors.procedure?.message}
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
              rules={{ required: "Selecciona al menos un responsable" }}
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
                        {`${option.first_name} ${option.last_name}`}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Responsables"
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
              name="ids_control"
              control={control}
              rules={{ required: "Selecciona al menos un control" }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  options={controls}
                  limitTags={2}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={controls.filter((u) => value?.includes(u.id))}
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
                      label="Controles a evaluar"
                      placeholder="Selecciona controles"
                      error={!!errors.ids_control}
                      helperText={errors.ids_control?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              )}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Horas estimadas"
                  type="number"
                  {...register("estimated_hours", {
                    required: "Este campo es obligatorio",
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Debe ser mayor o igual a 0",
                    },
                  })}
                  error={!!errors.estimated_hours}
                  helperText={errors.estimated_hours?.message}
                  sx={{ mb: 2 }}
                />

                <Controller
                  name="start_date"
                  control={control}
                  rules={{
                    required: "La fecha de inicio es obligatoria",
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
                      sx={{ flex: 1 }}
                      minDate={dayjs(auditProgram?.start_date)}
                      maxDate={dayjs(auditProgram?.end_date)}
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
              </Box>
            </LocalizationProvider>

            <ButtonDesign>Crear prueba de auditoría</ButtonDesign>
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
        title="Confirmación de crear la prueba de auditoría"
        message="¿Estás seguro de que deseas crear la prueba de auditoría con esos datos?"
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

export default AuditTestCreate;

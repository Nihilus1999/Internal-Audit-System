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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import { useEffect, useState } from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useNavigate } from "react-router-dom";
import User from "@/models/User";
import Event from "@/models/Event";
import Finding from "@/models/Finding";
import { createActionPlan, getActiveFinding } from "@/services/ActionPlan";
import { getActiveUsers } from "@/services/User";
import { getActiveEvents } from "@/services/Event";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const ActionPlanCreate = () => {
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
      description: null,
      type: null,
      subtype: null,
      ids_user: [],
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
  const [events, setEvents] = useState([]);
  const [findings, setFinding] = useState([]);
  const selectedType = watch("plan_type");
  const startDate = watch("start_date");
  const endDate = watch("end_date");
  const navigate = useNavigate();
  dayjs.locale("es");

  useEffect(() => {
    fetchUsers();
    fetchEvents();
    fetchFinding();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getActiveUsers();
      const user = data.map((item) => new User(item));
      setUsers(user);
    } catch (error) {
      setError("Error al obtener los responsables");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await getActiveEvents();
      const event = data.map((item) => new Event(item));
      setEvents(event);
    } catch (error) {
      setError("Error al obtener los eventos");
    }
  };

  const fetchFinding = async () => {
    try {
      const data = await getActiveFinding();
      const finding = data.map((item) => new Finding(item));
      setFinding(finding);
    } catch (error) {
      setError("Error al obtener los hallazgos");
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
    let id_event = null;
    let id_finding = null;

    if (formData.plan_type === "Evento") {
      const eventSelected = events.find((e) => e.name === formData.subtype);
      id_event = eventSelected ? eventSelected.id : null;
    } else if (formData.plan_type === "Hallazgo") {
      const findingSelected = findings.find(
        (f) => f.title === formData.subtype
      );
      id_finding = findingSelected ? findingSelected.id : null;
    }

    // Armar nuevo objeto para enviar
    const payload = {
      name: formData.name,
      description: formData.description,
      plan_type: formData.plan_type === "Evento" ? "Evento" : "Hallazgo",
      id_event,
      id_finding,
      ids_user: formData.ids_user,
      start_date: formData.start_date,
      end_date: formData.end_date,
    };
    setOpenConfirmModalDesign(false);
    setError("");
    setSuccess("");

    try {
      const successMessage = await createActionPlan(payload);
      setSuccess(successMessage);
      setSnackbarOpen(true);
      setTimeout(
        () => navigate("/action-plans/manage-action-plans/crud"),
        2000
      );
    } catch (error) {
      setError(error.message || "Error al crear el plan de acción.");
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
            Creación del Plan de Acción
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Llena los datos para registrar un nuevo plan de acción.
          </Typography>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: "100%" }}
          >
            <TextField
              fullWidth
              label="Nombre del plan de acción"
              {...register("name", { required: "Este campo es obligatorio" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              {...register("description", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
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

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              {/* ComboBox de Tipo */}
              <Controller
                name="plan_type"
                control={control}
                rules={{ required: "Este campo es obligatorio" }}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.plan_type}
                    sx={{ flex: 1 }} // <-- más pequeño
                  >
                    <InputLabel id="select-plan_type-label">Tipo</InputLabel>
                    <Select
                      labelId="select-plan_type-label"
                      label="Tipo"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      renderValue={(selected) =>
                        selected === "" ? (
                          <span style={{ color: "#aaa" }}>
                            Seleccionar tipo...
                          </span>
                        ) : (
                          selected
                        )
                      }
                    >
                      <MenuItem value="Evento">Evento</MenuItem>
                      <MenuItem value="Hallazgo">Hallazgo</MenuItem>
                    </Select>
                    {errors.plan_type && (
                      <Typography variant="caption" color="error">
                        {errors.plan_type.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              {/* ComboBox de Subtipo */}
              <Controller
                name="subtype"
                control={control}
                rules={{ required: "Este campo es obligatorio" }}
                render={({ field }) => {
                  const options =
                    selectedType === "Evento"
                      ? events.map((event) => ({
                          key: event.id,
                          value: event.name,
                          label: event.name,
                        }))
                      : findings.map((finding) => ({
                          key: finding.id,
                          value: finding.title,
                          label: finding.title,
                        }));

                  return (
                    <FormControl
                      fullWidth
                      error={!!errors.subtype}
                      sx={{ flex: 2 }} // <-- más grande
                    >
                      <InputLabel id="select-subtype-label">
                        {selectedType === "Evento"
                          ? "Evento"
                          : selectedType === "Hallazgo"
                          ? "Hallazgo"
                          : "Seleccionar tipo..."}
                      </InputLabel>
                      <Select
                        labelId="select-subtype-label"
                        label={
                          selectedType === "Evento"
                            ? "Evento"
                            : selectedType === "Hallazgo"
                            ? "Hallazgo"
                            : "Seleccionar tipo..."
                        }
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        {options.map(({ key, value, label }) => (
                          <MenuItem key={key} value={value}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.subtype && (
                        <Typography variant="caption" color="error">
                          {errors.subtype.message}
                        </Typography>
                      )}
                    </FormControl>
                  );
                }}
              />
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                {/* Fecha de inicio */}
                <Controller
                  name="start_date"
                  control={control}
                  rules={{
                    required: "La fecha de inicio es obligatoria",
                    validate: (value) => {
                      if (endDate && dayjs(value).isAfter(dayjs(endDate))) {
                        return "La fecha de inicio no puede ser posterior a la fecha final";
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
                        return "La fecha de fin no puede ser anterior a la fecha de inicio";
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
            </LocalizationProvider>

            <ButtonDesign>Crear plan de acción</ButtonDesign>
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
        title="Confirmación de crear plan de acción"
        message="¿Estás seguro de que deseas crear el plan de acción con esos datos?"
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

export default ActionPlanCreate;

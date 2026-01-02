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
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import User from "@/models/User";
import Event from "@/models/Event";
import ActionPlan from "@/models/ActionPlan";
import { getActiveUsers } from "@/services/User";
import { getActiveEvents } from "@/services/Event";
import {
  getActionPlanBySlug,
  updateActionPlan,
  getActiveFinding,
} from "@/services/ActionPlan";
import { statusPlanActions } from "@/utils/HelpersLib";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const ActionPlanUpdate = () => {
  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      type: "",
      subtype: "",
      ids_user: [],
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
  const { slug } = useParams();
  const navigate = useNavigate();
  dayjs.locale("es");

  useEffect(() => {
    fetchActionPlan();
  }, [slug, setValue]);

  const fetchUsers = async (actionPlanData) => {
    try {
      const data = await getActiveUsers();
      const allUsers = data.map((u) => new User(u));
      const selected = allUsers.filter((user) =>
        actionPlanData.users.some(
          (actionPlanUser) => actionPlanUser.id === user.id
        )
      );
      setUsers(allUsers);
      setValue(
        "ids_user",
        selected.map((user) => user.id)
      );
    } catch (error) {
      setError("Error al obtener los responsables");
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await getActiveEvents();
      const eventInstances = data.map((item) => new Event(item));
      setEvents(eventInstances);
      return eventInstances;
    } catch (error) {
      setError("Error al obtener los eventos");
      return [];
    }
  };

  const fetchFindings = async () => {
    try {
      const findingInstances = await getActiveFinding();
      setFinding(findingInstances);
      return findingInstances;
    } catch (error) {
      setError("Error al obtener los hallazgos");
      return [];
    }
  };

  const fetchActionPlan = async () => {
    try {
      const data = await getActionPlanBySlug(slug);
      const actionPlanData = new ActionPlan(data);
      fetchUsers(actionPlanData);
      const fetchedEvents = await fetchEvents();
      const fetchedFindings = await fetchFindings();
      setValue("name", actionPlanData.name);
      setValue("description", actionPlanData.description);
      setValue("plan_type", actionPlanData.plan_type);
      setValue("start_date", actionPlanData._start_picker_date);
      setValue("end_date", actionPlanData._end_picker_date);
      setValue("status", actionPlanData.status);

      // Asignar el subtipo según tipo de plan
      if (actionPlanData.plan_type === "Evento" && actionPlanData.id_event) {
        const selectedEvent = fetchedEvents.find(
          (e) => e.id === actionPlanData.id_event
        );
        if (selectedEvent) {
          setValue("subtype", selectedEvent.name);
        }
      } else if (
        actionPlanData.plan_type === "Hallazgo" &&
        actionPlanData.id_finding
      ) {
        const selectedFinding = fetchedFindings.find(
          (e) => e.id === actionPlanData.id_finding
        );
        if (selectedFinding) {
          setValue("subtype", selectedFinding.title);
        }
      }
    } catch (error) {
      setError(error.message || "Error al cargar datos");
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
      status: formData.status,
    };
    setOpenConfirmModalDesign(false);
    setError("");
    setSuccess("");

    try {
      const successMessage = await updateActionPlan(slug, payload);
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
            Actualización del Plan de Acción
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Llena los datos para actualizar el plan de acción.
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
                  limitTags={2}
                  options={users}
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
                    />
                  )}
                  sx={{ mb: 2, width: "100%" }}
                />
              )}
            />

            <input
              type="hidden"
              {...register("ids_user", {
                validate: (value) =>
                  value && value.length > 0
                    ? true
                    : "Debe seleccionar al menos un responsable",
              })}
            />

            <Autocomplete
              disablePortal
              options={statusPlanActions}
              getOptionLabel={(option) => option.label}
              value={statusPlanActions.find(
                (option) => option.value === watch("status")
              )}
              onChange={(_, newValue) => {
                setValue("status", newValue?.value ?? false);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Estado" sx={{ mb: 2 }} />
              )}
              sx={{ mb: 2, width: "100%" }}
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
                      sx={{ flex: 2 }}
                    >
                      <InputLabel id="select-subtype-label">
                        {selectedType === "Evento" ? "Evento" : "Hallazgo"}
                      </InputLabel>
                      <Select
                        labelId="select-subtype-label"
                        label={
                          selectedType === "Evento" ? "Evento" : "Hallazgo"
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

            <ButtonDesign>Actualizar plan de acción</ButtonDesign>
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
        title="Confirmación de actualizar plan de acción"
        message="¿Estás seguro de que deseas actualizar el plan de acción con esos datos?"
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

export default ActionPlanUpdate;

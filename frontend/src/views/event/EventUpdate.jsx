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
  InputAdornment,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import { useEffect, useState } from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useNavigate, useParams } from "react-router-dom";
import Risk from "@/models/Risk";
import { getEventBySlug } from "@/services/Event";
import { getActiveRisks } from "@/services/Risk";
import { updateEvent } from "@/services/Event";
import { criticalityOptions, statusEventsOptions } from "@/utils/HelpersLib";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Event from "@/models/Event";
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const EventUpdate = () => {
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ids_risk: [],
    },
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [risks, setRisks] = useState([]);
  const navigate = useNavigate();
  const { slug } = useParams();
  dayjs.locale("es");

  useEffect(() => {
    fetchEvent();
  }, [slug, setValue]);

  const fetchRisks = async (eventData) => {
    try {
      const data = await getActiveRisks();
      const allRisks = data.map((u) => new Risk(u));
      const selected = allRisks.filter((risk) =>
        eventData.risks.some((eventData) => eventData.id === risk.id)
      );
      setRisks(allRisks);
      setValue(
        "ids_risk",
        selected.map((risk) => risk.id)
      );
    } catch (error) {
      setError("Error al obtener los riesgos");
    }
  };

  const fetchEvent = async () => {
    try {
      const data = await getEventBySlug(slug);
      const eventData = new Event(data);
      fetchRisks(eventData);
      setValue("name", eventData.name);
      setValue("description", eventData.description);
      setValue("cause", eventData.cause);
      setValue("consequences", eventData.consequences);
      setValue("criticality", eventData.criticality);
      setValue("economic_loss", parseFloat(eventData.economic_loss));
      setValue("incident_date", eventData._incident_picker_date);
      setValue("incident_hour", eventData.incident_hour);
      setValue("status", eventData.status);
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
    setOpenConfirmModalDesign(false);
    setError("");
    setSuccess("");

    try {
      const successMessage = await updateEvent(slug, formData);
      setSuccess(successMessage);
      setSnackbarOpen(true);
      setTimeout(() => navigate("/events/manage-events/crud"), 2000);
    } catch (error) {
      setError(error.message || "Error al actualizar el evento.");
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
            Actualización del Evento
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Llena los datos para actualizar el evento.
          </Typography>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: "100%" }}
          >
            <TextField
              fullWidth
              label="Nombre del evento"
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
            <TextField
              fullWidth
              label="Causa"
              multiline
              rows={3}
              {...register("cause", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.cause}
              helperText={errors.cause?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Consecuencias"
              multiline
              rows={3}
              {...register("consequences", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.consequences}
              helperText={errors.consequences?.message}
              sx={{ mb: 2 }}
            />
            <Controller
              name="ids_risk"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  options={risks}
                  limitTags={2}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={risks.filter((u) => value?.includes(u.id))}
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
                      label="Riesgos"
                      placeholder="Selecciona riesgos"
                      error={!!errors.ids_risk}
                      helperText={errors.ids_risk?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              )}
            />

            <Autocomplete
              disablePortal
              options={statusEventsOptions}
              getOptionLabel={(option) => option.label}
              value={statusEventsOptions.find(
                (option) => option.value === watch("status")
              )}
              onChange={(_, newValue) => {
                setValue("status", newValue?.value ?? false);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Estado" sx={{ mb: 2 }} />
              )}
              sx={{ width: "100%" }}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Controller
                  name="criticality"
                  control={control}
                  rules={{ required: "Selecciona al menos una criticidad" }}
                  render={({ field }) => (
                    <Autocomplete
                      disablePortal
                      options={criticalityOptions}
                      getOptionLabel={(option) => option.label}
                      value={
                        criticalityOptions.find(
                          (option) => option.value === field.value
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.value ?? "");
                      }}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Criticidad"
                          placeholder="Selecciona criticidad"
                          error={!!errors.criticality}
                          helperText={errors.criticality?.message}
                          fullWidth
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  name="incident_date"
                  control={control}
                  rules={{
                    required: "La fecha del incidente es obligatoria",
                  }}
                  render={({ field }) => (
                    <DatePicker
                      label="Fecha del incidente"
                      format="DD/MM/YYYY"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) =>
                        field.onChange(
                          date ? dayjs(date).format("YYYY-MM-DD") : null
                        )
                      }
                      sx={{ flex: 1 }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.incident_date,
                          helperText: errors.incident_date?.message,
                        },
                      }}
                    />
                  )}
                />
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
                  Datos opcionales
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Controller
                      name="economic_loss"
                      control={control}
                      rules={{
                        min: {
                          value: 0,
                          message: "El valor no puede ser negativo",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? null : parseFloat(value)
                            );
                          }}
                          type="number"
                          label="Pérdida Económica"
                          placeholder="Ingresa el monto"
                          InputProps={{
                            inputProps: {
                              min: 0,
                              step: 1,
                            },
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoneyIcon />
                              </InputAdornment>
                            ),
                          }}
                          error={!!errors.economic_loss}
                          helperText={errors.economic_loss?.message}
                          fullWidth
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Controller
                      name="incident_hour"
                      control={control}
                      render={({ field }) => (
                        <TimePicker
                          label="Hora del incidente"
                          views={["hours", "minutes", "seconds"]}
                          value={
                            field.value ? dayjs(field.value, "HH:mm:ss") : null
                          }
                          onChange={(time) =>
                            field.onChange(
                              time ? dayjs(time).format("HH:mm:ss") : null
                            )
                          }
                          ampm={false}
                          sx={{ width: "100%" }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.incident_hour,
                              helperText: errors.incident_hour?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Box>
            </LocalizationProvider>

            <ButtonDesign>Actualizar evento</ButtonDesign>
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
        title="Confirmación de actualizar el evento"
        message="¿Estás seguro de que deseas actualizar el evento con esos datos?"
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

export default EventUpdate;

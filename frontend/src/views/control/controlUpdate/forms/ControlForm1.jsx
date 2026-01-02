import {
  Box,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import {
  control_typeOptions,
  teoric_effectivenessOptions,
  management_typeOptions,
  application_frequencyOptions,
  statusOptions,
} from "@/utils/HelpersLib";
import Control from "@/models/Control";
import { getControlBySlug, patchControlForm } from "@/services/Control";

// Componente reutilizable para Select
const SelectField = ({ name, control, label, options, error }) => (
  <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
    <InputLabel id={`${name}-label`}>{label}</InputLabel>
    <Controller
      name={name}
      control={control}
      rules={{ required: `El campo ${label} es obligatorio` }}
      render={({ field }) => (
        <Select
          labelId={`${name}-label`}
          label={label}
          {...field}
          value={field.value || ""}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      )}
    />
    <FormHelperText>{error?.message}</FormHelperText>
  </FormControl>
);

const ControlForm1 = () => {
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
  const [error, setError] = useState(null);
  const { slug } = useParams();

  const fetchControl = async () => {
    try {
      const data = await getControlBySlug(slug);
      const controlData = new Control(data);
      setValue("name", controlData.name);
      setValue("description", controlData.description);
      setValue("status", controlData.status);
      setValue("control_type", controlData.control_type);
      setValue("teoric_effectiveness", controlData.teoric_effectiveness);
      setValue("management_type", controlData.management_type);
      setValue("application_frequency", controlData.application_frequency);
    } catch (error) {
      setError(error.message || "Error al cargar los datos del control.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchControl();
  }, [slug, setValue]);

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
      const success = await patchControlForm(slug, formData);
      setSuccess(success);
      setSnackbarOpen(true);
    } catch (error) {
      setError(error.message || "Error al actualziar el cotrol");
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
            Información básica del control
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Modifica los campos básicos del control.
          </Typography>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: "100%" }}
          >
            <TextField
              fullWidth
              label="Nombre"
              {...register("name", { required: "El nombre es obligatorio" })}
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
                required: "La descripción es obligatoria",
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
              sx={{ mb: 2 }}
            />

            <Autocomplete
              disablePortal
              options={statusOptions}
              getOptionLabel={(option) => option.label}
              value={statusOptions.find(
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

            <Box display="flex" gap={2} flexWrap="wrap">
              <Box flex={1}>
                <SelectField
                  name="control_type"
                  control={control}
                  label="Tipo de control"
                  options={control_typeOptions}
                  error={errors.control_type}
                />
              </Box>

              <Box flex={1}>
                <SelectField
                  name="teoric_effectiveness"
                  control={control}
                  label="Efectividad teórica"
                  options={teoric_effectivenessOptions}
                  error={errors.teoric_effectiveness}
                />
              </Box>
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap">
              <Box flex={1}>
                <SelectField
                  name="management_type"
                  control={control}
                  label="Tipo de gestión"
                  options={management_typeOptions}
                  error={errors.management_type}
                />
              </Box>

              <Box flex={1}>
                <SelectField
                  name="application_frequency"
                  control={control}
                  label="Frecuencia de aplicación"
                  options={application_frequencyOptions}
                  error={errors.application_frequency}
                />
              </Box>
            </Box>
            <ButtonDesign variant="contained" type="submit" fullWidth>
              Guardar cambios
            </ButtonDesign>
          </form>
          {error && <Alert severity="error" sx={{ fontWeight: "bold" }}>{error}</Alert>}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación de actualizar control"
        message="¿Estás seguro de que deseas actualizar los datos basicos de este control?"
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

export default ControlForm1;

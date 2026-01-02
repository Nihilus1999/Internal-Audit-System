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
import { Controller, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import { riskSourceOptions, statusOptions } from "@/utils/HelpersLib";
import { getRiskBySlug, patchRiskForm } from "@/services/Risk";
import Risk from "@/models/Risk";

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

const RiskForm1 = () => {
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

  const fetchRisk = async () => {
    try {
      const data = await getRiskBySlug(slug);
      const riskData = new Risk(data);
      setValue("name", riskData.name);
      setValue("description", riskData.description);
      setValue("risk_source", riskData.risk_source);
      setValue("possible_consequences", riskData.possible_consequences);
      setValue("risk_origin", riskData.origin);
      setValue("status", riskData.status);
      const selectedControls = riskData.controls.map((r) => ({
        id: r.id,
        name: r.name,
        teoric_effectiveness: r.teoric_effectiveness,
      }));
      localStorage.setItem(
        "selected_controls",
        JSON.stringify(selectedControls)
      );
    } catch (error) {
      setError(error.message || "Error al cargar los datos del riesgo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
  }, [slug]);

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
      const successMessage = await patchRiskForm(slug, formData);
      setSuccess(successMessage);
      setSnackbarOpen(true);
    } catch (error) {
      setError(error.message || "Error al actualizar el riesgo.");
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
            Información básica del riesgo
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Modifica los campos básicos del riesgo.
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

            <TextField
              fullWidth
              label="Fuente de riesgo"
              multiline
              rows={2}
              {...register("risk_source", {
                required: "La fuente de riesgo es obligatoria",
              })}
              error={!!errors.risk_source}
              helperText={errors.risk_source?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Posibles consecuencias"
              multiline
              rows={3}
              {...register("possible_consequences", {
                required: "Las consecuencias son obligatorias",
              })}
              error={!!errors.possible_consequences}
              helperText={errors.possible_consequences?.message}
              sx={{ mb: 2 }}
            />

            <Box display="flex" gap={2} flexWrap="wrap">
              <Box sx={{ flex: 1 }}>
                <SelectField
                  name="risk_origin"
                  control={control}
                  label="Origen del riesgo"
                  options={riskSourceOptions}
                  error={errors.risk_origin}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
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
              </Box>
            </Box>

            <ButtonDesign variant="contained" type="submit" fullWidth>
              Guardar cambios
            </ButtonDesign>
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
        title="Confirmación de actualización"
        message="¿Estás seguro de que deseas actualizar los datos basicos del riesgo?"
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

export default RiskForm1;

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import ButtonDesign from "@/common/template/ButtonDesign";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Alert,
  Stack,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import { getCompany, updateCompany } from "@/services/Company";
import Company from "@/models/Company";
import { countryCodes, months, sectors } from "@/utils/HelpersLib";

// Componentes para selects
const FiscalMonthSelect = ({ control, error }) => (
  <FormControl fullWidth error={!!error} sx={{ minWidth: 150 }}>
    <InputLabel id="fiscal_year_month">Mes de inicio fiscal</InputLabel>
    <Controller
      name="fiscal_year_month"
      control={control}
      rules={{ required: "Este campo es obligatorio" }}
      render={({ field }) => (
        <Select
          labelId="fiscal_year_month"
          label="Mes de inicio fiscal"
          {...field}
        >
          {months.map((mes, index) => (
            <MenuItem key={index} value={mes}>
              {mes}
            </MenuItem>
          ))}
        </Select>
      )}
    />
    <FormHelperText>{error?.message}</FormHelperText>
  </FormControl>
);

const SectorSelect = ({ control, error }) => (
  <FormControl fullWidth error={!!error} sx={{ minWidth: 250 }}>
    <InputLabel id="sector-label">Sector</InputLabel>
    <Controller
      name="sector"
      control={control}
      rules={{ required: "Este campo es obligatorio" }}
      render={({ field }) => (
        <Select labelId="sector-label" label="Sector" {...field}>
          {sectors.map((sector, index) => (
            <MenuItem key={index} value={sector}>
              {sector}
            </MenuItem>
          ))}
        </Select>
      )}
    />
    <FormHelperText>{error?.message}</FormHelperText>
  </FormControl>
);

// Validación teléfono considerando el código de país seleccionado
const validatePhone = (value, selectedCountryCode) => {
  if (!value) return "Número inválido";
  if (/^0/.test(value)) {
    return "El número no debe comenzar con 0";
  }
  const phoneWithCode = selectedCountryCode + value;
  const phoneNumber = parsePhoneNumberFromString(phoneWithCode);
  if (!phoneNumber) return "Número inválido";
  if (!phoneNumber.isValid()) return "Número no válido para el país";
  return true;
};

const BusinessUpdate = () => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    getValues,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const selectedCountryCode = watch("countryCode");

  const handleFormSubmit = () => {
    setOpenConfirmModalDesign(true);
  };

  const handleCancel = () => {
    setOpenConfirmModalDesign(false);
  };

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        let code = "+58"; // default
        const data = await getCompany();
        const company = new Company(data);
        setValue("name", company.name);
        setValue("description", company.description);
        setValue("email", company.email);
        setValue("countryCode", code);
        setValue("phone", company.phone);
        setValue("sector", company.sector);
        setValue("fiscal_year_month", company.fiscal_year_month);
      } catch (error) {
        setError(error.message || "Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [setValue]);

  const handleConfirm = async () => {
    const formData = getValues();
    setError("");
    setSuccess("");
    setOpenConfirmModalDesign(false);

    try {
      const successMessage = await updateCompany(formData);
      setSuccess(successMessage);
      setSnackbarOpen(true);
      setTimeout(() => navigate("/home/main-view"), 2000);
    } catch (error) {
      setError(error.message || "Error al actualizar los datos.");
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
      <Paper elevation={10} sx={{ padding: 4, width: 600 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Detalles de la Empresa
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Puedes modificar los datos de tu empresa aquí.
          </Typography>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: "100%" }}
          >
            <TextField
              fullWidth
              label="Nombre de la empresa"
              {...register("name", { required: "Este campo es obligatorio" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Descripción"
              multiline
              minRows={4}
              {...register("description", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
              sx={{ mb: 2 }}
            />

            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Correo electrónico"
                {...register("email", {
                  required: "Este campo es obligatorio",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Formato de correo inválido",
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Box>

            {/* Selector de país y teléfono */}
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <FormControl sx={{ width: 400 }} error={!!errors.countryCode}>
                <InputLabel>Código País</InputLabel>
                <Controller
                  name="countryCode"
                  control={control}
                  rules={{ required: "Seleccione un país" }}
                  render={({ field }) => (
                    <Select label="Código País" {...field}>
                      {countryCodes.map(
                        ({ code, label, dial_code, flag }, index) => (
                          <MenuItem
                            key={`${code}-${dial_code}-${index}`}
                            value={dial_code}
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <img
                              src={flag}
                              alt={`Bandera de ${code}`}
                              style={{
                                width: 24,
                                height: 16,
                                objectFit: "cover",
                                borderRadius: 2,
                              }}
                            />
                            <span style={{ marginLeft: 8 }}>
                              {dial_code} {label}
                            </span>
                          </MenuItem>
                        )
                      )}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.countryCode?.message}</FormHelperText>
              </FormControl>

              <TextField
                label="Teléfono"
                fullWidth
                {...register("phone", {
                  required: "Número requerido",
                  validate: (value) =>
                    validatePhone(value, selectedCountryCode),
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </Box>

            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <SectorSelect control={control} error={errors.sector} />
              <FiscalMonthSelect
                control={control}
                error={errors.fiscal_year_month}
              />
            </Box>

            <ButtonDesign>
              Actualizar Datos
            </ButtonDesign>
          </form>

          {error && <Alert severity="error" sx={{ fontWeight: "bold" }}>{error}</Alert>}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación de datos de la empresa"
        message="¿Estás seguro de que deseas actualizar los datos generales de la empresa?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <Snackbar
        open={snackbarOpen}
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

export default BusinessUpdate;

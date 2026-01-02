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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "@/services/User";
import { getActiveRoles } from "@/services/Role";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { countryCodes } from "@/utils/HelpersLib";

const validatePhone = (value, countryCode) => {
  if (!value) return "Este campo es obligatorio";
  if (/^0/.test(value)) return "El número no debe comenzar con 0";
  const phoneWithCode = countryCode + value;
  const phoneNumber = parsePhoneNumberFromString(phoneWithCode);
  if (!phoneNumber) return "Número inválido";
  if (!phoneNumber.isValid()) return "Número no válido para el país";
  return true;
};

const UserCreate = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    formState: { errors },
  } = useForm();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);

  const navigate = useNavigate();
  const selectedCountryCode = watch("countryCode", "+58");

  const fetchRoles = async () => {
    try {
      const data = await getActiveRoles();
      setRoles(data);
    } catch (error) {
      setError(error.message || "Error al cargar los roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleConfirm = async () => {
    const formData = getValues();
    setOpenConfirmModalDesign(false);
    setError("");
    setSuccess("");

    try {
      const successMessage = await createUser(formData);
      setSuccess(successMessage);
      setSnackbarOpen(true);
      setTimeout(() => navigate("/admin/manage-users/crud"), 2000);
    } catch (error) {
      setError(error.message || "Error al crear el usuario");
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
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Paper elevation={10} sx={{ padding: 4, width: 500 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Crear Usuario
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Llena los datos para registrar un nuevo usuario.
          </Typography>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: "100%" }}
          >
            <TextField
              fullWidth
              label="Nombre"
              {...register("first_name", {
                required: "Este campo es obligatorio",
                pattern: {
                  value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
                  message: "El nombre no cumple con el formato",
                },
              })}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Apellido"
              {...register("last_name", {
                required: "Este campo es obligatorio",
                pattern: {
                  value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
                  message: "El apellido no cumple con el formato",
                },
              })}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              {...register("email", {
                required: "Este campo es obligatorio",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Correo electrónico inválido",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />

            {/* Aquí código de país y teléfono en la misma fila con estilo solicitado */}
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <FormControl sx={{ width: 400 }} error={!!errors.countryCode}>
                <InputLabel>Código País</InputLabel>
                <Controller
                  name="countryCode"
                  control={control}
                  rules={{ required: "Seleccione un país" }}
                  defaultValue="+58"
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

            <FormControl fullWidth error={!!errors.id_role} sx={{ mb: 2 }}>
              <InputLabel id="role-label">Rol</InputLabel>
              <Controller
                name="id_role"
                control={control}
                rules={{ required: "Selecciona un rol" }}
                render={({ field }) => (
                  <Select
                    labelId="role-label"
                    label="Rol"
                    {...field}
                    value={field.value || ""}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <FormHelperText>{errors.id_role?.message}</FormHelperText>
            </FormControl>

            <ButtonDesign
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                borderRadius: "20px",
                px: "20px",
                py: "8px",
                mt: 2,
                fontWeight: "bold",
              }}
            >
              Crear Usuario
            </ButtonDesign>
          </form>

         {error && <Alert severity="error" sx={{fontWeight: "bold"}}>{error}</Alert>}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación del crear usuario"
        message="¿Estás seguro de que deseas crear el usuario con estos datos?"
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

export default UserCreate;

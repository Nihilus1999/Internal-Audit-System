import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import { getProfile, updateProfile } from "@/services/Profile";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "@/configs/redux/authSlice";
import User from "@/models/User";
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

const UpdateProfile = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      countryCode: "+58",
      phone: "",
    },
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState(null);
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const selectedCountryCode = watch("countryCode", "+58");

  useEffect(() => {
    fetchProfile();
  }, [setValue]);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      const user = new User(data);
      setProfile(user);
      setValue("first_name", user.first_name);
      setValue("last_name", user.last_name);
      setValue("email", user.email);

      if (user.phone) {
        let matchedCode = countryCodes.find(({ dial_code }) =>
          user.phone.startsWith(dial_code)
        );
        if (matchedCode) {
          setValue("countryCode", matchedCode.dial_code);
          setValue("phone", user.phone.slice(matchedCode.dial_code.length));
        } else {
          setValue("phone", user.phone);
        }
      }
    } catch (error) {
      setError(error.message || "Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
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
      const successMessage = await updateProfile(formData);
      setSuccess(successMessage);
      setSnackbarOpen(true);
      setTimeout(() => {
        dispatch(fetchUserProfile());
        navigate("/home/main-view");
      }, 2000);
    } catch (error) {
      setError(error.message || "Error al actualizar perfil.");
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
    <Box display="flex" justifyContent="center" alignItems="flex-start">
      <Paper elevation={10} sx={{ padding: 4, width: 500 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Actualizar Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Puedes modificar tus datos personales aquí.
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
              sx={{ mb: 2 }}
            />

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
                  required: "Este campo es obligatorio",
                  validate: (value) =>
                    validatePhone(value, selectedCountryCode),
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </Box>

            <TextField
              fullWidth
              label="Usuario"
              value={profile?.username}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Rol"
              value={profile?.role.name}
              disabled
              sx={{ mb: 2 }}
            />

            <ButtonDesign>
              Actualizar Datos
            </ButtonDesign>
          </form>

          {error && <Alert severity="error" sx={{ fontWeight: "bold" }}>{error}</Alert>}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación de datos"
        message="¿Estás seguro de que deseas actualizar tus datos?"
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

export default UpdateProfile;

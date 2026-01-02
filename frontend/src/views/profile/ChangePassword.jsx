import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "@/services/Profile";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    setError: Error,
    formState: { errors },
    getValues,
  } = useForm();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const navigate = useNavigate();
  const password = watch("password", "");

  const requirements = [
    {
      label: "Debe tener al menos 8 caracteres",
      check: (value) => value.length >= 8,
    },
    {
      label: "Debe tener al menos una letra mayúscula",
      check: (value) => /[A-Z]/.test(value),
    },
    {
      label: "Debe tener al menos una letra minúscula",
      check: (value) => /[a-z]/.test(value),
    },
    {
      label: "Debe tener al menos un número",
      check: (value) => /\d/.test(value),
    },
    {
      label: "Debe tener al menos un carácter especial",
      check: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
    },
  ];

  const onSubmit = () => {
    setOpenConfirmModalDesign(true);
  };

  const handleConfirm = async () => {
    const { password, confirmPassword } = getValues();
    setError("");
    setSuccess("");
    setOpenConfirmModalDesign(false);

    if (password !== confirmPassword) {
      Error("confirmPassword", { message: "Las contraseñas no coinciden" });
      return;
    }

    try {
      const successMessage = await updatePassword(password, confirmPassword);
      setSuccess(successMessage);
      setSnackbarOpen(true);
      setTimeout(() => navigate("/home/main-view"), 2000);
    } catch (error) {
      setError(error.message || "Error al cambiar la contraseña");
    }
  };

  const handleCancel = () => {
    setOpenConfirmModalDesign(false);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start">
      <Paper elevation={10} sx={{ padding: 4, width: 400 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Cambiar Contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Ingresa y confirma tu nueva contraseña.
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
            <TextField
              fullWidth
              label="Nueva contraseña"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              {...register("password", {
                required: "Este campo es obligatorio",
              })}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirmar nueva contraseña"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              {...register("confirmPassword", {
                required: "Este campo es obligatorio",
                validate: (value) =>
                  value === password || "Las contraseñas no coinciden",
              })}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <List dense sx={{ mt: 2, mb: 2 }}>
              {requirements.map((req, idx) => {
                const isValid = req.check(password);
                return (
                  <ListItem key={idx}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {isValid ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <CancelIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          color={isValid ? "success.main" : "error.main"}
                        >
                          {req.label}
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>

            <ButtonDesign>
              Cambiar Contraseña
            </ButtonDesign>
          </form>

          {error && <Alert severity="error" sx={{ fontWeight: "bold" }}>{error}</Alert>}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación de Cambio de Contraseña"
        message="¿Estás seguro de que deseas cambiar la contraseña?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ fontWeight: "bold" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChangePassword;

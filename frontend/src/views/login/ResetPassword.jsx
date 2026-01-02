import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "@/services/Auth";
import LogoLogin from "@/assets/image/logoConsultoresJDG.png";
import ButtonDesign from "@/common/template/ButtonDesign";
import {
  Box,
  Paper,
  Typography,
  TextField,
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
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    setError: Error,
    formState: { errors },
    getValues,
  } = useForm();

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const navigate = useNavigate();
  const password = watch("password", "");
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

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

  const handleCancel = () => {
    setOpenConfirmModalDesign(false);
  };

  const handleConfirm = async () => {
    const { password, confirmPassword } = getValues();
    setSuccess("");
    setError("");
    setOpenConfirmModalDesign(false);

    if (password !== confirmPassword) {
      Error("confirmPassword", { message: "Las contraseñas no coinciden" });
      return;
    }

    try {
      const email = localStorage.getItem("resetEmail");
      const otpCode = localStorage.getItem("otpCode");

      if (email && otpCode) {
        const successMessage = await resetPassword(
          email,
          otpCode,
          password,
          confirmPassword
        );
        setSuccess(successMessage);
        setSnackbarOpen(true);
        localStorage.removeItem("otpCode");
        localStorage.removeItem("resetEmail");
        setTimeout(() => navigate("/login/session"), 2000);
      }
    } catch (error) {
      setError(error.message || "Error al cambiar la contraseña");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Paper elevation={10} sx={{ padding: 4, width: 380 }}>
        <Stack spacing={3} alignItems="center">
          <Box
            component="img"
            src={LogoLogin}
            alt="Logo del sistema"
            sx={{ width: 100 }}
          />
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
                    <IconButton onClick={togglePasswordVisibility} edge="end">
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
                  value === watch("password") || "Las contraseñas no coinciden",
              })}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
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

export default ResetPassword;

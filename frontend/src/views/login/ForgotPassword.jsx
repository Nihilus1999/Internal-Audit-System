// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { forgotPassword } from "@/services/Auth";
import LogoLogin from "@/assets/image/logoConsultoresJDG.png";
import ButtonDesign from "@/common/template/ButtonDesign";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setSuccess("");
    setError("");

    try {
      const successMessage = await forgotPassword(data.email);
      localStorage.setItem("resetEmail", data.email);
      setSuccess(successMessage);
      setSnackbarOpen(true);
      setTimeout(() => navigate("/login/verify-otp"), 2000);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Paper elevation={10} sx={{ padding: 4, width: 350 }}>
        <Stack spacing={3} alignItems="center">
          <Box
            component="img"
            src={LogoLogin}
            alt="Logo del sistema"
            sx={{ width: 100 }}
          />
          <Typography variant="h5" align="center" fontWeight="bold">
            Sistema de Auditoría Interna
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            fontWeight="bold"
          >
            Recuperar Contraseña
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              variant="outlined"
              margin="normal"
              {...register("email", {
                required: "El correo es obligatorio",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Correo inválido",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <ButtonDesign isSubmitting={isSubmitting}>
              Enviar correo de recuperación
            </ButtonDesign>
          </form>
          {error && <Alert severity="error" sx={{ fontWeight: "bold" }}>{error}</Alert>}
        </Stack>
      </Paper>

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

export default ForgotPassword;

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { verifyOTP } from "@/services/Auth";
import LogoLogin from "@/assets/image/logoConsultoresJDG.png";
import ButtonDesign from "@/common/template/ButtonDesign";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Alert,
  Stack,
  Snackbar,
} from "@mui/material";

const OTPVerification = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const onSubmit = async ({ otp }) => {
    setSuccess("");
    setError("");

    try {
      const successMessage = await verifyOTP(email, otp);
      if (successMessage) {
        localStorage.setItem("otpCode", otp);
        setSuccess(successMessage);
        setSnackbarOpen(true);
        setTimeout(() => navigate("/login/reset-password"), 1000);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    // Filtra solo los números
    let value = e.target.value.replace(/\D/g, "");
    // Limita a 6 caracteres
    if (value.length > 6) {
      value = value.slice(0, 6);
    }
    e.target.value = value;
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
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Verificación de OTP
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Se ha enviado un código a tu correo electrónico. Por favor,
            ingrésalo a continuación.
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
            <TextField
              fullWidth
              label="Código OTP"
              variant="outlined"
              {...register("otp", {
                required: "Este campo es obligatorio",
                minLength: {
                  value: 6,
                  message: "El código OTP debe tener 6 dígitos",
                },
              })}
              error={Boolean(errors.otp)}
              helperText={errors.otp?.message}
              onInput={handleInputChange}
            />

            <ButtonDesign>
              Verificar OTP
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

export default OTPVerification;

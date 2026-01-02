import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/configs/redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { login } from "@/services/Auth";
import LogoLogin from "@/assets/image/logoConsultoresJDG.png";
import ButtonDesign from "@/common/template/ButtonDesign";
import {
  Box,
  TextField,
  Typography,
  Paper,
  Stack,
  Alert,
  IconButton,
  Snackbar,
} from "@mui/material";
import { useState } from "react";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setsuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setError("");
    setsuccess("");

    try {
      const { token, user, message } = await login(
        data.identifier,
        data.password
      );
      setsuccess(message);
      setSnackbarOpen(true);
      setTimeout(() => {
        dispatch(loginSuccess({ token, user }));
        navigate("/home/main-view");
      }, 2000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
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
            gutterBottom
          >
            Inicio de sesión
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ width: "100%" }}>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonOutlineIcon
                sx={{ fontSize: 30, mr: 1, color: "action.active" }}
              />
              <TextField
                fullWidth
                label="Usuario"
                variant="outlined"
                {...register("identifier", {
                  required: "El usuario es obligatorio",
                })}
                error={!!errors.identifier}
                helperText={errors.identifier?.message}
                sx={{ flexGrow: 1 }}
              />
            </Box>

            {/* Campo Contraseña con ícono al lado y botón mostrar/ocultar al final */}
            <Box display="flex" alignItems="center" mb={2}>
              <LockOutlinedIcon
                sx={{ fontSize: 30, mr: 1, color: "action.active" }}
              />
              <TextField
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ flexGrow: 1 }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Box>

            <ButtonDesign isSubmitting={isSubmitting}>
              Iniciar sesión
            </ButtonDesign>
          </form>
          <Box mt={2} textAlign="center">
            <Typography variant="body2" fontWeight="bold">
              <Link
                to="/login/forgot-password"
                underline="hover"
                color="primary"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Typography>
          </Box>
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

export default Login;

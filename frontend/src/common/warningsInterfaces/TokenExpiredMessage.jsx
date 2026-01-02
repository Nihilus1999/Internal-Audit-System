// src/views/common/TokenExpiredMessage.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Snackbar,
  Alert,
  Button,
  Stack,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/configs/redux/authSlice";

export default function TokenExpiredMessage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [secondsLeft, setSecondsLeft] = useState(() => {
    const expiredAtRaw = localStorage.getItem("expiredAt");
    const expiredAt = expiredAtRaw ? parseInt(expiredAtRaw, 10) : Date.now();
    const elapsed = Math.floor((Date.now() - expiredAt) / 1000);
    const remaining = 10 - elapsed;
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    const expiredAtRaw = localStorage.getItem("expiredAt");
    const expiredAt = expiredAtRaw ? parseInt(expiredAtRaw, 10) : Date.now();
    if (!expiredAtRaw) {
      localStorage.setItem("expiredAt", expiredAt.toString());
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - expiredAt) / 1000);
      const remaining = 10 - elapsed;

      if (remaining <= 0) {
        localStorage.removeItem("expiredAt");
        dispatch(logout());
        navigate("/login/session");
        clearInterval(interval);
      } else {
        setSecondsLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch, navigate]);

  const handleImmediateRedirect = () => {
    localStorage.removeItem("expiredAt");
    dispatch(logout());
    navigate("/login/session");
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f1f3f5"
      >
        <Paper
          elevation={10}
          sx={{
            p: 5,
            borderRadius: 4,
            maxWidth: 500,
            width: "90%",
            textAlign: "center",
            bgcolor: "white",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <ErrorOutlineIcon sx={{ fontSize: 60, color: "#d32f2f" }} />
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Sesión expirada
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Por seguridad, tu sesión ha caducado. Serás redirigido en breve.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleImmediateRedirect}
              sx={{ mt: 2, borderRadius: 20, px: 4 }}
            >
              Iniciar sesión ahora
            </Button>
          </Stack>
        </Paper>
      </Box>

      <Snackbar
        open
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="warning" sx={{ fontWeight: "bold" }}>
          Tu sesión ha expirado. Redirigiendo en {secondsLeft} segundos...
        </Alert>
      </Snackbar>
    </>
  );
}
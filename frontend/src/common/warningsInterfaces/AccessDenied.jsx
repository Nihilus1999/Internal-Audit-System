import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
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
          <LockOutlinedIcon sx={{ fontSize: 60, color: "#d32f2f" }} />
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Acceso denegado
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No tienes permisos suficientes para acceder a esta sección del sistema.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/home/main-view")}
            sx={{ mt: 2, borderRadius: 20, px: 4 }}
          >
            Ir al inicio
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AccessDenied;
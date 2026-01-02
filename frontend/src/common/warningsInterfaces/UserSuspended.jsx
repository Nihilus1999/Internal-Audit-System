import { Box, Paper, Typography, Button, Stack, Link } from "@mui/material";
import BlockIcon from "@mui/icons-material/Block"; // Icono más representativo de suspensión
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/configs/redux/authSlice";

const UserSuspended = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleImmediateRedirect = () => {
    dispatch(logout());
    navigate("/login/session");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f8f9fa"
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
          <BlockIcon sx={{ fontSize: 60, color: "#d32f2f" }} />
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Usuario suspendido
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tu cuenta ha sido suspendida o desactivada. Si crees que esto es un
            error, por favor contacta al administrador del sistema.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleImmediateRedirect}
            sx={{ mt: 2, borderRadius: 20, px: 4 }}
          >
            Volver al login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default UserSuspended;

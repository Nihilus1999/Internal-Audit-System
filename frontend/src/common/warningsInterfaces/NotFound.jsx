import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
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
          <ReportProblemOutlinedIcon sx={{ fontSize: 60, color: "#d32f2f" }} />
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Error 404
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Esta ruta no existe en el sistema. Verifique la dirección URL de su navegador
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

export default NotFound;

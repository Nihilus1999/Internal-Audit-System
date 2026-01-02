import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Snackbar, Alert } from "@mui/material";
import HeatMapChart from "@/common/dashboard/HeatMapDesign";
import { emptyHeatMap } from "@/utils/HelpersLib";
import { getHeatMapPlanning } from "@/services/Dashboard";

const HeatMapTab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState("");
  const [heatmapData, setHeatmapData] = useState([]);
  const { slug } = useParams();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const heatmap = await getHeatMapPlanning(slug);
      setHeatmapData(heatmap);
    } catch (error) {
      setHeatmapData(emptyHeatMap);
      setError(error.message || "No se pudo obtener los datos");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError("");
  };

  if (isLoading) {
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
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ p: 3 }}
      >
        <HeatMapChart
          data={heatmapData}
          height={350}
          widht={500}
          tittle={"Mapa de calor de Procesos de la Auditoría"}
        />
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {error && (
          <Alert severity={"error"} sx={{ fontWeight: "bold" }}>
            {error}
          </Alert>
        )}
      </Snackbar>
    </>
  );
};

export default HeatMapTab;

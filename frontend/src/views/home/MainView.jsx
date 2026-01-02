import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  Link,
} from "@mui/material";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import User from "@/models/User";
import ProcessIcon from "@mui/icons-material/AssignmentTurnedIn";
import UsersIcon from "@mui/icons-material/Group";
import RiskIcon from "@mui/icons-material/ReportProblem";
import EventsIcon from "@mui/icons-material/EventNote";
import ControlsIcon from "@mui/icons-material/CheckCircleOutline";
import ActionPlansIcon from "@mui/icons-material/PlaylistAddCheck";
import AuditProgramsIcon from "@mui/icons-material/FolderShared";
import HeatMapChart from "@/common/dashboard/HeatMapDesign";
import { emptyHeatMap, emptyCounts } from "@/utils/HelpersLib";
import { getHeatMapHome, getCountsHome } from "@/services/Dashboard";

const MainView = () => {
  const user = new User(useSelector((state) => state.auth.data));
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState("");
  const [heatmapData, setHeatmapData] = useState([]);
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [heatmap, totals] = await Promise.all([
        getHeatMapHome(),
        getCountsHome(),
      ]);
      setHeatmapData(heatmap);
      setCounts(totals);
    } catch (error) {
      setHeatmapData(emptyHeatMap);
      setCounts(emptyCounts);
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

  const recordItems = [
    {
      key: "processes",
      label: "Procesos",
      count: counts.processes,
      path: "/company/manage-processes/crud",
    },
    {
      key: "users",
      label: "Usuarios",
      count: counts.users,
      path: "/admin/manage-users/crud",
    },
    {
      key: "risks",
      label: "Riesgos",
      count: counts.risks,
      path: "/risks/manage-risks/crud",
    },
    {
      key: "controls",
      label: "Controles",
      count: counts.controls,
      path: "/controls/manage-controls/crud",
    },
    {
      key: "events",
      label: "Eventos",
      count: counts.events,
      path: "/events/manage-events/crud",
    },
    {
      key: "actionPlans",
      label: "Planes de Acción",
      count: counts.actionPlans,
      path: "/action-plans/manage-action-plans/crud",
    },
    {
      key: "auditPrograms",
      label: "Programas de Auditoría",
      count: counts.auditPrograms,
      path: "/audit-programs/manage-audit-programs/crud",
    },
  ];

  const icons = {
    processes: <ProcessIcon sx={{ fontSize: 20, color: "black" }} />,
    users: <UsersIcon sx={{ fontSize: 20, color: "black" }} />,
    risks: <RiskIcon sx={{ fontSize: 20, color: "black" }} />,
    events: <EventsIcon sx={{ fontSize: 20, color: "black" }} />,
    controls: <ControlsIcon sx={{ fontSize: 20, color: "black" }} />,
    actionPlans: <ActionPlansIcon sx={{ fontSize: 20, color: "black" }} />,
    auditPrograms: <AuditProgramsIcon sx={{ fontSize: 20, color: "black" }} />,
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "1300px", margin: "0 auto" }}>
      <Box mb={4} display="flex" justifyContent="center">
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
          ¡Bienvenido {user._fullName}!
        </Typography>
      </Box>

      <Box display="flex" gap={4} alignItems="center">
        <Box
          flex="0 0 60%"
          maxWidth={800}
          display="flex"
          justifyContent="center"
        >
          <HeatMapChart
            data={heatmapData}
            height={350}
            widht={500}
            tittle="Mapa de Calor de Procesos Internos (riesgo inherente)"
          />
        </Box>

        <Box
          flex="0 0 35%"
          maxWidth={350}
          display="grid"
          gridTemplateColumns="repeat(2, 1fr)"
          gap={2}
        >
          {/* Título */}
          <Box gridColumn="span 2" mb={1}>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="black"
              textAlign="center"
            >
              Resumen de registros
            </Typography>
          </Box>

          {/* Tarjetas clickeables */}
          {recordItems.slice(0, 6).map(({ key, label, count, path }) => (
            <Link
              key={label}
              component={RouterLink}
              to={path}
              underline="none"
              sx={{ textDecoration: "none" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 1,
                  borderRadius: 2,
                  boxShadow: 1,
                  bgcolor: "#f5f5f5",
                  minHeight: 50,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              >
                <Box mr={1.5}>{icons[key]}</Box>
                <Box textAlign="center" width="100%">
                  <Typography
                    fontWeight="bold"
                    lineHeight={1}
                    fontSize="1.1rem"
                    color="black"
                  >
                    {count}
                  </Typography>
                  <Typography
                    fontWeight="bold"
                    fontSize="0.9rem"
                    color="black"
                  >
                    {label}
                  </Typography>
                </Box>
              </Box>
            </Link>
          ))}

          {/* Última tarjeta - ocupa 2 columnas */}
          <Link
            component={RouterLink}
            to={recordItems[6].path}
            underline="none"
            sx={{ textDecoration: "none", gridColumn: "span 2" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 1,
                borderRadius: 2,
                boxShadow: 1,
                bgcolor: "#f5f5f5",
                minHeight: 50,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                },
              }}
            >
              <Box display="flex" alignItems="center">
                <Box mr={1.5}>{icons["auditPrograms"]}</Box>
                <Box>
                  <Typography
                    fontWeight="bold"
                    textAlign="center"
                    lineHeight={1}
                    fontSize="1.1rem"
                    color="black"
                  >
                    {recordItems[6].count}
                  </Typography>
                  <Typography
                    fontSize="0.9rem"
                    color="black"
                    textAlign="center"
                    fontWeight="bold"
                  >
                    {recordItems[6].label}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Link>
        </Box>
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
    </Box>
  );
};

export default MainView;
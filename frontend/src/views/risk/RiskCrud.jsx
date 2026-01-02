import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { getRisks } from "@/services/Risk";
import TableDesign from "@/common/template/TableDesign";
import ControlsModal from "@/views/risk/ControlsModal";
import ProcessesModal from "@/views/risk/ProcessesModal";
import Risk from "@/models/Risk";
import { statusOptions } from "@/utils/HelpersLib";

const RiskCrud = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openControlsModal, setOpenControlsModal] = useState(false);
  const [openProcessesModal, setOpenProcessesModal] = useState(false);
  const [selectedControls, setSelectedControls] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState([]);

  const limitPage = 10;

  useEffect(() => {
    fetchRiks();
  }, []);

  const fetchRiks = async () => {
    try {
      const data = await getRisks();
      const risk = data.map((item) => new Risk(item));
      const userRows = risk.map((item) => ({
        id: item.slug,
        Codigo: item.slug,
        Nombre: item.name,
        Origen: item.risk_source,
        Inherencia: item.inherentRiskScore.toFixed(2),
        Residual: item.residualRiskScore.toFixed(2),
        Controles: item.controls,
        Procesos: item.processes,
        ProcesosAfectados: Array.isArray(item.processes)
          ? item.processes.map((p) => p.name).join("\n")
          : "",
        Fecha: item._updated_at,
        Estado: item._status,
      }));
      setRows(userRows);
    } catch (error) {
      setError(error.message || "No se pudo obtener los datos");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProcessesModal = (processes) => {
    setSelectedProcesses(processes);
    setOpenProcessesModal(true);
  };

  const handleCloseProcessesModal = () => {
    setOpenProcessesModal(false);
  };

  const handleOpenControlsModal = (controls) => {
    setSelectedControls(controls);
    setOpenControlsModal(true);
  };

  const handleCloseControlsModal = () => {
    setOpenControlsModal(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError("");
  };

  const columns = [
    {
      field: "Codigo",
      flex: 1,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Código
        </strong>
      ),
      renderCell: (data) => {
        return (
          <span
            style={{
              fontWeight: "bold",
            }}
          >
            {data.value}
          </span>
        );
      },
    },
    {
      field: "Nombre",
      flex: 1,
      minWidth: 250,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Nombre del Riesgo
        </strong>
      ),
    },
    {
      field: "ProcesosAfectados",
      flex: 1,
      minWidth: 250,
      headerAlign: "center",
      renderHeader: () => (
        <strong style={{ width: "100%", display: "block" }}>
          Procesos Afectados
        </strong>
      ),
      renderCell: (params) => {
        const procesos = params.value;
        if (!procesos) return "N/A";

        const lineas = procesos.split("\n");

        return (
          <Box
            component="ul"
            sx={{
              m: 0,
              p: 0,
              listStyle: "disc",
              pl: 2,
              textAlign: "left",
            }}
          >
            {lineas.map((linea, index) => (
              <li key={index}>{linea}</li>
            ))}
          </Box>
        );
      },
    },
    {
      field: "Origen",
      flex: 1,
      minWidth: 300,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Fuente del riesgo
        </strong>
      ),
    },
    {
      field: "Inherencia",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Riesgo Inherente
        </strong>
      ),
      renderCell: (data) => {
        const value = parseFloat(data.value);
        let color = "#000";
        let option = null;
        if (!isNaN(value)) {
          if (value <= 1.5) color = "green", option="Bajo";
          else if (value < 2.5) color = "orange", option="Medio";
          else color = "red", option="Alto";
        }
        return (
          <span style={{ color, fontWeight: "bold" }}>
            {isNaN(value) ? "N/A" : `${option} (${value})`}
          </span>
        );
      },
    },
    {
      field: "Residual",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Riesgo Residual
        </strong>
      ),
      renderCell: (data) => {
        const value = parseFloat(data.value);
        let color = "#000";
        let option = null;
        if (!isNaN(value)) {
          if (value <= 1.5) (color = "green"), (option = "Bajo");
          else if (value < 2.5) (color = "orange"), (option = "Medio");
          else (color = "red"), (option = "Alto");
        }
        return (
          <span style={{ color, fontWeight: "bold" }}>
            {isNaN(value) ? "N/A" : `${option} (${value})`}
          </span>
        );
      },
    },
    {
      field: "   ",
      headerAlign: "center",
      minWidth: 150,
      align: "center",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Ver controles
        </strong>
      ),
      renderCell: (params) => (
        <IconButton
          onClick={() => handleOpenControlsModal(params.row.Controles)}
          aria-label="Ver Controles"
        >
          <VisibilityIcon sx={{ color: "#333" }} />
        </IconButton>
      ),
    },
    /*{
      field: "  ",
      headerAlign: "center",
      minWidth: 150,
      align: "center",
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Ver procesos
        </strong>
      ),
      renderCell: (params) => (
        <IconButton
          onClick={() => handleOpenProcessesModal(params.row.Procesos)}
          aria-label="Ver Procesos"
        >
          <VisibilityIcon sx={{ color: "#333" }} />
        </IconButton>
      ),
    },*/
    {
      field: "Fecha",
      flex: 1,
      minWidth: 250,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Fecha de Actualización
        </strong>
      ),
    },
    {
      field: "Estado",
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Estado
        </strong>
      ),
      renderCell: (data) => {
        const status = statusOptions.find(
          (option) => option.label === data.value
        );
        const color = status ? status.color : "#000";
        return (
          <span
            style={{
              color,
              fontWeight: "bold",
            }}
          >
            {data.value}
          </span>
        );
      },
    },

    {
      field: "",
      headerAlign: "center",
      align: "center",
      width: 130,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Gestionar
        </strong>
      ),
      renderCell: (params) => (
        <Button
          component={Link}
          to={`/risks/manage-risks/edit-risk/${params.row.id}`}
          size="small"
        >
          <DriveFileRenameOutlineIcon sx={{ color: "#333" }} />
        </Button>
      ),
    },
  ];

  if (loading) {
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
      <TableDesign
        title="Lista de Riesgos"
        buttonLink="/risks/manage-risks/create-risk"
        rows={rows}
        columns={columns}
        limit={limitPage}
        rowHeight={"auto"}
      />

      <ControlsModal
        open={openControlsModal}
        onClose={handleCloseControlsModal}
        title={`Informacion de los controles`}
        items={selectedControls}
      />

      <ProcessesModal
        open={openProcessesModal}
        onClose={handleCloseProcessesModal}
        title={`Informacion de los procesos`}
        items={selectedProcesses}
      />

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

export default RiskCrud;

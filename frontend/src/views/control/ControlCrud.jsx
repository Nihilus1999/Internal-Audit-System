import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { getControls } from "@/services/Control";
import TableDesign from "@/common/template/TableDesign";
import Control from "@/models/Control";
import RisksModal from "@/views/control/RisksModal";
import ProcessesModal from "@/views/risk/ProcessesModal";
import { teoric_effectivenessOptions, statusOptions } from "@/utils/HelpersLib";

const ControlCrud = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openRisksModal, setOpenRisksModal] = useState(false);
  const [openProcessesModal, setOpenProcessesModal] = useState(false);
  const [selectedRisks, setSelectedRisks] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState([]);

  const limitPage = 10;

  useEffect(() => {
    fetchControls();
  }, []);

  const fetchControls = async () => {
    try {
      const data = await getControls();
      const control = data.map((item) => new Control(item));
      const controlRows = control.map((item) => ({
        id: item.slug,
        Codigo: item.slug,
        Nombre: item.name,
        TipoControl: item.control_type,
        TipoGestion: item.management_type,
        TipoEfectividad: item._teoric_effectiveness,
        Frecuencia: item.application_frequency,
        Riesgos: item.risks,
        Procesos: item.processes,
        ProcesosResponsables: Array.isArray(item.processes)
          ? item.processes.map((p) => p.name).join("\n")
          : "",
        Fecha: item._updated_at,
        Estado: item._status,
      }));
      setRows(controlRows);
    } catch (error) {
      setError(error.message || "No se pudo obtener los datos");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseProcessesModal = () => {
    setOpenProcessesModal(false);
  };

  const handleOpenRisksModal = (risks) => {
    setSelectedRisks(risks);
    setOpenRisksModal(true);
  };

  const handleCloseRisksModal = () => {
    setOpenRisksModal(false);
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
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Nombre del Control
        </strong>
      ),
    },
    {
      field: "ProcesosResponsables",
      flex: 1,
      minWidth: 250,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Procesos Responsables
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
      field: "TipoControl",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Tipo de Control
        </strong>
      ),
    },
    {
      field: "TipoGestion",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Tipo de Gestión
        </strong>
      ),
    },
    {
      field: "TipoEfectividad",
      flex: 1,
      minWidth: 250,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Efectividad teórica
        </strong>
      ),
      renderCell: (data) => {
        const status = teoric_effectivenessOptions.find(
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
      field: "Frecuencia",
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Frecuencia
        </strong>
      ),
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
          Ver riesgos
        </strong>
      ),
      renderCell: (params) => (
        <IconButton
          onClick={() => handleOpenRisksModal(params.row.Riesgos)}
          aria-label="Ver Riesgos"
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
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <IconButton
            component={Link}
            to={`/controls/manage-controls/edit-control/${params.row.id}`}
            size="small"
          >
            <DriveFileRenameOutlineIcon sx={{ color: "#333" }} />
          </IconButton>
        </Box>
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
        title="Lista de Controles"
        buttonLink="/controls/manage-controls/create-control"
        rows={rows}
        columns={columns}
        limit={limitPage}
        rowHeight={"auto"}
      />

      <RisksModal
        open={openRisksModal}
        onClose={handleCloseRisksModal}
        title={`Riesgos que contiene el control`}
        items={selectedRisks}
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

export default ControlCrud;

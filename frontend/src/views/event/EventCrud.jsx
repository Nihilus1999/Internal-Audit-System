import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { getEvents } from "@/services/Event";
import TableDesign from "@/common/template/TableDesign";
import Event from "@/models/Event";
import { criticalityOptions, statusEventsOptions } from "@/utils/HelpersLib";

const EventCrud = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const limitPage = 10;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      const event = data.map((item) => new Event(item));
      const userRows = event.map((item) => ({
        id: item.slug,
        Codigo: item.slug,
        Nombre: item.name,
        criticidad: item.criticality,
        Perdida: item.economic_loss ?? "0.00",
        FechaIncidente: item._incident_date,
        Estado: item._statusEventsOptions,
      }));
      setRows(userRows);
    } catch (error) {
      setError(error.message || "No se pudo obtener los datos");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError("");
  };

  const columns = [
    /*{
      field: "Codigo",
      flex: 1,
      minWidth: 100,
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
    },*/
    {
      field: "Nombre",
      flex: 1,
      minWidth: 300,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Nombre del Evento
        </strong>
      ),
    },
    {
      field: "criticidad",
      flex: 1,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Criticidad
        </strong>
      ),
      renderCell: (data) => {
        const status = criticalityOptions.find(
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
      field: "Perdida",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Perdida Economica
        </strong>
      ),
    },
    {
      field: "FechaIncidente",
      flex: 1,
      minWidth: 250,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Fecha del Incidente
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
          style={{
            textAlign: "center",
            width: "100%",
            display: "block",
            fontWeight: "bold",
          }}
        >
          Estado
        </strong>
      ),
    },
    {
      field: "   ",
      headerAlign: "center",
      align: "center",
      width: 150,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Gest. Datos
        </strong>
      ),
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <IconButton
            component={Link}
            to={`/events/manage-events/edit-event/${params.row.id}`}
            size="small"
          >
            <DriveFileRenameOutlineIcon sx={{ color: "#333" }} />
          </IconButton>
        </Box>
      ),
    },
    {
      field: " ",
      headerAlign: "center",
      align: "center",
      width: 200,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Gest. Documentos
        </strong>
      ),
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <IconButton
            component={Link}
            to={`/events/manage-events/manage-documents/${params.row.id}`}
            size="small"
          >
            <EditDocumentIcon sx={{ color: "#333" }} />
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
        title="Lista de Eventos"
        buttonLink="/events/manage-events/create-event"
        rows={rows}
        columns={columns}
        limit={limitPage}
        rowHeight={"auto"}
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

export default EventCrud;

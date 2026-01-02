import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  getEventBySlug,
  getEventDocuments,
  getEventDownloadDocuments,
  deleteEventDocuments,
} from "@/services/Event";
import EventTableDocument from "@/views/event/EventTableDocument";
import Document from "@/models/Document";
import ConfirmationDialog from "@/common/template/ConfirmModalDesign";

const EventDocumentCrud = () => {
  const { slug } = useParams();
  const [rows, setRows] = useState([]);
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [EventDocumentCrud, setEventDocumentCrud] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const limitPage = 10;

  useEffect(() => {
    fetchDocuments();
    if (EventDocumentCrud) setEventDocumentCrud(false);
  }, [slug, EventDocumentCrud]);

  const fetchDocuments = async () => {
    try {
      const dataEvent = await getEventBySlug(slug);
      setEventName(dataEvent.name);
      const dataDocument = await getEventDocuments(slug);
      const document = dataDocument.map((item) => new Document(item));
      const Rows = document.map((item) => ({
        id: item.id,
        Nombre: item.file_name,
        FechaSubida: item._created_at,
      }));
      setRows(Rows);
    } catch (error) {
      setError(error.message || "No se pudo obtener los documentos");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (row) => {
    setDocToDelete(row);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;

    try {
      await deleteEventDocuments(docToDelete.id);
      setRows((prev) => prev.filter((r) => r.id !== docToDelete.id));
      setSuccessMsg(`Documento "${docToDelete.Nombre}" eliminado con éxito`);
    } catch (err) {
      setError(err.message || "Error al eliminar el documento");
    } finally {
      setConfirmOpen(false);
      setDocToDelete(null);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError("");
    setSuccessMsg("");
  };

  const columns = [
    {
      field: "Nombre",
      flex: 1,
      minWidth: 300,
      headerAlign: "center",
      align: "center",
      renderHeader: () => <strong>Nombre del Documento</strong>,
    },
    {
      field: "FechaSubida",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => <strong>Fecha de Subida</strong>,
    },
    {
      field: "Descargar",
      headerAlign: "center",
      align: "center",
      width: 150,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <strong>Descargar</strong>,
      renderCell: (params) => (
        <IconButton
          onClick={async () => {
            try {
              const response = await getEventDownloadDocuments(params.row.id);
              const blob = response.data;
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = params.row.Nombre;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } catch (err) {
              setError(err.message || "Error al descargar");
              setSnackbarOpen(true);
            }
          }}
        >
          <FileDownloadIcon sx={{ color: "#333" }} />
        </IconButton>
      ),
    },
    {
      field: "Eliminar",
      headerAlign: "center",
      align: "center",
      width: 150,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => <strong>Eliminar</strong>,
      renderCell: (params) => (
        <IconButton onClick={() => handleDeleteClick(params.row)}>
          <DeleteIcon sx={{ color: "#333" }} />
        </IconButton>
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
      <EventTableDocument
        title={`Lista de Documentos - ${eventName}`}
        rows={rows}
        columns={columns}
        limit={limitPage}
        rowHeight={"auto"}
        onUploadSuccess={() => setEventDocumentCrud(true)}
      />

      {/* Snackbar de error o éxito */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={error ? "error" : "success"}
          onClose={handleCloseSnackbar}
          sx={{ fontWeight: "bold" }}
        >
          {error || successMsg}
        </Alert>
      </Snackbar>

      {/* Modal personalizada de confirmación */}
      <ConfirmationDialog
        open={confirmOpen}
        title="Confirmar Eliminación"
        message={`¿Deseas eliminar "${docToDelete?.Nombre}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDocToDelete(null);
        }}
      />
    </>
  );
};

export default EventDocumentCrud;

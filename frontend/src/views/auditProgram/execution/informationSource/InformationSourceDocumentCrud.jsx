import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { getInformationSourceDocuments, getInformationSourceDownloadDocuments, getAuditTestBySlug } from "@/services/auditProgram/Execution";
import InformationSourceTableDocument from "@/views/auditProgram/execution/informationSource/InformationSourceTableDocument";
import Document from "@/models/Document";

const AuditTestDocumentCrud = () => {
  const { slugAuditTest } = useParams();
  const [rows, setRows] = useState([]);
  const [auditTest, auditTestTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [AuditTestDocumentCrud, setAuditProgramDocumentCrud] = useState(false);

  const limitPage = 10;

  useEffect(() => {
    fetchDocuments();
    if (AuditTestDocumentCrud) setAuditProgramDocumentCrud(false);
  }, [slugAuditTest, AuditTestDocumentCrud]);

  const fetchDocuments = async () => {
    try {
      const dataAuditTest = await getAuditTestBySlug(slugAuditTest);
      auditTestTitle(dataAuditTest.title);
      const dataDocument = await getInformationSourceDocuments(slugAuditTest);
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
              const response = await getInformationSourceDownloadDocuments(
                params.row.id
              );
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
      <InformationSourceTableDocument
        title={`Fuente de Información - ${auditTest}`}
        rows={rows}
        columns={columns}
        limit={limitPage}
        rowHeight={"auto"}
        onUploadSuccess={() => setAuditProgramDocumentCrud(true)}
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
    </>
  );
};

export default AuditTestDocumentCrud;

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { getFindings, getAuditTestBySlug } from "@/services/auditProgram/Execution";
import FindingTable from "@/views/auditProgram/execution/finding/FindingTable";
import Finding from "@/models/Finding";
import { statusOptions } from "@/utils/HelpersLib";

const FindingCrud = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditTest, auditTestTitle] = useState("");
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { slugAuditProgram, slugAuditTest } = useParams();
  const limitPage = 10;

  useEffect(() => {
    fetchFindings();
  }, []);

  const fetchFindings = async () => {
    try {
      const dataAuditTest = await getAuditTestBySlug(slugAuditTest);
      auditTestTitle(dataAuditTest.title);
      const data = await getFindings(slugAuditTest);
      const findings = data.map((item) => new Finding(item));
      const rows = findings.map((item) => ({
        id: item.slug,
        Nombre: item.title,
        CausaRaiz: item.root_cause,
        Tipo: item.finding_type,
        Clasificación: item.classification,
        Fecha: item._updated_at,
        Estado: item._status,
      }));
      setRows(rows);
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
          Nombre del Hallazgo
        </strong>
      ),
    },
    {
      field: "CausaRaiz",
      flex: 1,
      minWidth: 300,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Causa Raíz
        </strong>
      ),
    },
    {
      field: "Tipo",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Tipo de Hallazgo
        </strong>
      ),
    },
    {
      field: "Clasificación",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Clasificación
        </strong>
      ),
    },
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
          Fecha de actualización
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
      field: " ",
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
            to={`/audit-programs/manage-audit-programs/execution/${slugAuditProgram}/manage-findings/${slugAuditTest}/edit-finding/${params.row.id}`}
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
      <FindingTable
        title={`Hallazgos - ${auditTest}`}
        buttonLink={`/audit-programs/manage-audit-programs/execution/${slugAuditProgram}/manage-findings/${slugAuditTest}/create-finding`}
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

export default FindingCrud;

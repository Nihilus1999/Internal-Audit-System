import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { getAuditTests } from "@/services/auditProgram/Planning";
import TableDesign from "@/common/template/TableDesign";
import { statusAuditTestPlanningOptions } from "@/utils/HelpersLib";
import AuditTest from "@/models/AuditTest";

const AuditTestTabCrud = () => {
  const { slug } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const limitPage = 10;

  useEffect(() => {
    fetchAuditTests();
  }, []);

  const fetchAuditTests = async () => {
    try {
      const data = await getAuditTests(slug);
      const auditTest = data.map((item) => new AuditTest(item));
      const userRows = auditTest.map((item) => ({
        id: item.slug,
        Titulo: item.title,
        Objetivo: item.objective,
        Horas: item.estimated_hours,
        Estado: item.status,
        FechaInicio: item._start_date,
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
    {
      field: "Titulo",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Titulo de la Prueba
        </strong>
      ),
    },
    {
      field: "Objetivo",
      flex: 1,
      minWidth: 400,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Objetivo
        </strong>
      ),
    },
    {
      field: "Horas",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Horas estimadas
        </strong>
      ),
    },
    {
      field: "FechaInicio",
      flex: 1,
      minWidth: 250,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Fecha Inicio
        </strong>
      ),
    },
    {
      field: "Estado",
      flex: 1,
      minWidth: 200,
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
        const status = statusAuditTestPlanningOptions.find(
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
      renderCell: (params) => {
        const isDisabled =
          params.row.Estado === "En progreso" ||
          params.row.Estado === "Completado";

        return (
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            {isDisabled ? (
              <IconButton size="small" disabled>
                <DriveFileRenameOutlineIcon sx={{ color: "#aaa" }} />
              </IconButton>
            ) : (
              <IconButton
                component={Link}
                to={`/audit-programs/manage-audit-programs/planning/${slug}/edit-audit-test/${params.row.id}`}
                size="small"
              >
                <DriveFileRenameOutlineIcon sx={{ color: "#333" }} />
              </IconButton>
            )}
          </Box>
        );
      },
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
          Gest. Fuente
        </strong>
      ),
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <IconButton
            component={Link}
            to={`/audit-programs/manage-audit-programs/planning/${slug}/manage-documents/${params.row.id}`}
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
      <Box sx={{ width: "100%", mt: 3 }}>
        <TableDesign
          title="Pruebas de Auditoría"
          buttonLink={`/audit-programs/manage-audit-programs/planning/${slug}/create-audit-test`}
          rows={rows}
          columns={columns}
          limit={limitPage}
          rowHeight={"auto"}
          hideCreateButton={false}
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
      </Box>
    </>
  );
};

export default AuditTestTabCrud;

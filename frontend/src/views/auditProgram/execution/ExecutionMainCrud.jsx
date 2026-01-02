import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Button,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { getExecutionTests } from "@/services/auditProgram/Execution";
import { getAuditProgramBySlug } from "@/services/auditProgram/AuditProgram";
import AuditProgram from "@/models/AuditProgram";
import ExecutionMainTable from "@/views/auditProgram/execution/ExecutionMainTable";
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExecutionStatusModal from "./ExecutionStatusModal";
import ControlsModal from "./ControlsModal";
import { statusAuditTestExecutionOptions } from "@/utils/HelpersLib";
import AuditTest from "@/models/AuditTest";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSelector } from "react-redux";
import TestDetailsModal from "./TestDetailsModal";
import User from "@/models/User";

const ExecutionMain = () => {
  const { slugAuditProgram } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openControlsModal, setOpenControlsModal] = useState(false);
  const [program, setProgram] = useState("");
  const [selectedControls, setSelectedControls] = useState([]);
  const [executionStatus, setExecutionStatus] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const user = new User(useSelector((state) => state.auth.data));

  const limitPage = 10;

  const hasPermission = (requiredPermissions = []) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every((perm) =>
      user._permissions.includes(perm)
    );
  };

  useEffect(() => {
    fetchExecutionTests();
    if (executionStatus) setExecutionStatus(false);
  }, [slugAuditProgram, executionStatus]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenDetailsModal = (row) => {
    setSelectedTest(row);
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setOpenDetailsModal(false);
    setSelectedTest(null);
  };

  const fetchAuditProgram = async () => {
    try {
      const data = await getAuditProgramBySlug(slugAuditProgram);
      const auditProgram = new AuditProgram(data);
      setProgram(auditProgram);
    } catch (error) {
      setError(error.message || "Error al obtener los datos del programa.");
      setSnackbarOpen(true);
    }
  };

  const fetchExecutionTests = async () => {
    try {
      fetchAuditProgram();
      const data = await getExecutionTests(slugAuditProgram);
      const executionTest = data.map((item) => new AuditTest(item));
      const userRows = executionTest.map((item) => ({
        id: item.slug,
        Titulo: item.title,
        Objetivo: item.objective,
        Alcance: item.scope,
        Criterios: item.evaluation_criteria,
        Procedimiento: item.procedure,
        Controles: item.controls,
        Estado: item._status,
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
      field: "Detalles",
      headerAlign: "center",
      align: "center",
      minWidth: 250,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Detalles de la prueba
        </strong>
      ),
      renderCell: (params) => (
        <IconButton
          aria-label="Ver Controles"
          onClick={() => handleOpenDetailsModal(params.row)}
        >
          <AssignmentIcon sx={{ color: "#333" }} />
        </IconButton>
      ),
    },
    {
      field: "            ",
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
        const status = statusAuditTestExecutionOptions.find(
          (option) => option.value === data.value
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
      field: "   ",
      headerAlign: "center",
      align: "center",
      width: 250,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Fuente de Información
        </strong>
      ),
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <IconButton
            component={Link}
            to={`/audit-programs/manage-audit-programs/execution/${slugAuditProgram}/manage-information-source/${params.row.id}`}
            size="small"
          >
            <CollectionsBookmarkIcon sx={{ color: "#333" }} />
          </IconButton>
        </Box>
      ),
    },
    {
      field: "         ",
      headerAlign: "center",
      align: "center",
      width: 200,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Gest. Resultados
        </strong>
      ),
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <IconButton
            component={Link}
            to={`/audit-programs/manage-audit-programs/execution/${slugAuditProgram}/manage-evidence/${params.row.id}`}
            size="small"
          >
            <EditDocumentIcon sx={{ color: "#333" }} />
          </IconButton>
        </Box>
      ),
    },
    {
      field: "",
      headerAlign: "center",
      align: "center",
      width: 200,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Gest. Hallazgos
        </strong>
      ),
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <IconButton
            component={Link}
            to={`/audit-programs/manage-audit-programs/execution/${slugAuditProgram}/manage-findings/${params.row.id}/crud`}
            size="small"
          >
            <FindInPageIcon sx={{ color: "#333" }} />
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
      <Box
        sx={{
          backgroundColor: "#4a4a4a",
          border: "1px solid #444",
          borderRadius: 2,
          mb: 2,
          p: 3,
          maxWidth: "100%",
          margin: "0 auto",
        }}
      >
        <Box mb={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={{ xs: "center", sm: "flex-start" }}
            flexDirection={{ xs: "column", sm: "row" }}
            textAlign={{ xs: "center", sm: "left" }}
            gap={1}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" color="white">
                Ejecución - {program.name}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="white" mt={0.5}>
                Estatus:{" "}
                <Box
                  component="span"
                  sx={{
                    color: program._execution_status_color || "text.primary",
                    fontWeight: "bold",
                  }}
                >
                  {program.execution_status}
                </Box>
              </Typography>
            </Box>
            {hasPermission([
              "update.execution.audit_program",
              "update.status.audit_program",
            ]) && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenModal}
                sx={{
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  mt: { xs: 2, sm: 2 },
                  mr: { xs: 0, sm: 2 },
                  alignSelf: { xs: "center", sm: "flex-start" },
                }}
              >
                Gestionar Status
              </Button>
            )}
          </Box>
        </Box>
        <Box sx={{ width: "100%", mt: 3 }}>
          <ExecutionMainTable
            rows={rows}
            columns={columns}
            limit={limitPage}
            rowHeight={"auto"}
          />

          {/* Modal */}
          <ExecutionStatusModal
            open={openModal}
            onClose={handleCloseModal}
            onStatusSuccess={() => setExecutionStatus(true)}
          />

          <TestDetailsModal
            open={openDetailsModal}
            onClose={handleCloseDetailsModal}
            data={selectedTest}
          />

          <ControlsModal
            open={openControlsModal}
            onClose={handleCloseControlsModal}
            title={`Informacion de los controles`}
            items={selectedControls}
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
      </Box>
    </>
  );
};

export default ExecutionMain;

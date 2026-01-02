import { useState, useEffect } from "react";
import { Box, Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import TableDesign from "@/common/template/TableDesign";
import { getUserAuditProgramBySlug } from "@/services/auditProgram/AuditProgram";
import User from "@/models/User";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { statusOptions } from "@/utils/HelpersLib";
import BudgetedHoursModal from "@/views/auditProgram/planning/tabs/budgetedHoursTab/BudgetedHoursModal";

const BudgetedHoursTabCrud = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { slug } = useParams();

  const limitPage = 10;

  useEffect(() => {
    fetchUsersAuditProgram();
  }, [slug, modalOpen]);

  const fetchUsersAuditProgram = async () => {
    try {
      const data = await getUserAuditProgramBySlug(slug);
      const users = data.map((item) => new User(item));

      const usersRows = users.map((item) => {
        const totalHoras =
          item.audit_participant.planning_requirements_hours +
          item.audit_participant.test_execution_hours +
          item.audit_participant.document_evidence_hours +
          item.audit_participant.document_findings_hours +
          item.audit_participant.report_preparation_hours +
          item.audit_participant.report_revision_hours;

        return {
          id: item.id,
          Usuario: item.username,
          Nombre: item._fullName,
          Rol: item.role.name,
          Horas: totalHoras + " horas",
          Estado: item._status,
        };
      });
      setRows(usersRows);
    } catch (error) {
      setError(error.message || "No se pudo obtener los datos");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError("");
  };

  const columns = [
    {
      field: "Usuario",
      flex: 1,
      minWidth: 120,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Usuario
        </strong>
      ),
    },
    {
      field: "Nombre",
      flex: 1,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Nombre
        </strong>
      ),
    },
    {
      field: "Rol",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Rol del usuario
        </strong>
      ),
    },
    {
      field: "Horas",
      flex: 1,
      minWidth: 250,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong
          style={{ textAlign: "center", width: "100%", display: "block" }}
        >
          Horas presupuestadas
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
        return <span style={{ color, fontWeight: "bold" }}>{data.value}</span>;
      },
    },
    {
      field: "",
      headerAlign: "center",
      minWidth: 150,
      align: "center",
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
        <Button onClick={() => handleOpenModal(params.row)}>
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
    <Box sx={{ width: "100%", mt: 3 }}>
      <TableDesign
        title="Asignar horas presupuestadas por usuario"
        buttonLink="/company/manage-processes/create-process"
        rows={rows}
        columns={columns}
        limit={limitPage}
        rowHeight={"auto"}
        hideCreateButton={true}
      />

      <BudgetedHoursModal
        open={modalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
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
  );
};

export default BudgetedHoursTabCrud;

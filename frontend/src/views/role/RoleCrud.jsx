import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { getRoles } from "@/services/Role";
import TableDesign from "@/common/template/TableDesign";
import PermissionsModal from "@/views/role/PermissionsModal";
import Role from "@/models/Role";
import { statusOptions } from "@/utils/HelpersLib";

const RoleCrud = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [nameRole, setNameRole] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const limitPage = 10;

  useEffect(() => {
    fetchrole();
  }, []);

  const fetchrole = async () => {
    try {
      const data = await getRoles();
      const role = data.map((item) => new Role(item));
      const roleRows = role.map((item) => ({
        id: item.id,
        Nombre: item.name,
        Fecha: item._updated_at,
        Estado: item._status,
        Permisos: item._permissions || [],
      }));
      setRows(roleRows);
    } catch (error) {
      setError(error.message || "No se pudo obtener los datos");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (permission, nameRole) => {
    setNameRole(nameRole);
    setSelectedPermissions(permission);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError("");
  };

  const columns = [
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
          Nombre del Rol
        </strong>
      ),
    },
    {
      field: "Fecha",
      flex: 1,
      minWidth: 150,
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
          Ver permisos
        </strong>
      ),
      renderCell: (params) => (
        <IconButton
          onClick={() =>
            handleOpenModal(params.row.Permisos, params.row.Nombre)
          }
          aria-label="Ver Permisos"
        >
          <VisibilityIcon sx={{ color: "#333" }} />
        </IconButton>
      ),
    },
    {
      field: " ",
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
        <Button
          component={Link}
          to={`/admin/manage-roles/edit-role/${params.row.id}`}
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
    <Box sx={{ width: "100%" }}>
      <TableDesign
        title="Lista de Roles"
        buttonLink="/admin/manage-roles/create-role"
        rows={rows}
        columns={columns}
        limit={limitPage}
        rowHeight={'auto'}
      />

      <PermissionsModal
        open={openModal}
        onClose={handleCloseModal}
        title={`Permisos del ${nameRole}`}
        items={selectedPermissions}
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

export default RoleCrud;

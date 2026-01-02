import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { getUsers } from "@/services/User";
import UserTable from "@/views/user/UserTable";
import User from "@/models/User";
import { statusOptions } from "@/utils/HelpersLib";
import { useSelector } from "react-redux";
import Userdata from "@/models/User";

const UserCrud = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const user = new Userdata(useSelector((state) => state.auth.data));

  const limitPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const hasPermission = (requiredPermissions = []) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every((perm) =>
      user._permissions.includes(perm)
    );
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      const userModels = data.map((item) => new User(item));
      const userRows = userModels.map((item) => ({
        id: item.id,
        Usuario: item.username,
        Nombre: item._fullName,
        Correo: item.email,
        Rol: item.role.name,
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

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError("");
  };

  // === Todas las columnas, incluyendo “Gestionar” ===
  const columns = [
    {
      field: "Usuario",
      flex: 1,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong style={{ textAlign: "center", width: "100%", display: "block" }}>
          Usuario
        </strong>
      ),
    },
    {
      field: "Nombre",
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong style={{ textAlign: "center", width: "100%", display: "block" }}>
          Nombre Completo
        </strong>
      ),
    },
    {
      field: "Correo",
      flex: 1,
      minWidth: 300,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong style={{ textAlign: "center", width: "100%", display: "block" }}>
          Correo Electrónico
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
        <strong style={{ textAlign: "center", width: "100%", display: "block" }}>
          Rol del Usuario
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
        <strong style={{ textAlign: "center", width: "100%", display: "block" }}>
          Fecha de Actualización
        </strong>
      ),
    },
    {
      field: "Estado",
      flex: 1,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <strong style={{ textAlign: "center", width: "100%", display: "block" }}>
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
    // === Columna “Gestionar” (visible solo si tiene permiso) ===
    {
      field: "acciones",
      headerAlign: "center",
      align: "center",
      width: 150,
      sortable: false,
      disableColumnMenu: true,
      permission: "update.user", // propiedad personalizada
      renderHeader: () => (
        <strong style={{ textAlign: "center", width: "100%", display: "block" }}>
          Gestionar
        </strong>
      ),
      renderCell: (params) => (
        <Button
          component={Link}
          to={`/admin/manage-users/edit-user/${params.row.id}`}
          size="small"
        >
          <DriveFileRenameOutlineIcon sx={{ color: "#333" }} />
        </Button>
      ),
    },
  ];

  // === Filtrar columnas según permiso ===
  const visibleColumns = columns.filter((col) => {
    if (!col.permission) return true; // sin permiso = siempre visible
    return hasPermission([col.permission]); // validar permiso antes de mostrar
  });

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
      <UserTable
        title="Lista de Usuarios"
        buttonLink="/admin/manage-users/create-user"
        rows={rows}
        columns={visibleColumns}
        limit={limitPage}
        rowHeight={35}
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

export default UserCrud;
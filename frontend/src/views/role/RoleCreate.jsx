import { useForm } from "react-hook-form";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Alert,
  Stack,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import ButtonDesign from "@/common/template/ButtonDesign";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPermissions, createRole } from "@/services/Role";
import PermissionListCheck from "./PermissionListCheck";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";

const RoleCreate = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const permsData = await getPermissions();
      setPermissions(permsData);
    } catch (error) {
      setError(error.message || "Error al obtener permisos");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    const formData = getValues();
    if (!formData.ids_permission || formData.ids_permission.length === 0) {
      setError("Debe seleccionar al menos un permiso");
      return;
    }
    setError("");
    setOpenConfirmModalDesign(true);
  };

  const handleCancel = () => {
    setOpenConfirmModalDesign(false);
  };

  const handleConfirm = async () => {
    const formData = getValues();
    setOpenConfirmModalDesign(false);
    setError("");
    setSuccess("");

    try {
      const success = await createRole(formData);
      setSuccess(success);
      setSnackbarOpen(true);
      setTimeout(() => navigate("/admin/manage-roles/crud"), 2000);
    } catch (error) {
      setError(error.message || "Error al crear el rol");
    }
  };

  if (loading)
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

  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={2}>
      <Paper elevation={10} sx={{ p: 4, width: 500 }}>
        <Stack spacing={3} alignItems="center" sx={{ width: "100%" }}>
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Creación del Rol
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Ingresa los datos para crear un nuevo rol.
          </Typography>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: "100%" }}
          >
            {/* Nombre del rol */}
            <TextField
              fullWidth
              label="Nombre del rol"
              {...register("name", { required: "Este campo es obligatorio" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 2 }}
            />

            {/* Lista de permisos */}
            <PermissionListCheck
              permisos={permissions}
              selectedPerms={selectedPermissions}
              setSelectedPerms={(selected) => {
                setSelectedPermissions(selected);
                setValue(
                  "ids_permission",
                  selected.map((p) => p.id)
                );
              }}
            />

            {/* Campo oculto para ids_permission */}
            <input type="hidden" {...register("ids_permission")} />

            <ButtonDesign>
              Crear Rol
            </ButtonDesign>
          </form>
          {error && <Alert severity="error" sx={{fontWeight: "bold"}}>{error}</Alert>}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación de creación del rol"
        message="¿Estás seguro de que deseas crear este rol con estos datos?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ fontWeight: "bold" }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoleCreate;

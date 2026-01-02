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
  Autocomplete,
} from "@mui/material";
import ButtonDesign from "@/common/template/ButtonDesign";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoleById, updateRole, getPermissions } from "@/services/Role";
import PermissionListCheck from "./PermissionListCheck";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import { statusOptions } from "@/utils/HelpersLib";

const RoleUpdate = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    watch,
  } = useForm();

  const { id } = useParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRole();
  }, [id, setValue]);

  const fetchRole = async () => {
    try {
      const role = await getRoleById(id);
      const permsData = await getPermissions();
      setPermissions(permsData);
      setValue("name", role.name);
      setValue("status", role.status);
      setValue(
        "ids_permission",
        role.permissions.map((perm) => perm.id)
      );

      const selected = permsData.filter((perm) =>
        role.permissions.some((p) => p.id === perm.id)
      );
      setSelectedPermissions(selected);
    } catch (error) {
      setError(error.message || "Error al obtener el rol");
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
    setSuccess("");
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
      const success = await updateRole(id, formData);
      setSuccess(success);
      setSnackbarOpen(true);
      setTimeout(() => navigate("/admin/manage-roles/crud"), 2000);
    } catch (error) {
      setError(error.message || "Error al actualziar el rol");
      setSnackbarOpen(true);
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
            Actualización del Rol
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Modifica los datos del rol existente.
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

            {/* Estado */}
            <Autocomplete
              disablePortal
              options={statusOptions}
              getOptionLabel={(option) => option.label}
              value={statusOptions.find(
                (option) => option.value === watch("status")
              )}
              onChange={(_, newValue) => {
                setValue("status", newValue?.value ?? false);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Estado" sx={{ mb: 2 }} />
              )}
              sx={{ mb: 2, width: "100%" }}
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

            <input type="hidden" {...register("ids_permission")} />

            <ButtonDesign>
              Actualizar Rol
            </ButtonDesign>
          </form>
          {error && <Alert severity="error" sx={{fontWeight: "bold"}}>{error}</Alert>}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación de actualizar rol"
        message="¿Estás seguro de que deseas actualizar los datos de este rol?"
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

export default RoleUpdate;

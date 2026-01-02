import { useForm, Controller } from "react-hook-form";
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
  Checkbox,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import User from "@/models/User";
import Process from "@/models/Process";
import { getActiveUsers } from "@/services/User";
import { getProcessById, updateProcess } from "@/services/Company";
import { statusOptions } from "@/utils/HelpersLib";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const ProcessUpdate = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
    watch,
  } = useForm();

  const { slug } = useParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProcess();
  }, [slug, setValue]);

  const fetchProcess = async () => {
    try {
      const processData = await getProcessById(slug);
      const process = new Process(processData);
      const usersData = await getActiveUsers();
      const allUsers = usersData.map((u) => new User(u));
      const selected = allUsers.filter((user) =>
        process.users.some((processUser) => processUser.id === user.id)
      );
      setUsers(allUsers);
      setValue("name", process.name);
      setValue("objective", process.objective);
      setValue("description", process.description);
      setValue(
        "ids_user",
        selected.map((user) => user.id)
      );
      setValue("status", process.status);
    } catch (error) {
      setError(error.message || "Error al cargar el proceso");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    const formData = getValues();
    setOpenConfirmModalDesign(false);
    setError("");
    setSuccess("");
    try {
      const successMessage = await updateProcess(slug, formData);
      setSuccess(successMessage);
      setSnackbarOpen(true);
      setTimeout(() => navigate("/company/manage-processes/crud"), 2000);
    } catch (error) {
      setError(error.message || "Error al actualizar el proceso");
    }
  };

  const handleFormSubmit = () => {
    setOpenConfirmModalDesign(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setOpenConfirmModalDesign(false);
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
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Actualización del Proceso
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Modifica los datos del proceso existente.
          </Typography>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: "100%" }}
          >
            {/* Nombre del proceso */}
            <TextField
              fullWidth
              label="Nombre del proceso"
              {...register("name", { required: "Este campo es obligatorio" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 2 }}
            />
            {/* Objetivo del proceso */}
            <TextField
              fullWidth
              label="Objetivo"
              multiline
              rows={2}
              {...register("objective", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.objective}
              helperText={errors.objective?.message}
              sx={{ mb: 2 }}
            />
            {/* Descripcion del proceso */}
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              {...register("description", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
              sx={{ mb: 2 }}
            />

            {/* ComboBox simple para Status */}
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

            {/* Autocomplete multiple para usuarios */}
            <Controller
              name="ids_user"
              control={control}
              rules={{ required: "Selecciona al menos un responsable" }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  options={users}
                  limitTags={2}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option._fullName}
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={users.filter((u) => value?.includes(u.id))}
                  onChange={(_, selectedOptions) => {
                    const ids = selectedOptions.map((u) => u.id);
                    onChange(ids);
                  }}
                  renderOption={(props, option, { selected }) => {
                    const { key, ...rest } = props;
                    return (
                      <li key={key} {...rest}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {`${option.first_name} ${option.last_name}`}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Responsables"
                      placeholder="Selecciona usuarios"
                      error={!!errors.ids_user}
                      helperText={errors.ids_user?.message}
                    />
                  )}
                />
              )}
            />

            <input
              type="hidden"
              {...register("ids_user", {
                validate: (value) =>
                  value && value.length > 0
                    ? true
                    : "Debe seleccionar al menos un responsable",
              })}
            />

            <ButtonDesign>Actualizar Proceso</ButtonDesign>
          </form>

          {error && (
            <Alert severity="error" sx={{ fontWeight: "bold" }}>
              {error}
            </Alert>
          )}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación del actualizar proceso"
        message="¿Estás seguro de que deseas actualizar los datos del proceso?"
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

export default ProcessUpdate;

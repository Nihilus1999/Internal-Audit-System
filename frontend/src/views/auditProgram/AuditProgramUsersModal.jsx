import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  Checkbox,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Autocomplete from "@mui/material/Autocomplete";
import User from "@/models/User";
import { getAuditUsers } from "@/services/User";
import {
  updateUserAuditProgram,
  getUserAuditProgramBySlug,
} from "@/services/auditProgram/AuditProgram";
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function SuspendAuditProgramModal({ open, onClose, onUserSuccess }) {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({});

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  useEffect(() => {
    if (open) {
      fetchAuditProgram(slug);
    }
  }, [open]);

  // Paso 1: obtener usuarios y precargar seleccionados
  const fetchParticipants = async (assignedData) => {
    try {
      const data = await getAuditUsers();
      const allUsers = data.map((u) => new User(u));
      const selected = allUsers.filter((user) =>
        assignedData.some((assigned) => assigned.id === user.id)
      );
      setUsers(allUsers);
      setValue(
        "ids_user",
        selected.map((u) => u.id)
      );
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        error.message || "Error al obtener los participantes."
      );
      setSnackbarOpen(true);
    }
  };

  // Paso 2: obtener datos del programa
  const fetchAuditProgram = async () => {
    try {
      const assigned = await getUserAuditProgramBySlug(slug);
      await fetchParticipants(assigned);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Error al cargar los participantes.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    try {
      const message = await updateUserAuditProgram(formData, slug);
      setSnackbarSeverity("success");
      setSnackbarMessage(message);
      setSnackbarOpen(true);

       if (onUserSuccess) {
        onUserSuccess();
      }

    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Error al actualizar participantes.");
      setSnackbarOpen(true);
    } finally {
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        keepMounted
        fullWidth
        maxWidth="sm"
        slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            padding: 2,
          },
        },
      }}
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography
              variant="h6"
              mb={2}
              sx={{ textAlign: "center", fontWeight: "bold" }}
            >
              Seleccionar Participantes
            </Typography>

            <Controller
              name="ids_user"
              control={control}
              rules={{ required: "Selecciona al menos un participante" }}
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
                        {`${option._fullName}`}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Participantes"
                      placeholder="Selecciona participantes"
                      error={!!errors.ids_user}
                      helperText={errors.ids_user?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              )}
            />

            <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
              <Button
                variant="contained"
                type="submit"
                sx={{
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Guardar Participantes
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                sx={{
                  borderRadius: "20px",
                  px: "20px",
                  py: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
                onClick={onClose}
              >
                Cancelar
              </Button>
            </Stack>
          </form>
        )}
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity} sx={{ fontWeight: "bold" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

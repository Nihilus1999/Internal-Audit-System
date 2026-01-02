import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Checkbox,
  Autocomplete,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Paper,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Control from "@/models/Control";
import { getActiveControls } from "@/services/Control";
import { updateControlsPlanning } from "@/services/auditProgram/Planning"
import { getAuditProgramBySlug } from "@/services/auditProgram/AuditProgram"
import AuditProgram from "@/models/AuditProgram";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const ControlTab = () => {
  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({});

  const [error, setError] = useState("");
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [success, setSuccess] = useState("");
  const { slug } = useParams();

  useEffect(() => {
    fetchAuditProgram();
  }, []);

  const fetchControls = async (auditProgramControls) => {
    try {
      const data = await getActiveControls();
      const controls = data.map((item) => new Control(item));
      const allControls = controls.map((u) => new Control(u));
      const selected = allControls.filter((controls) =>
        auditProgramControls.some((AuditProgramControls) => AuditProgramControls.id === controls.id)
      );
      setProcesses(allControls);
      setValue(
        "ids_control",
        selected.map((controls) => controls.id)
      );
    } catch (error) {
      setError(error.message || "Error al obtener los controles");
    }
  };

  const fetchAuditProgram = async () => {
    try {
      const data = await getAuditProgramBySlug(slug);
      const auditProgramData = new AuditProgram(data);
      fetchControls(auditProgramData.controls)
    } catch (error) {
      setError(error.message || "Error al cargar los controles del programa de auditoria.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
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
      const success = await updateControlsPlanning(formData, slug);
      setSuccess(success);
      setSnackbarOpen(true);
    } catch (error) {
      setError(error.message || "Error al actualziar los controles del programa de auditoria");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ p: 3 }}
    >
      <Paper elevation={5}>
        <Stack spacing={3} alignItems="center" sx={{ padding: 4, width: 600 }}>
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Controles asociados a este programa de auditoría
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Agrega los controles que estén asociados al este programa de auditoría.
          </Typography>

          <form
            style={{ width: "100%" }}
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            <Controller
              name="ids_control"
              control={control}
              rules={{ required: "Selecciona al menos un control" }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  options={processes}
                  limitTags={5}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={processes.filter((r) => value?.includes(r.id))}
                  onChange={(_, selectedOptions) => {
                    const ids = selectedOptions.map((r) => r.id);
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
                        {option.name}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField sx={{mb:2}}
                      {...params}
                      label="Controles asociados"
                      placeholder="Selecciona control"
                      error={!!errors.ids_control}
                      helperText={errors.ids_control?.message}
                    />
                  )}
                />
              )}
            />
            <ButtonDesign variant="contained" type="submit" fullWidth >
              Guardar cambios
            </ButtonDesign>
          </form>
          {error && <Alert severity="error" sx={{ fontWeight: "bold" }}>{error}</Alert>}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación de actualizar control"
        message="¿Estás seguro de que deseas actualizar los controles de este programa de auditoria?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
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

export default ControlTab;
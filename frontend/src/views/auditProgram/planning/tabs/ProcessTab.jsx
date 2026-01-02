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
import Process from "@/models/Process";
import { getActiveProcess } from "@/services/Company";
import { updateProcessPlanning } from "@/services/auditProgram/Planning"
import { getAuditProgramBySlug } from "@/services/auditProgram/AuditProgram"
import AuditProgram from "@/models/AuditProgram";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const ProcessTab = () => {
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

  const fetchProcess = async (auditProgramProcess) => {
    try {
      const data = await getActiveProcess();
      const process = data.map((item) => new Process(item));
      const allProcess = process.map((u) => new Process(u));
      const selected = allProcess.filter((process) =>
        auditProgramProcess.some((AuditProgramProcess) => AuditProgramProcess.id === process.id)
      );
      setProcesses(allProcess);
      setValue(
        "ids_process",
        selected.map((process) => process.id)
      );
    } catch (error) {
      setError(error.message || "Error al obtener los procesos");
    }
  };

  const fetchAuditProgram = async () => {
    try {
      const data = await getAuditProgramBySlug(slug);
      const auditProgramData = new AuditProgram(data);
      fetchProcess(auditProgramData.processes)
    } catch (error) {
      setError(error.message || "Error al cargar los procesos del programa de auditoria.");
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
      const success = await updateProcessPlanning(formData, slug);
      setSuccess(success);
      setSnackbarOpen(true);
    } catch (error) {
      setError(error.message || "Error al actualziar los procesos del programa de auditoria");
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
            Procesos asociados a este programa de auditoría
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Agrega los procesos que estén asociados al este programa de auditoría.
          </Typography>

          <form
            style={{ width: "100%" }}
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            <Controller
              name="ids_process"
              control={control}
              rules={{ required: "Selecciona al menos un proceso" }}
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
                      label="Procesos afectados"
                      placeholder="Selecciona proceso"
                      error={!!errors.ids_process}
                      helperText={errors.ids_process?.message}
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
        title="Confirmación de actualizar controles"
        message="¿Estás seguro de que deseas actualizar los procesos de este programa de auditoria?"
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

export default ProcessTab;
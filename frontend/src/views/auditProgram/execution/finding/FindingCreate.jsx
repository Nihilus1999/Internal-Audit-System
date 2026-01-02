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
  Checkbox,
  Autocomplete,
} from "@mui/material";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import { useEffect, useState } from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useNavigate, useParams } from "react-router-dom";
import Control from "@/models/Control";
import { getControlsAuditTestBySlug } from "@/services/auditProgram/Execution";
import { createFinding } from "@/services/auditProgram/Execution";
import {
  findingClassificationOptions,
  findingTypeOptions,
} from "@/utils/HelpersLib";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const FindingCreate = () => {
  
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm({});

  const { slugAuditProgram, slugAuditTest } = useParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchControls();
  }, []);

  const fetchControls = async () => {
    try {
      const data = await getControlsAuditTestBySlug(slugAuditTest);
      const control = data.map((item) => new Control(item));
      setControls(control);
    } catch (error) {
      setError("Error al obtener los controles");
    } finally {
      setLoading(false);
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

  const handleConfirm = async () => {
    const formData = getValues();
    try {
      setOpenConfirmModalDesign(false);
      const successMessage = await createFinding(slugAuditTest, formData);
      setSuccess(successMessage);
      setSnackbarOpen(true);
      setTimeout(
        () => navigate(`/audit-programs/manage-audit-programs/execution/${slugAuditProgram}/manage-findings/${slugAuditTest}/crud`),
        2000
      );
    } catch (error) {
      setError(error.message || "Error al crear el hallazgo.");
    }
  };

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
    <Box display="flex" justifyContent="center" alignItems="center">
      <Paper elevation={10} sx={{ padding: 4, width: 500 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Creación del Hallazgo
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Llena los datos para registrar un nuevo Hallazgo.
          </Typography>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: "100%" }}
          >
            <TextField
              fullWidth
              label="Titulo del Hallazgo"
              {...register("title", { required: "Este campo es obligatorio" })}
              error={!!errors.title}
              helperText={errors.title?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Observaciones"
              multiline
              rows={3}
              {...register("observations", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.observations}
              helperText={errors.observations?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Causa raíz"
              multiline
              rows={3}
              {...register("root_cause", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.root_cause}
              helperText={errors.root_cause?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Posibles consecuencias"
              multiline
              rows={3}
              {...register("possible_consequences", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.possible_consequences}
              helperText={errors.possible_consequences?.message}
              sx={{ mb: 2 }}
            />

            <Controller
              name="ids_control"
              control={control}
              rules={{ required: "Selecciona al menos un control" }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  options={controls}
                  limitTags={2}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={controls.filter((u) => value?.includes(u.id))}
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
                        {`${option.name}`}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Controles"
                      placeholder="Selecciona controles"
                      error={!!errors.ids_control}
                      helperText={errors.ids_control?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              )}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Controller
                name="finding_type"
                control={control}
                rules={{ required: "Selecciona al menos un tipo de hallazgo" }}
                render={({ field }) => (
                  <Autocomplete
                    disablePortal
                    options={findingTypeOptions}
                    getOptionLabel={(option) => option.label}
                    value={
                      findingTypeOptions.find(
                        (option) => option.value === field.value
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.value ?? "");
                    }}
                    sx={{ flex: 1 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipo de hallazgo"
                        placeholder="Selecciona tipo de hallazgo"
                        error={!!errors.finding_type}
                        helperText={errors.finding_type?.message}
                        fullWidth
                      />
                    )}
                  />
                )}
              />
              <Controller
                name="classification"
                control={control}
                rules={{ required: "Selecciona al menos una clasificación" }}
                render={({ field }) => (
                  <Autocomplete
                    disablePortal
                    options={findingClassificationOptions}
                    getOptionLabel={(option) => option.label}
                    value={
                      findingClassificationOptions.find(
                        (option) => option.value === field.value
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.value ?? "");
                    }}
                    sx={{ flex: 1 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Clasificación"
                        placeholder="Selecciona clasificación"
                        error={!!errors.classification}
                        helperText={
                          errors.classification?.message
                        }
                        fullWidth
                      />
                    )}
                  />
                )}
              />
            </Box>

            <TextField
              fullWidth
              label="Recomendaciones y oportunidades de mejora"
              multiline
              rows={4}
              {...register("recommendations", {
                required: "Este campo es obligatorio",
              })}
              error={!!errors.recommendations}
              helperText={errors.recommendations?.message}
              sx={{ mb: 2 }}
            />

            <ButtonDesign>Crear Hallazgo</ButtonDesign>
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
        title="Confirmación de crear Hallazgo"
        message="¿Estás seguro de que deseas crear el hallazgo con esos datos?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
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

export default FindingCreate;

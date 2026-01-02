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
import Risk from "@/models/Risk";
import { getRiskBySlug, patchRiskForm } from "@/services/Risk";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const RiskForm3 = () => {
  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({});

  const [error, setError] = useState("");
  const [risk, setControl] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [success, setSuccess] = useState("");
  const { slug } = useParams();

  useEffect(() => {
    fetchRisk();
  }, []);

  const fetchControl = async (riskData) => {
    try {
      const data = await getActiveControls();
      const control = data.map((item) => new Control(item));
      const allControl = control.map((u) => new Control(u));
      const selected = allControl.filter((control) =>
        riskData.controls.some((riskData) => riskData.id === control.id)
      );
      setControl(allControl);
      setValue(
        "ids_control",
        selected.map((control) => control.id)
      );
    } catch (error) {
      setError(error.message || "Error al obtener los controles");
    }
  };

  const fetchRisk = async () => {
    try {
      const data = await getRiskBySlug(slug);
      const riskData = new Risk(data);
      fetchControl(riskData);
    } catch (error) {
      setError(error.message || "Error al cargar los datos del riesgos");
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
      const success = await patchRiskForm(slug, formData);
      setSuccess(success);
      setSnackbarOpen(true);
    } catch (error) {
      setError(error.message || "Error al actualziar el riesgo");
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
            Controles relacionados a este riesgo
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Agrega los controles que estén asociados a este riesgo.
          </Typography>

          <form
            style={{ width: "100%" }}
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            <Controller
              name="ids_control"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  options={risk}
                  limitTags={5}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  value={risk.filter((r) => value?.includes(r.id))}
                  onChange={(_, selectedOptions) => {
                    const ids = selectedOptions.map((r) => r.id);
                    onChange(ids);
                    // Guardar id y name de controles seleccionados
                    const selectedControls = selectedOptions.map((r) => ({
                      id: r.id,
                      name: r.name,
                      teoric_effectiveness: r.teoric_effectiveness,
                    }));
                    localStorage.setItem(
                      "selected_controls",
                      JSON.stringify(selectedControls)
                    );
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
                    <TextField
                      sx={{ mb: 2 }}
                      {...params}
                      label="Controles relacionados"
                      placeholder="Selecciona controles"
                      error={!!errors.ids_control}
                      helperText={errors.ids_control?.message}
                    />
                  )}
                />
              )}
            />
            <ButtonDesign variant="contained" type="submit" fullWidth>
              Guardar cambios
            </ButtonDesign>
          </form>
          {error && <Alert severity="error" sx={{fontWeight: "bold"}}>{error}</Alert>}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación de actualizar controles"
        message="¿Estás seguro de que deseas actualizar los controles de este riesgo?"
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

export default RiskForm3;

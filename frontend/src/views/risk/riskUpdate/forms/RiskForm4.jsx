import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { probabilityOptions, impactOptions } from "@/utils/HelpersLib";
import ButtonDesign from "@/common/template/ButtonDesign";
import ConfirmModalDesign from "@/common/template/ConfirmModalDesign";
import RiskCalculationModal from "@/views/risk/RiskCalculationModal";
import { getRiskBySlug, patchRiskForm } from "@/services/Risk";
import Risk from "@/models/Risk";

// Select reusable component
const SelectField = ({ name, control, label, options, error }) => (
  <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
    <InputLabel id={`${name}-label`}>{label}</InputLabel>
    <Controller
      name={name}
      control={control}
      rules={{ required: `El campo ${label} es obligatorio` }}
      render={({ field }) => (
        <Select
          labelId={`${name}-label`}
          label={label}
          {...field}
          value={field.value || ""}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      )}
    />
    <FormHelperText>{error?.message}</FormHelperText>
  </FormControl>
);

const RiskFormStep4 = () => {
  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({});
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [openConfirmModalDesign, setOpenConfirmModalDesign] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // Valores observados
  const probability = useWatch({ control, name: "probability" }) || "";
  const impact = useWatch({ control, name: "impact" }) || "";

  // Estados de cálculo
  const [inherentRisk, setInherentRisk] = useState("N/A");
  const [inherentScore, setInherentScore] = useState(0);
  const [controlsEffectiveness, setControlsEffectiveness] = useState("N/A");
  const [controlsScore, setControlsScore] = useState(0);
  const [residualRisk, setResidualRisk] = useState("N/A");
  const [residualScore, setResidualScore] = useState(0);
  const [localControls, setLocalControls] = useState([]);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const data = await getRiskBySlug(slug);
        const risk = new Risk(data);
        setValue("probability", risk.probability);
        setValue("impact", risk.impact);
      } catch (error) {
        setError("Error al cargar los datos del riesgo.");
      } finally {
        setLoading(false);
      }
    };

    fetchRisk();

    // Cargar controles desde localStorage
    try {
      const stored = localStorage.getItem("selected_controls");
      setLocalControls(stored ? JSON.parse(stored) : []);
    } catch {
      setLocalControls([]);
    }
  }, [slug]);

  useEffect(() => {
    const probMap = { Alta: 3, Media: 2, Baja: 1 };
    const impactMap = { Alto: 3, Medio: 2, Bajo: 1 };

    if (!probability || !impact) {
      setInherentRisk("N/A");
      setInherentScore(0);
      setControlsEffectiveness("N/A");
      setControlsScore(0);
      setResidualRisk("N/A");
      setResidualScore(0);
      return;
    }

    const probVal = probMap[probability] || 0;
    const impactVal = impactMap[impact] || 0;
    const iScore = (probVal + impactVal) / 2;
    setInherentScore(iScore);
    setInherentRisk(iScore <= 1.5 ? "Bajo" : iScore < 2.5 ? "Medio" : "Alto");

    const effectivenessValues = localControls.map((c) =>
      c.teoric_effectiveness === "Óptimo"
        ? 3
        : c.teoric_effectiveness === "Aceptable"
        ? 1
        : 0
    );
    const cScore =
      effectivenessValues.length > 0
        ? effectivenessValues.reduce((a, b) => a + b, 0) /
          effectivenessValues.length
        : 0;

    setControlsScore(cScore);
    setControlsEffectiveness(
      cScore < 1 ? "Deficiente" : cScore < 2.5 ? "Aceptable" : "Óptimo"
    );

    const rScore = iScore - cScore;
    setResidualScore(rScore);
    setResidualRisk(rScore <= 1.5 ? "Bajo" : rScore < 2.5 ? "Medio" : "Alto");
  }, [probability, impact, localControls]);

  const getColorRisk = (score) => {
    if (score <= 1.5) {
      return "#d0f0c0"; // verde claro
    } else if (score < 2.5) {
      return "#fff4cc"; // amarillo claro
    } else {
      return "#ffd6d6"; // rojo claro
    }
  };

  const getColorEffectiveness = (score) => {
    if (score >= 2.5) {
      return "#d0f0c0"; // verde claro
    } else if (score >= 1) {
      return "#fff4cc"; // amarillo claro
    } else {
      return "#ffd6d6"; // rojo claro
    }
  };

  const handleFormSubmit = () => {
    setError("");
    setSuccess("");
    setOpenConfirmModalDesign(true);
  };

  const handleCancel = () => setOpenConfirmModalDesign(false);

  const handleConfirm = async () => {
    const formData = getValues();
    setOpenConfirmModalDesign(false);
    setError("");
    setSuccess("");

    try {
      const msg = await patchRiskForm(slug, formData);
      setSuccess(msg);
      setSnackbarOpen(true);
    } catch (err) {
      setError(err.message || "Error al guardar los cálculos.");
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
      <Paper elevation={5} sx={{ padding: 4, width: 600 }}>
        <Box sx={{ mb: 4 }}>
          {/* Fila superior: cálculo a la derecha */}
          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <Typography variant="body2" sx={{ mr: 1 }}>
              Cálculos del riesgo
            </Typography>

            <Tooltip title="Ver explicación de los cálculos">
              <IconButton size="small" onClick={() => setOpenModal(true)}>
                <InfoOutlinedIcon color="primary" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Título centrado */}
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Evaluación del riesgo
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Coloque la probabilidad y el impacto que tiene este riesgo.
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Puede consultar las formulas presionando el boton de exclamación.
          </Typography>
        </Box>

        <Stack spacing={3} alignItems="center">
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: "100%" }}
          >
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box sx={{ flex: 1 }}>
                <SelectField
                  name="probability"
                  control={control}
                  label="Probabilidad"
                  options={probabilityOptions}
                  error={errors.probability}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SelectField
                  name="impact"
                  control={control}
                  label="Impacto"
                  options={impactOptions}
                  error={errors.impact}
                />
              </Box>
            </Box>

            <Box display="flex" gap={2} mt={1} mb={1}>
              <Box flex={1}>
                <Typography variant="subtitle1" align="center" mb={1}>
                  Riesgo Inherente
                </Typography>
                <TextField
                  fullWidth
                  value={
                    inherentRisk === "N/A"
                      ? "N/A"
                      : `${inherentRisk} (${inherentScore.toFixed(2)})`
                  }
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: getColorRisk(inherentScore) }}
                />
              </Box>

              <Box flex={1}>
                <Typography variant="subtitle1" align="center" mb={1}>
                  Efectividad Teórica
                </Typography>
                <TextField
                  fullWidth
                  value={
                    controlsEffectiveness === "N/A"
                      ? "N/A"
                      : `${controlsEffectiveness} (${controlsScore.toFixed(2)})`
                  }
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: getColorEffectiveness(controlsScore) }}
                />
              </Box>

              <Box flex={1}>
                <Typography variant="subtitle1" align="center" mb={1}>
                  Riesgo Residual
                </Typography>
                <TextField
                  fullWidth
                  value={
                    residualRisk === "N/A"
                      ? "N/A"
                      : `${residualRisk} (${residualScore.toFixed(2)})`
                  }
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: getColorRisk(residualScore) }}
                />
              </Box>
            </Box>

            <ButtonDesign type="submit" fullWidth>
              Guardar cambios
            </ButtonDesign>
          </form>

          {error && <Alert severity="error" sx={{fontWeight: "bold"}}>{error}</Alert>}
        </Stack>
      </Paper>

      <ConfirmModalDesign
        open={openConfirmModalDesign}
        title="Confirmación de actualización"
        message="¿Estás seguro de que deseas actualizar los cálculos del riesgo?"
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

      <RiskCalculationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </Box>
  );
};

export default RiskFormStep4;

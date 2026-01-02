import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { probabilityOptions, impactOptions } from "@/utils/HelpersLib";
import { useEffect, useState } from "react";
import { useWatch, Controller } from "react-hook-form";
import RiskCalculationModal from "@/views/risk/RiskCalculationModal";

const RiskStep4 = ({ control, errors }) => {
  const probability = useWatch({ control, name: "probability" }) || "";
  const impact = useWatch({ control, name: "impact" }) || "";

  const [inherentRisk, setInherentRisk] = useState("N/A");
  const [inherentScore, setInherentScore] = useState(0);

  const [controlsEffectiveness, setControlsEffectiveness] = useState("N/A");
  const [controlsScore, setControlsScore] = useState(0);

  const [residualRisk, setResidualRisk] = useState("N/A");
  const [residualScore, setResidualScore] = useState(0);

  const [localControls, setLocalControls] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const getColorRisk = (score) => {
    if (score <= 1.5) {
      return "#d0f0c0"; // verde
    }
    if (score < 2.5) {
      return "#fff4cc"; // amarillo
    }
    return "#ffd6d6"; // rojo
  };

  const getColorEfectiveness = (score) => {
    if (score >= 2.5) {
      return "#d0f0c0"; // verde
    }
    if (score >= 1) {
      return "#fff4cc"; // amarillo
    }
    return "#ffd6d6"; // rojo
  };

  // Cargar controles desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("selected_controls");
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocalControls(parsed);
      } else {
        setLocalControls([]);
      }
    } catch (error) {
      console.error("Error al leer controles del localStorage", error);
      setLocalControls([]);
    }
  }, []);

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

    const probValue = probMap[probability] || 0;
    const impactValue = impactMap[impact] || 0;

    const inherentRiskScore = (probValue + impactValue) / 2;
    setInherentScore(inherentRiskScore);

    if (inherentRiskScore <= 1.5) {
      setInherentRisk("Bajo");
    } else if (inherentRiskScore < 2.5) {
      setInherentRisk("Medio");
    } else {
      setInherentRisk("Alto");
    }

    const effectivenessValues = localControls.map((control) => {
      switch (control.teoric_effectiveness) {
        case "Óptimo":
          return 3;
        case "Aceptable":
          return 1;
        case "Deficiente":
          return 0;
        default:
          return 0;
      }
    });

    const controlEffectivenessScore =
      effectivenessValues.length > 0
        ? effectivenessValues.reduce((sum, val) => sum + val, 0) /
          effectivenessValues.length
        : 0;

    setControlsScore(controlEffectivenessScore);

    if (controlEffectivenessScore < 1) {
      setControlsEffectiveness("Deficiente");
    } else if (controlEffectivenessScore < 2.5) {
      setControlsEffectiveness("Aceptable");
    } else {
      setControlsEffectiveness("Óptimo");
    }

    const residualRiskScore = inherentRiskScore - controlEffectivenessScore;
    setResidualScore(residualRiskScore);

    if (residualRiskScore <= 1.5) {
      setResidualRisk("Bajo");
    } else if (residualRiskScore < 2.5) {
      setResidualRisk("Medio");
    } else {
      setResidualRisk("Alto");
    }
  }, [probability, impact, localControls]);

  return (
    <>
      <Box>
        {/* Fila superior: cálculo a la derecha */}
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          mb={1}
        >
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
            mb: 3,
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

      <Box display="flex" gap={2} mt={3}>
        <FormControl fullWidth error={!!errors.probability} sx={{ flex: 1 }}>
          <InputLabel id="probability">Probabilidad del riesgo</InputLabel>
          <Controller
            name="probability"
            control={control}
            rules={{ required: "La probabilidad del riesgo es obligatoria" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="probability"
                label="Probabilidad del riesgo"
                value={field.value || ""}
              >
                {probabilityOptions.map((prob) => (
                  <MenuItem key={prob.value} value={prob.value}>
                    {prob.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.probability && (
            <Typography variant="caption" color="error">
              {errors.probability.message}
            </Typography>
          )}
        </FormControl>

        <FormControl fullWidth error={!!errors.impact} sx={{ flex: 1 }}>
          <InputLabel id="impact">Impacto del riesgo</InputLabel>
          <Controller
            name="impact"
            control={control}
            rules={{ required: "El impacto del riesgo es obligatorio" }}
            render={({ field }) => (
              <Select
                {...field}
                labelId="impact"
                label="Impacto del riesgo"
                value={field.value || ""}
              >
                {impactOptions.map((imp) => (
                  <MenuItem key={imp.value} value={imp.value}>
                    {imp.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.impact && (
            <Typography variant="caption" color="error">
              {errors.impact.message}
            </Typography>
          )}
        </FormControl>
      </Box>

      <Box display="flex" gap={2} mt={4}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
            Riesgo Inherente
          </Typography>
          <TextField
            value={
              inherentRisk === "N/A"
                ? "N/A"
                : `${inherentRisk} (${inherentScore.toFixed(2)})`
            }
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{ backgroundColor: getColorRisk(inherentScore) }}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
            Efectividad teórica
          </Typography>
          <TextField
            value={
              controlsEffectiveness === "N/A"
                ? "N/A"
                : `${controlsEffectiveness} (${controlsScore.toFixed(2)})`
            }
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{ backgroundColor: getColorEfectiveness(controlsScore) }}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
            Riesgo Residual
          </Typography>
          <TextField
            value={
              residualRisk === "N/A"
                ? "N/A"
                : `${residualRisk} (${residualScore.toFixed(2)})`
            }
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{ backgroundColor: getColorRisk(residualScore) }}
          />
        </Box>
      </Box>
      {/* Modal */}
      <RiskCalculationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
};

export default RiskStep4;

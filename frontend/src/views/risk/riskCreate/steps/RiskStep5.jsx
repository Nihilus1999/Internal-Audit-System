import { useEffect, useState } from "react";
import { Typography, Box, Divider, Chip, Grid } from "@mui/material";
import { useWatch } from "react-hook-form";

const ResumenCampo = ({ label, value }) => (
  <Box mb={2}>
    <Typography variant="subtitle2" fontWeight="bold">
      {label}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      {value || "No especificado"}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Box>
);

const RiskStep5 = ({ control }) => {
  const formData = useWatch({ control });

  // Estados para los procesos y controles guardados
  const [savedProcesses, setSavedProcesses] = useState([]);
  const [savedControls, setSavedControls] = useState([]);

  useEffect(() => {
    // Leer de localStorage y parsear
    const processesFromStorage = JSON.parse(localStorage.getItem("selected_processes")) || [];
    const controlsFromStorage = JSON.parse(localStorage.getItem("selected_controls")) || [];

    setSavedProcesses(processesFromStorage);
    setSavedControls(controlsFromStorage);
  }, []);

  // Función para obtener nombre dado un id, buscando en savedProcesses o savedControls
  const getProcessNameById = (id) => {
    const process = savedProcesses.find((p) => p.id === id);
    return process ? process.name : id; // Si no está, muestra el id
  };

  const getControlNameById = (id) => {
    const control = savedControls.find((c) => c.id === id);
    return control ? control.name : id; // Si no está, muestra el id
  };

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ textAlign: "center", fontWeight: "bold" }}
      >
        Resumen de la creación del riesgo
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Revisa que todos los campos del riesgo esten correcto antes de confirmar.
      </Typography>

      <Box mt={3}>
        <ResumenCampo label="Nombre del Riesgo" value={formData?.name} />
        <ResumenCampo label="Descripción" value={formData?.description} />
        <ResumenCampo label="Fuente del Riesgo" value={formData?.risk_source} />
        <ResumenCampo
          label="Consecuencias Posibles"
          value={formData?.possible_consequences}
        />
        <ResumenCampo label="Origen" value={formData?.risk_origin} />
        <ResumenCampo label="Probabilidad" value={formData?.probability} />
        <ResumenCampo label="Impacto" value={formData?.impact} />

        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">
            Procesos Asociados
          </Typography>
          <Grid container spacing={1} mt={0.5}>
            {formData?.ids_process?.length > 0 ? (
              formData.ids_process.map((id) => (
                <Chip key={id} label={getProcessNameById(id)} size="small" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No se seleccionaron procesos
              </Typography>
            )}
          </Grid>
          <Divider sx={{ mt: 1 }} />
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">
            Controles Asociados
          </Typography>
          <Grid container spacing={1} mt={0.5}>
            {formData?.ids_control?.length > 0 ? (
              formData.ids_control.map((id) => (
                <Chip key={id} label={getControlNameById(id)} size="small" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No se seleccionaron controles
              </Typography>
            )}
          </Grid>
          <Divider sx={{ mt: 1 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default RiskStep5;

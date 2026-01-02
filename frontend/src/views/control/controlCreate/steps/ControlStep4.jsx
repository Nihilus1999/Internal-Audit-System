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

const ControlStep4 = ({ control }) => {
  const formData = useWatch({ control });

  // Estados para los procesos y controles guardados
  const [savedProcesses, setSavedProcesses] = useState([]);
  const [savedRisks, setSavedRisks] = useState([]);

  useEffect(() => {
    // Leer de localStorage y parsear
    const processesFromStorage = JSON.parse(localStorage.getItem("selected_processes")) || [];
    const controlsFromStorage = JSON.parse(localStorage.getItem("selected_risks")) || [];
    setSavedProcesses(processesFromStorage);
    setSavedRisks(controlsFromStorage);
  }, []);

  // Función para obtener nombre dado un id, buscando en savedProcesses o savedControls
  const getProcessNameById = (id) => {
    const process = savedProcesses.find((p) => p.id === id);
    return process ? process.name : id; // Si no está, muestra el id
  };

  const getRiskNameById = (id) => {
    const risk = savedRisks.find((c) => c.id === id);
    return risk ? risk.name : id; // Si no está, muestra el id
  };

  return (
    <>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ textAlign: "center", fontWeight: "bold" }}
      >
        Resumen de la creación del control
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Revisa que todos los campos del control esten correcto antes de confirmar
      </Typography>

      <Box mt={3}>
        <ResumenCampo label="Nombre del Control" value={formData?.name} />
        <ResumenCampo label="Descripción" value={formData?.description} />
        <ResumenCampo label="Tipo de Control" value={formData?.control_type} />
        <ResumenCampo
          label="Efectividad teorica"
          value={formData?.teoric_effectiveness}
        />
        <ResumenCampo label="Tipo de gestión" value={formData?.management_type} />
        <ResumenCampo label="Frecuencia de aplicación" value={formData?.application_frequency} />

        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">
            Procesos Responsables
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
            Riesgos Relacionados
          </Typography>
          <Grid container spacing={1} mt={0.5}>
            {formData?.ids_risk?.length > 0 ? (
              formData.ids_risk.map((id) => (
                <Chip key={id} label={getRiskNameById(id)} size="small" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No se seleccionaron riesgos
              </Typography>
            )}
          </Grid>
          <Divider sx={{ mt: 1 }} />
        </Box>
      </Box>
    </>
  );
};

export default ControlStep4;
